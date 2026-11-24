"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Columns3,
  Pencil,
  Plus,
  SearchX,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  clearCompletedTasks,
  selectTasks,
  selectTaskStats,
  setTaskStatus,
  TaskPriorityBadge,
  type Task,
  type TaskStatus,
} from "@/entities/task";
import { TaskFormDialog } from "@/features/task-upsert";
import { TaskFilterBar, type TaskFilterValues } from "@/features/task-filter";
import { TaskStatusSelect } from "@/features/task-status-change";
import { Badge, Button, Card, EmptyState } from "@/shared/ui";
import { TaskCompletionCheckbox } from "@/features/task-complete";
import { DeleteTaskButton } from "@/features/task-delete";
import { DuplicateTaskButton } from "@/features/task-duplicate";
import { selectProjects } from "@/entities/project";
import { getLocalDateKey } from "@/shared/lib/date";

const columns: { status: TaskStatus; title: string; tone: string }[] = [
  { status: "todo", title: "К выполнению", tone: "bg-[#718094]" },
  { status: "in-progress", title: "В работе", tone: "bg-[#66d9e8]" },
  { status: "review", title: "На проверке", tone: "bg-[#e8c36f]" },
  { status: "done", title: "Готово", tone: "bg-[#a5f36b]" },
];
const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
const initialFilters: TaskFilterValues = {
  search: "",
  status: "all",
  priority: "all",
  project: "all",
  sort: "due",
};

function dateLabel(value: string | null) {
  if (!value) return "Без срока";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}
function isOverdue(task: Task) {
  return Boolean(
    task.dueDate && task.dueDate < getLocalDateKey() && task.status !== "done",
  );
}

function TaskCard({
  task,
  onEdit,
  compact = false,
  onDragStart,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  compact?: boolean;
  onDragStart?: (taskId: string) => void;
}) {
  const projects = useAppSelector(selectProjects);
  const projectName =
    projects.find((project) => project.id === task.projectId)?.name ??
    "Без проекта";
  const overdue = isOverdue(task);
  return (
    <article
      draggable={Boolean(onDragStart)}
      onDragStart={() => onDragStart?.(task.id)}
      className="group rounded-xl border border-[#263442] bg-[#111923] p-3.5 transition hover:-translate-y-0.5 hover:border-[#465a66] hover:shadow-[0_12px_34px_#0003]"
    >
      <div className="flex items-start gap-2.5">
        <div className="pt-0.5">
          <TaskCompletionCheckbox task={task} />
        </div>
        <button
          onClick={() => onEdit(task)}
          className="min-w-0 flex-1 text-left"
          title="Редактировать задачу"
        >
          <h3
            className={`break-words text-xs font-semibold leading-5 text-[#e3ebf1] transition group-hover:text-white ${task.status === "done" ? "text-[#7e8b9a] line-through" : ""}`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[#7d8b9d]">
              {task.description}
            </p>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="grid size-7 place-items-center rounded-md text-[#8090a2] hover:bg-[#202b39] hover:text-white"
            aria-label="Редактировать"
          >
            <Pencil size={13} />
          </button>
          <DuplicateTaskButton taskId={task.id} />
          <DeleteTaskButton taskId={task.id} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <TaskPriorityBadge priority={task.priority} />
        {!compact && (
          <TaskStatusSelect
            taskId={task.id}
            status={task.status}
            className="h-7 w-auto min-w-28 border-0 bg-[#0b121b] px-2 text-[10px]"
          />
        )}
        {task.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="default" className="max-w-28 truncate">
            #{tag}
          </Badge>
        ))}
        {task.tags.length > 2 && (
          <span className="text-[9px] text-[#718094]">
            +{task.tags.length - 2}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#263442] pt-2.5">
        <span className="min-w-0 truncate text-[10px] text-[#8090a2]">
          {projectName}
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1 text-[10px] ${overdue ? "font-semibold text-[#f08b76]" : "text-[#8090a2]"}`}
        >
          <CalendarClock size={12} />
          {overdue ? "Просрочено · " : ""}
          {dateLabel(task.dueDate)}
        </span>
      </div>
    </article>
  );
}

export function TaskManager({
  globalSearch = "",
  openSignal = 0,
  onOpenSignalHandled,
  initialProjectId = null,
}: {
  globalSearch?: string;
  openSignal?: number;
  onOpenSignalHandled?: () => void;
  initialProjectId?: string | null;
}) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const stats = useAppSelector(selectTaskStats);
  const projects = useAppSelector(selectProjects);
  const [filters, setFilters] = useState<TaskFilterValues>({
    ...initialFilters,
    search: globalSearch,
    project: initialProjectId ?? "all",
  });
  const [view, setView] = useState<"list" | "board">("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickFilter, setQuickFilter] = useState<
    "all" | "active" | "completed" | "overdue"
  >("all");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    setFilters((current) => ({ ...current, search: globalSearch }));
  }, [globalSearch]);

  useEffect(() => {
    if (openSignal > 0) {
      setEditingTask(null);
      setDialogOpen(true);
      onOpenSignalHandled?.();
    }
  }, [openSignal, onOpenSignalHandled]);

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({ value: project.id, label: project.name })),
    [projects],
  );
  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );
  const filtered = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase("ru");
    const result = tasks.filter((task) => {
      const projectName = task.projectId
        ? (projectNames.get(task.projectId) ?? "")
        : "Без проекта";
      const searchable = [
        task.title,
        task.description,
        projectName,
        ...task.tags,
      ]
        .join(" ")
        .toLocaleLowerCase("ru");
      if (search && !searchable.includes(search)) return false;
      if (filters.status !== "all" && task.status !== filters.status)
        return false;
      if (filters.priority !== "all" && task.priority !== filters.priority)
        return false;
      if (filters.project === "none" && task.projectId !== null) return false;
      if (
        filters.project !== "all" &&
        filters.project !== "none" &&
        task.projectId !== filters.project
      )
        return false;
      if (quickFilter === "active" && task.status === "done") return false;
      if (quickFilter === "completed" && task.status !== "done") return false;
      if (quickFilter === "overdue" && !isOverdue(task)) return false;
      return true;
    });
    return result.sort((a, b) => {
      if (filters.sort === "newest")
        return b.createdAt.localeCompare(a.createdAt);
      if (filters.sort === "oldest")
        return a.createdAt.localeCompare(b.createdAt);
      if (filters.sort === "priority")
        return priorityRank[a.priority] - priorityRank[b.priority];
      if (filters.sort === "title") return a.title.localeCompare(b.title, "ru");
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, filters, quickFilter, projectNames]);

  function openCreate() {
    setEditingTask(null);
    setDialogOpen(true);
  }
  function openEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }
  function resetFilters() {
    setFilters({ ...initialFilters, search: globalSearch });
    setQuickFilter("all");
  }
  function dropOnStatus(status: TaskStatus) {
    if (!draggedTask) return;
    dispatch(setTaskStatus({ id: draggedTask, status }));
    setDraggedTask(null);
    toast.success("Статус задачи изменён");
  }

  return (
    <div className="task-manager-scroll space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[.15em] text-[#718094]">
            <span className="h-px w-4 bg-accent" /> ЛИЧНАЯ ПРОДУКТИВНОСТЬ
          </div>
          <h2 className="text-[clamp(22px,2vw,30px)] font-bold tracking-[-.045em]">
            Мои задачи<span className="text-accent">.</span>
          </h2>
          <p className="mt-1 text-xs text-[#8390a3]">
            Планируйте работу, следите за сроками и отмечайте результат.
            {initialProjectId
              ? ` Задачи выбранного проекта: ${projectNames.get(initialProjectId) ?? "проект"}.`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setView(view === "list" ? "board" : "list")}
          >
            <Columns3 size={15} />
            {view === "list" ? "Канбан-доска" : "Список"}
          </Button>
          <Button onClick={openCreate}>
            <Plus size={15} /> Новая задача
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 max-[760px]:grid-cols-2">
        <Card className="p-3.5">
          <div className="text-[10px] text-[#8290a1]">Всего задач</div>
          <div className="mt-1 text-2xl font-bold tracking-tight">
            {stats.total}
          </div>
          <div className="mt-1 text-[9px] text-[#68778a]">
            В вашем пространстве
          </div>
        </Card>
        <Card className="p-3.5">
          <div className="text-[10px] text-[#8290a1]">Активные</div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-[#83dce7]">
            {stats.active}
          </div>
          <div className="mt-1 text-[9px] text-[#68778a]">
            Ещё предстоит сделать
          </div>
        </Card>
        <Card className="p-3.5">
          <div className="text-[10px] text-[#8290a1]">Завершено</div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-accent">
            {stats.completed}
          </div>
          <div className="mt-1 text-[9px] text-[#68778a]">
            {stats.completionRate}% от всех задач
          </div>
        </Card>
        <Card className="p-3.5">
          <div className="text-[10px] text-[#8290a1]">Просрочено</div>
          <div
            className={`mt-1 text-2xl font-bold tracking-tight ${stats.overdue ? "text-[#f08b76]" : "text-[#dce5ec]"}`}
          >
            {stats.overdue}
          </div>
          <div className="mt-1 text-[9px] text-[#68778a]">Требуют внимания</div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        {(
          [
            ["all", "Все задачи", stats.total],
            ["active", "Активные", stats.active],
            ["completed", "Завершённые", stats.completed],
            ["overdue", "Просроченные", stats.overdue],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setQuickFilter(key)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition ${quickFilter === key ? "bg-[#a5f36b16] text-[#baf58d]" : "text-[#8290a1] hover:bg-[#151e29] hover:text-white"}`}
          >
            {label}
            <span className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-[9px]">
              {count}
            </span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 max-[650px]:ml-0">
          {stats.completed > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                dispatch(clearCompletedTasks());
                toast.success("Завершённые задачи очищены");
              }}
            >
              <Trash2 size={13} /> Очистить выполненные
            </Button>
          )}
        </div>
      </div>

      <TaskFilterBar
        value={filters}
        onChange={setFilters}
        projects={projectOptions}
        onReset={resetFilters}
        hasFilters={Boolean(
          filters.search ||
          filters.status !== "all" ||
          filters.priority !== "all" ||
          filters.project !== "all" ||
          quickFilter !== "all",
        )}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[#8290a1]">
          Найдено: <strong className="text-[#dce5ec]">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "задача" : "задач"}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#718094]">
          <Sparkles size={13} className="text-accent" /> Изменения сохраняются
          автоматически
        </div>
      </div>

      {view === "list" ? (
        filtered.length ? (
          <div className="grid grid-cols-2 gap-3 2xl:grid-cols-3 max-[760px]:grid-cols-1">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<SearchX size={21} />}
              title={tasks.length ? "Ничего не найдено" : "Пока нет задач"}
              description={
                tasks.length
                  ? "Попробуйте изменить фильтры или поисковый запрос."
                  : "Создайте первую задачу — здесь появится ваш личный план работы."
              }
              action={
                <Button onClick={openCreate}>
                  <Plus size={14} /> Создать задачу
                </Button>
              }
            />
          </Card>
        )
      ) : (
        <div className="grid grid-cols-4 items-start gap-3 2xl:gap-4 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
          {columns.map((column) => {
            const columnTasks = filtered.filter(
              (task) => task.status === column.status,
            );
            return (
              <section
                key={column.status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropOnStatus(column.status)}
                className={`min-h-64 rounded-xl border p-2.5 transition ${draggedTask ? "border-dashed border-[#647b70] bg-[#a5f36b08]" : "border-line bg-[#0d141d]"}`}
              >
                <div className="mb-3 flex items-center justify-between px-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${column.tone}`} />
                    <h3 className="text-xs font-bold text-[#dce5ec]">
                      {column.title}
                    </h3>
                  </div>
                  <Badge>{columnTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      compact
                      onDragStart={setDraggedTask}
                    />
                  ))}
                </div>
                {columnTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#2a3744] px-2 py-7 text-center text-[10px] text-[#68778a]">
                    Перетащите задачу сюда
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultProjectId={initialProjectId}
      />
    </div>
  );
}

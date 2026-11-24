"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FolderKanban,
  Pencil,
  Plus,
  SearchX,
  Sparkles,
} from "lucide-react";
import { useAppSelector } from "@/shared/lib";
import { selectProjectsWithStats } from "@/entities/project";
import type {
  Project,
  ProjectColor,
  ProjectWithStats,
} from "@/entities/project";
import { ProjectProgress } from "@/entities/project";
import { ProjectFormDialog } from "@/features/project-upsert";
import { DeleteProjectButton } from "@/features/project-delete";
import { Badge, Button, Card, EmptyState } from "@/shared/ui";

const colorStyles: Record<ProjectColor, { icon: string; label: string }> = {
  lime: { icon: "bg-[#a5f36b1b] text-[#baf58d]", label: "text-[#baf58d]" },
  cyan: { icon: "bg-[#66d9e81b] text-[#7fe4ee]", label: "text-[#7fe4ee]" },
  violet: { icon: "bg-[#ad91f51b] text-[#c4a6ff]", label: "text-[#c4a6ff]" },
  orange: { icon: "bg-[#f0a36c1b] text-[#f0b58c]", label: "text-[#f0b58c]" },
};

function ProjectCard({
  project,
  onEdit,
  onOpenTasks,
}: {
  project: ProjectWithStats;
  onEdit: (project: Project) => void;
  onOpenTasks: (projectId: string) => void;
}) {
  const styles = colorStyles[project.color];
  return (
    <Card className="group flex min-h-[250px] flex-col p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#40534a] hover:shadow-[0_12px_34px_#0003] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid size-10 place-items-center rounded-xl ${styles.icon}`}
        >
          <FolderKanban size={19} />
        </div>
        <div className="flex items-center gap-1 opacity-70 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(project)}
            aria-label={`Редактировать проект ${project.name}`}
            title="Редактировать"
            className="grid size-8 place-items-center rounded-lg text-[#8290a1] transition hover:bg-[#202b39] hover:text-white"
          >
            <Pencil size={14} />
          </button>
          <DeleteProjectButton
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full ${project.taskCount > 0 && project.progress === 100 ? "bg-accent" : "bg-[#718094]"}`}
        />
        <span
          className={`font-mono text-[9px] uppercase tracking-[.12em] ${styles.label}`}
        >
          {project.taskCount === 0
            ? "Ожидает задач"
            : project.progress === 100
              ? "Завершён"
              : "В работе"}
        </span>
      </div>
      <h3 className="mt-2 break-words text-sm font-bold tracking-tight text-[#e8eef3]">
        {project.name}
      </h3>
      <p className="mt-1 min-h-10 line-clamp-2 text-[10px] leading-5 text-[#8290a1]">
        {project.description || "Описание проекта пока не добавлено."}
      </p>
      <div className="mt-auto pt-5">
        <ProjectProgress
          color={project.color}
          progress={project.progress}
          completedCount={project.completedCount}
          taskCount={project.taskCount}
        />
        <button
          type="button"
          onClick={() => onOpenTasks(project.id)}
          className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent transition hover:gap-2.5"
        >
          Задачи проекта <ArrowRight size={13} />
        </button>
      </div>
    </Card>
  );
}

export function ProjectManager({
  globalSearch = "",
  openSignal = 0,
  onOpenSignalHandled,
  onOpenTasks,
}: {
  globalSearch?: string;
  openSignal?: number;
  onOpenSignalHandled?: () => void;
  onOpenTasks: (projectId: string) => void;
}) {
  const projects = useAppSelector(selectProjectsWithStats);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (openSignal > 0) {
      setEditingProject(null);
      setDialogOpen(true);
      onOpenSignalHandled?.();
    }
  }, [openSignal, onOpenSignalHandled]);

  const filteredProjects = useMemo(() => {
    const query = globalSearch.trim().toLocaleLowerCase("ru");
    if (!query) return projects;
    return projects.filter((project) =>
      `${project.name} ${project.description}`
        .toLocaleLowerCase("ru")
        .includes(query),
    );
  }, [projects, globalSearch]);

  const totalTasks = projects.reduce(
    (sum, project) => sum + project.taskCount,
    0,
  );
  const completedTasks = projects.reduce(
    (sum, project) => sum + project.completedCount,
    0,
  );
  const overallProgress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  function openCreate() {
    setEditingProject(null);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[.15em] text-[#718094]">
            <span className="h-px w-4 bg-accent" /> УПРАВЛЕНИЕ РАБОТОЙ
          </div>
          <h2 className="text-[clamp(22px,2vw,30px)] font-bold tracking-[-.045em]">
            Мои проекты<span className="text-accent">.</span>
          </h2>
          <p className="mt-1 text-xs text-[#8390a3]">
            Объединяйте задачи в проекты и следите за общим прогрессом.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={15} /> Создать проект
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <div className="text-[10px] text-[#8290a1]">Всего проектов</div>
            <strong className="mt-1 block text-2xl font-bold tracking-tight">
              {projects.length}
            </strong>
          </div>
          <span className="grid size-9 place-items-center rounded-lg bg-[#a5f36b14] text-accent">
            <FolderKanban size={17} />
          </span>
        </Card>
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <div className="text-[10px] text-[#8290a1]">Задач в проектах</div>
            <strong className="mt-1 block text-2xl font-bold tracking-tight">
              {totalTasks}
            </strong>
            <span className="text-[9px] text-[#68778a]">
              {completedTasks} завершено
            </span>
          </div>
          <span className="grid size-9 place-items-center rounded-lg bg-[#66d9e814] text-cyan">
            <Sparkles size={17} />
          </span>
        </Card>
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <div className="text-[10px] text-[#8290a1]">Общий прогресс</div>
            <strong className="mt-1 block text-2xl font-bold tracking-tight text-accent">
              {overallProgress}%
            </strong>
            <span className="text-[9px] text-[#68778a]">
              По выполненным задачам
            </span>
          </div>
          <div className="grid size-10 place-items-center rounded-full border-[3px] border-[#a5f36b] text-[10px] font-bold text-accent">
            {overallProgress}
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] tracking-[.13em] text-[#718094]">
            ВАШИ ПРОЕКТЫ
          </div>
          <h3 className="mt-1 text-sm font-bold">
            Список проектов{" "}
            <Badge className="ml-1">{filteredProjects.length}</Badge>
          </h3>
        </div>
        <span className="text-[10px] text-[#718094]">
          Прогресс обновляется автоматически
        </span>
      </div>

      {filteredProjects.length ? (
        <div className="grid grid-cols-3 gap-3 2xl:grid-cols-4 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onOpenTasks={onOpenTasks}
            />
          ))}
          {!globalSearch && (
            <button
              type="button"
              onClick={openCreate}
              className="flex min-h-[250px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#34434d] bg-[#0d141d70] text-[#aab7c3] transition hover:border-accent hover:text-[#c4f5a2]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-[#a5f36b14] text-accent">
                <Plus size={20} />
              </span>
              <strong className="text-[11px]">Добавить проект</strong>
              <small className="text-[9px] text-[#718094]">
                Создайте новое рабочее пространство
              </small>
            </button>
          )}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<SearchX size={21} />}
            title={projects.length ? "Проекты не найдены" : "Пока нет проектов"}
            description={
              projects.length
                ? "Измените поисковый запрос и попробуйте снова."
                : "Создайте первый проект, а затем привязывайте к нему задачи. Их процент выполнения будет рассчитываться автоматически."
            }
            action={
              !projects.length ? (
                <Button onClick={openCreate}>
                  <Plus size={14} /> Создать проект
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-[#263442] bg-[#101720] p-4 text-[10px] leading-5 text-[#8290a1]">
        <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-accent" />
        <p>
          Процент проекта рассчитывается как количество завершённых задач,
          делённое на общее количество задач проекта. Задачи без проекта не
          влияют на прогресс ни одного проекта. Если удалить проект, его задачи
          останутся в системе без привязки.
        </p>
      </div>

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Tag, Text, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { addTask, updateTask } from "@/entities/task";
import type { Task, TaskPriority, TaskStatus } from "@/entities/task";
import { selectProjects } from "@/entities/project";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Select,
  Textarea,
} from "@/shared/ui";

const NO_PROJECT = "__no_project__";
const statusOptions = [
  { value: "todo", label: "К выполнению" },
  { value: "in-progress", label: "В работе" },
  { value: "review", label: "На проверке" },
  { value: "done", label: "Готово" },
];
const priorityOptions = [
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
  { value: "urgent", label: "Срочный" },
];

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultProjectId = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultProjectId?: string | null;
}) {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(NO_PROJECT);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setProjectId(task?.projectId ?? defaultProjectId ?? NO_PROJECT);
    setDueDate(task?.dueDate ?? "");
    setPriority(task?.priority ?? "medium");
    setStatus(task?.status ?? "todo");
    setTags(task?.tags.join(", ") ?? "");
    setError("");
  }, [open, task, defaultProjectId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Введите название задачи.");
      return;
    }
    if (cleanTitle.length > 120) {
      setError("Название не должно превышать 120 символов.");
      return;
    }

    const changes = {
      title: cleanTitle,
      description: description.trim(),
      projectId: projectId === NO_PROJECT ? null : projectId,
      dueDate: dueDate || null,
      priority,
      status,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
    };

    if (task) {
      dispatch(updateTask({ id: task.id, changes }));
      toast.success("Изменения сохранены");
    } else {
      const now = new Date().toISOString();
      dispatch(
        addTask({
          ...changes,
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `task-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
          completedAt: status === "done" ? now : null,
        }),
      );
      toast.success("Задача создана");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="mb-6 pr-8">
          <div className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[.14em] text-[#718094]">
            <WandSparkles size={13} className="text-accent" />{" "}
            {task ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ ЗАДАЧА"}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-[#edf2f7]">
            {task ? "Редактировать задачу" : "Создать задачу"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs leading-5 text-[#8290a1]">
            Заполните детали, чтобы ничего не упустить.
          </DialogDescription>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-xs font-semibold text-[#b7c2cd]"
            >
              Название <span className="text-[#f08b76]">*</span>
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              maxLength={120}
              placeholder="Например, подготовить макет главной страницы"
              autoFocus
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#68778a]">
              <span>
                {error && <span className="text-[#f08b76]">{error}</span>}
              </span>
              <span>{title.length}/120</span>
            </div>
          </div>
          <div>
            <label
              htmlFor="task-description"
              className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#b7c2cd]"
            >
              <Text size={13} /> Описание
            </label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Дополнительные детали, ссылки или критерии готовности..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#b7c2cd]">
                Проект
              </label>
              <Select
                value={projectId}
                onValueChange={setProjectId}
                options={[
                  { value: NO_PROJECT, label: "Без проекта" },
                  ...projects.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })),
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#b7c2cd]">
                Статус
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TaskStatus)}
                options={statusOptions}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#b7c2cd]">
                Приоритет
              </label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
                options={priorityOptions}
              />
            </div>
            <div>
              <label
                htmlFor="task-due-date"
                className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#b7c2cd]"
              >
                <CalendarDays size={13} /> Срок выполнения
              </label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="task-tags"
              className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#b7c2cd]"
            >
              <Tag size={13} /> Теги
            </label>
            <Input
              id="task-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Например: дизайн, важно, frontend"
            />
            <p className="mt-1 text-[10px] text-[#68778a]">
              Разделяйте теги запятыми.
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {task ? "Сохранить изменения" : "Создать задачу"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FolderKanban, Palette } from "lucide-react";
import { toast } from "sonner";
import { addProject, selectProjects, updateProject } from "@/entities/project";
import type { Project, ProjectColor } from "@/entities/project";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Textarea,
} from "@/shared/ui";

const colors: { value: ProjectColor; label: string; className: string }[] = [
  { value: "lime", label: "Зелёный", className: "bg-[#a5f36b]" },
  { value: "cyan", label: "Голубой", className: "bg-[#66d9e8]" },
  { value: "violet", label: "Фиолетовый", className: "bg-[#ad91f5]" },
  { value: "orange", label: "Оранжевый", className: "bg-[#f0a36c]" },
];

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}`;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}) {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<ProjectColor>("lime");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setColor(project?.color ?? "lime");
    setError("");
  }, [open, project]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Введите название проекта.");
      return;
    }
    if (cleanName.length > 80) {
      setError("Название не должно превышать 80 символов.");
      return;
    }
    const duplicate = projects.some(
      (item) =>
        item.id !== project?.id &&
        item.name.toLocaleLowerCase("ru") === cleanName.toLocaleLowerCase("ru"),
    );
    if (duplicate) {
      setError("Проект с таким названием уже существует.");
      return;
    }

    if (project) {
      dispatch(
        updateProject({
          id: project.id,
          changes: { name: cleanName, description: description.trim(), color },
        }),
      );
      toast.success("Проект обновлён");
    } else {
      const now = new Date().toISOString();
      dispatch(
        addProject({
          id: createId(),
          name: cleanName,
          description: description.trim(),
          color,
          createdAt: now,
          updatedAt: now,
        }),
      );
      toast.success("Проект создан");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <div className="mb-6 pr-8">
          <div className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[.14em] text-[#718094]">
            <FolderKanban size={13} className="text-accent" />{" "}
            {project ? "НАСТРОЙКА ПРОЕКТА" : "НОВЫЙ ПРОЕКТ"}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-[#edf2f7]">
            {project ? "Редактировать проект" : "Создать проект"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs leading-5 text-[#8290a1]">
            Задачи можно будет привязывать к проекту при создании или
            редактировании.
          </DialogDescription>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-xs font-semibold text-[#b7c2cd]"
            >
              Название <span className="text-[#f08b76]">*</span>
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              maxLength={80}
              placeholder="Например, редизайн сайта"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-[10px] text-[#f08b76]">{error}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-xs font-semibold text-[#b7c2cd]"
            >
              Описание
            </label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Кратко опишите цель и содержание проекта..."
            />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#b7c2cd]">
              <Palette size={13} /> Цвет проекта
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setColor(item.value)}
                  aria-label={item.label}
                  aria-pressed={color === item.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] transition ${color === item.value ? "border-accent bg-[#a5f36b12] text-[#d8f7c0]" : "border-line bg-[#0b121b] text-[#8290a1] hover:border-[#405163]"}`}
                >
                  <span className={`size-3 rounded-full ${item.className}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">
              {project ? "Сохранить изменения" : "Создать проект"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

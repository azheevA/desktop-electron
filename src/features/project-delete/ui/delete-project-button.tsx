"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProject } from "@/entities/project";
import { useAppDispatch } from "@/shared/lib";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const dispatch = useAppDispatch();

  function remove() {
    const confirmed = window.confirm(
      `Удалить проект «${projectName}»? Задачи проекта сохранятся и станут задачами без проекта.`,
    );
    if (!confirmed) return;
    dispatch(deleteProject(projectId));
    toast.success("Проект удалён", {
      description: "Связанные задачи сохранены без привязки к проекту.",
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      aria-label={`Удалить проект ${projectName}`}
      title="Удалить проект"
      className="grid size-8 place-items-center rounded-lg text-[#718094] transition hover:bg-[#f08b7618] hover:text-[#f08b76]"
    >
      <Trash2 size={14} />
    </button>
  );
}

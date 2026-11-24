"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/shared/lib";
import { deleteTask } from "@/entities/task";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const dispatch = useAppDispatch();
  return (
    <button
      onClick={() => {
        dispatch(deleteTask(taskId));
        toast.success("Задача удалена");
      }}
      className="grid size-7 place-items-center rounded-md text-[#8090a2] transition hover:bg-[#f08b7618] hover:text-[#f09a86]"
      aria-label="Удалить задачу"
    >
      <Trash2 size={13} />
    </button>
  );
}

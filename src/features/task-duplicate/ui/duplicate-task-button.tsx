"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/shared/lib";
import { duplicateTask } from "@/entities/task";

export function DuplicateTaskButton({ taskId }: { taskId: string }) {
  const dispatch = useAppDispatch();
  return (
    <button
      onClick={() => {
        dispatch(
          duplicateTask({
            id: taskId,
            newId:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `copy-${Date.now()}`,
            now: new Date().toISOString(),
          }),
        );
        toast.success("Задача продублирована");
      }}
      className="grid size-7 place-items-center rounded-md text-[#8090a2] transition hover:bg-[#202b39] hover:text-white"
      aria-label="Дублировать задачу"
    >
      <Copy size={13} />
    </button>
  );
}

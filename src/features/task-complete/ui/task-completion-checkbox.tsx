"use client";

import { useAppDispatch } from "@/shared/lib";
import { setTaskStatus } from "@/entities/task";
import type { Task } from "@/entities/task";
import { Checkbox } from "@/shared/ui";

export function TaskCompletionCheckbox({ task }: { task: Task }) {
  const dispatch = useAppDispatch();
  return (
    <Checkbox
      checked={task.status === "done"}
      onCheckedChange={(checked) =>
        dispatch(
          setTaskStatus({
            id: task.id,
            status: checked ? "done" : "todo",
          }),
        )
      }
    />
  );
}

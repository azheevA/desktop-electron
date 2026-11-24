"use client";

import { useAppDispatch } from "@/shared/lib";
import { setTaskStatus } from "@/entities/task";
import type { TaskStatus } from "@/entities/task";
import { Select } from "@/shared/ui";

const options = [
  { value: "todo", label: "К выполнению" },
  { value: "in-progress", label: "В работе" },
  { value: "review", label: "На проверке" },
  { value: "done", label: "Готово" },
];

export function TaskStatusSelect({
  taskId,
  status,
  className,
}: {
  taskId: string;
  status: TaskStatus;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  return (
    <Select
      value={status}
      onValueChange={(value) =>
        dispatch(setTaskStatus({ id: taskId, status: value as TaskStatus }))
      }
      options={options}
      className={className}
    />
  );
}

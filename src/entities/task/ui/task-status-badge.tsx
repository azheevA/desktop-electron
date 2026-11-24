import { Badge } from "@/shared/ui";
import type { TaskStatus } from "../model/task-types";

const config: Record<TaskStatus, { label: string; variant: "default" | "info" | "warning" | "success" }> = {
  todo: { label: "К выполнению", variant: "default" },
  "in-progress": { label: "В работе", variant: "info" },
  review: { label: "На проверке", variant: "warning" },
  done: { label: "Готово", variant: "success" },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const item = config[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

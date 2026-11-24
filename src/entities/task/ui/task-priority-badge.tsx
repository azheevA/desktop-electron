import { Badge } from "@/shared/ui";
import type { TaskPriority } from "../model/task-types";

const config: Record<TaskPriority, { label: string; variant: "default" | "warning" | "danger" | "violet" }> = {
  low: { label: "Низкий", variant: "default" },
  medium: { label: "Средний", variant: "warning" },
  high: { label: "Высокий", variant: "danger" },
  urgent: { label: "Срочный", variant: "violet" },
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const item = config[priority];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

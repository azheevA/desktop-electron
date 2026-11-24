export type NotificationType =
  | "task-created"
  | "task-completed"
  | "task-status"
  | "task-deleted"
  | "project-created"
  | "project-updated"
  | "project-deleted"
  | "deadline-today"
  | "deadline-overdue";

export type NotificationEntityType = "task" | "project" | null;

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId: string | null;
  dedupeKey: string;
  createdAt: string;
  readAt: string | null;
};

export type NotificationDraft = Omit<NotificationItem, "id" | "createdAt" | "readAt">;

export type NotificationSnapshot = {
  items: NotificationItem[];
  dismissedKeys: string[];
};

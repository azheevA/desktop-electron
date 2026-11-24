export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type NewTask = Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">;
export type TaskChanges = Partial<Omit<Task, "id" | "createdAt">>;

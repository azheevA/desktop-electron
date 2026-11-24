import type { Task } from "./task-types";
import type { TasksState } from "./tasks-slice";
import { getLocalDateKey } from "@/shared/lib/date";

type TasksRootState = { tasks: TasksState };

export const selectTasks = (state: TasksRootState): Task[] => state.tasks.items;
export const selectTasksHydrated = (state: TasksRootState): boolean => state.tasks.hydrated;
export const selectTaskStats = (state: TasksRootState) => {
  const tasks = state.tasks.items;
  const today = getLocalDateKey();
  const completed = tasks.filter((task) => task.status === "done").length;
  const overdue = tasks.filter((task) => task.status !== "done" && task.dueDate && task.dueDate < today).length;
  return {
    total: tasks.length,
    completed,
    active: tasks.length - completed,
    overdue,
    review: tasks.filter((task) => task.status === "review").length,
    completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
};

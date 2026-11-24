import type { Task } from "./task-types";
import { addCalendarDaysToKey } from "@/shared/lib/date";

function dateOffset(days: number) {
  return addCalendarDaysToKey(new Date(), days);
}

const now = new Date().toISOString();

export const initialTasks: Task[] = [
  {
    id: "seed-1",
    title: "Завершить компоненты панели управления",
    description: "Проверить состояния загрузки, ошибок и пустых данных на основных виджетах.",
    projectId: "project-orbital-analytics",
    dueDate: dateOffset(0),
    status: "in-progress",
    priority: "high",
    tags: ["Интерфейс", "Frontend"],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  },
  {
    id: "seed-2",
    title: "Проверить мобильную навигацию",
    description: "Пройти основные пользовательские сценарии на узком окне приложения.",
    projectId: "project-mobile-app",
    dueDate: dateOffset(0),
    status: "review",
    priority: "medium",
    tags: ["QA"],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  },
  {
    id: "seed-3",
    title: "Подготовить дизайн-токены",
    description: "Собрать палитру, типографику, радиусы и интервалы в общую систему.",
    projectId: "project-brand-system",
    dueDate: dateOffset(1),
    status: "todo",
    priority: "low",
    tags: ["Дизайн"],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  },
  {
    id: "seed-4",
    title: "Обновить сценарий знакомства с продуктом",
    description: "Упростить первый запуск и сократить количество шагов регистрации.",
    projectId: "project-mobile-app",
    dueDate: dateOffset(-1),
    status: "done",
    priority: "medium",
    tags: ["UX"],
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  },
];

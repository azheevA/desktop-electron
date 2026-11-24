import type { Project } from "./project-types";

const now = new Date().toISOString();

export const initialProjects: Project[] = [
  {
    id: "project-orbital-analytics",
    name: "Орбитальная аналитика",
    description: "Панель аналитики, метрики и визуализация данных.",
    color: "lime",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "project-mobile-app",
    name: "Мобильное приложение",
    description: "Разработка мобильного интерфейса и пользовательских сценариев.",
    color: "cyan",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "project-brand-system",
    name: "Фирменный стиль",
    description: "Визуальная система, дизайн-токены и бренд-компоненты.",
    color: "violet",
    createdAt: now,
    updatedAt: now,
  },
];

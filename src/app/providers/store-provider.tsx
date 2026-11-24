"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { makeStore, type AppStore } from "@/app/store/store";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import { getLocalDateKey } from "@/shared/lib/date";
import { hydrateTasks, initialTasks, selectTasks, selectTasksHydrated } from "@/entities/task";
import type { Task, TaskPriority, TaskStatus } from "@/entities/task";
import { hydrateProjects, initialProjects, selectProjects, selectProjectsHydrated } from "@/entities/project";
import type { Project, ProjectColor } from "@/entities/project";
import { defaultProfile, hydrateProfile, selectProfile, selectProfileHydrated } from "@/entities/profile";
import type { UserProfile } from "@/entities/profile";
import {
  addNotification,
  createNotification,
  hydrateNotifications,
  selectDismissedNotificationKeys,
  selectNotifications,
  selectNotificationsHydrated,
} from "@/entities/notification";
import type { NotificationItem, NotificationType } from "@/entities/notification";

const TASKS_STORAGE_KEY = "my-desktop.tasks.v1";
const PROJECTS_STORAGE_KEY = "my-desktop.projects.v1";
const PROFILE_STORAGE_KEY = "my-desktop.profile.v1";
const NOTIFICATIONS_STORAGE_KEY = "my-desktop.notifications.v1";
const DISMISSED_NOTIFICATIONS_STORAGE_KEY = "my-desktop.dismissed-notifications.v1";
const LEGACY_STORAGE_KEY = "nexus-tasks-ru";
const projectColors: ProjectColor[] = ["lime", "cyan", "violet", "orange"];

function legacyProjectId(name: string) {
  const suffix = Array.from(name.trim().toLocaleLowerCase("ru"))
    .map((character) => character.codePointAt(0)?.toString(16) ?? "0")
    .join("-");
  return `legacy-${suffix}`;
}

function asProfile(value: unknown): UserProfile {
  if (!value || typeof value !== "object") return defaultProfile;
  const item = value as Record<string, unknown>;
  return {
    firstName: typeof item.firstName === "string" && item.firstName.trim() ? item.firstName.trim().slice(0, 50) : defaultProfile.firstName,
    lastName: typeof item.lastName === "string" && item.lastName.trim() ? item.lastName.trim().slice(0, 50) : defaultProfile.lastName,
  };
}

function asProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.name !== "string" || !item.name.trim()) return null;
  const now = new Date().toISOString();
  const color = projectColors.includes(item.color as ProjectColor) ? item.color as ProjectColor : "lime";
  return {
    id: item.id,
    name: item.name.trim(),
    description: typeof item.description === "string" ? item.description : "",
    color,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : now,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : now,
  };
}

function buildProjects(storedProjects: unknown, storedTasks: unknown): Project[] {
  const hasProjectStorage = Array.isArray(storedProjects);
  const base = hasProjectStorage
    ? storedProjects.map(asProject).filter((project): project is Project => project !== null)
    : initialProjects.map((project) => ({ ...project }));
  const byName = new Set(base.map((project) => project.name.toLocaleLowerCase("ru")));
  const byId = new Set(base.map((project) => project.id));
  const tasks = Array.isArray(storedTasks) ? storedTasks : [];

  tasks.forEach((value) => {
    if (!value || typeof value !== "object") return;
    const item = value as Record<string, unknown>;
    if (typeof item.project !== "string" || !item.project.trim()) return;
    const name = item.project.trim();
    const normalized = name.toLocaleLowerCase("ru");
    if (normalized === "без проекта" || normalized === "без привязки" || byName.has(normalized)) return;
    const id = legacyProjectId(name);
    if (byId.has(id)) return;
    const now = new Date().toISOString();
    base.push({ id, name, description: "Проект перенесён из предыдущей версии приложения.", color: "lime", createdAt: now, updatedAt: now });
    byName.add(normalized);
    byId.add(id);
  });

  return base;
}

function asTask(value: unknown, index: number, projects: Project[]): Task | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.title !== "string" || !item.title.trim()) return null;

  const legacyStatus: Record<string, TaskStatus> = {
    "In progress": "in-progress", Review: "review", Done: "done",
    "В работе": "in-progress", "На проверке": "review", "Готово": "done",
  };
  const validStatuses: TaskStatus[] = ["todo", "in-progress", "review", "done"];
  const status = validStatuses.includes(item.status as TaskStatus)
    ? item.status as TaskStatus
    : legacyStatus[String(item.status)] ?? "todo";
  const legacyPriority: Record<string, TaskPriority> = { High: "high", Medium: "medium", Low: "low" };
  const validPriorities: TaskPriority[] = ["low", "medium", "high", "urgent"];
  const priority = validPriorities.includes(item.priority as TaskPriority)
    ? item.priority as TaskPriority
    : legacyPriority[String(item.priority)] ?? "medium";
  const now = new Date().toISOString();
  let dueDate = typeof item.dueDate === "string" ? item.dueDate : null;
  if (!dueDate && typeof item.due === "string") {
    const date = new Date();
    if (item.due === "Завтра" || item.due === "Tomorrow") date.setDate(date.getDate() + 1);
    else if (item.due === "Вчера") date.setDate(date.getDate() - 1);
    else if (item.due !== "Сегодня" && item.due !== "Today") {
      const russianDate = item.due.match(/^(\d{1,2})\s+(янв|фев|мар|апр|мая|май|июн|июл|авг|сен|окт|ноя|дек)/i);
      const months: Record<string, number> = { янв: 0, фев: 1, мар: 2, апр: 3, мая: 4, май: 4, июн: 5, июл: 6, авг: 7, сен: 8, окт: 9, ноя: 10, дек: 11 };
      if (russianDate) date.setMonth(months[russianDate[2].toLowerCase()], Number(russianDate[1]));
      else {
        const parsed = new Date(item.due);
        if (!Number.isNaN(parsed.getTime())) date.setTime(parsed.getTime());
      }
    }
    dueDate = getLocalDateKey(date);
  }

  const existingProjectId = typeof item.projectId === "string" && projects.some((project) => project.id === item.projectId)
    ? item.projectId
    : null;
  const legacyProjectName = typeof item.project === "string" ? item.project.trim() : "";
  const legacyProject = projects.find((project) => project.name.toLocaleLowerCase("ru") === legacyProjectName.toLocaleLowerCase("ru"));
  const projectId = existingProjectId ?? legacyProject?.id ?? null;

  return {
    id: typeof item.id === "string" ? item.id : `migrated-${index}-${Date.now()}`,
    title: item.title.trim(),
    description: typeof item.description === "string" ? item.description : "",
    projectId,
    dueDate,
    status,
    priority,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
    createdAt: typeof item.createdAt === "string" ? item.createdAt : now,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : now,
    completedAt: typeof item.completedAt === "string" ? item.completedAt : status === "done" ? now : null,
  };
}

function asNotification(value: unknown, index: number): NotificationItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const validTypes: NotificationType[] = [
    "task-created", "task-completed", "task-status", "task-deleted",
    "project-created", "project-updated", "project-deleted", "deadline-today", "deadline-overdue",
  ];
  if (typeof item.title !== "string" || typeof item.message !== "string" || !validTypes.includes(item.type as NotificationType)) return null;
  const id = typeof item.id === "string" && item.id ? item.id : `restored-notification-${index}`;
  const entityType = item.entityType === "task" || item.entityType === "project" ? item.entityType : null;
  return {
    id,
    type: item.type as NotificationType,
    title: item.title.slice(0, 140),
    message: item.message.slice(0, 500),
    entityType,
    entityId: typeof item.entityId === "string" ? item.entityId.slice(0, 120) : null,
    dedupeKey: typeof item.dedupeKey === "string" && item.dedupeKey ? item.dedupeKey.slice(0, 240) : `restored:${id}`,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    readAt: typeof item.readAt === "string" ? item.readAt : null,
  };
}

function readLegacyLocalStorage() {
  const currentTasks = window.localStorage.getItem(TASKS_STORAGE_KEY);
  const legacyTasks = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  const rawTasks = currentTasks ?? legacyTasks;
  const parsedTasks: unknown = rawTasks ? JSON.parse(rawTasks) : initialTasks;
  const storedProjectsRaw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
  const parsedProjects: unknown = storedProjectsRaw ? JSON.parse(storedProjectsRaw) : null;
  const storedProfileRaw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  const parsedProfile: unknown = storedProfileRaw ? JSON.parse(storedProfileRaw) : defaultProfile;
  const storedNotificationsRaw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  const parsedNotifications: unknown = storedNotificationsRaw ? JSON.parse(storedNotificationsRaw) : [];
  const dismissedRaw = window.localStorage.getItem(DISMISSED_NOTIFICATIONS_STORAGE_KEY);
  const parsedDismissedKeys: unknown = dismissedRaw ? JSON.parse(dismissedRaw) : [];
  return { tasks: parsedTasks, projects: parsedProjects, profile: parsedProfile, notifications: parsedNotifications, dismissedNotificationKeys: parsedDismissedKeys };
}

function WorkspacePersistence() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const tasksHydrated = useAppSelector(selectTasksHydrated);
  const projects = useAppSelector(selectProjects);
  const projectsHydrated = useAppSelector(selectProjectsHydrated);
  const profile = useAppSelector(selectProfile);
  const profileHydrated = useAppSelector(selectProfileHydrated);
  const notifications = useAppSelector(selectNotifications);
  const dismissedNotificationKeys = useAppSelector(selectDismissedNotificationKeys);
  const notificationsHydrated = useAppSelector(selectNotificationsHydrated);
  const isHydrated = tasksHydrated && projectsHydrated && profileHydrated && notificationsHydrated;

  useEffect(() => {
    let cancelled = false;

    async function hydrateWorkspace() {
      let storedWorkspace: DesktopWorkspaceData | null = null;
      const desktop = window.desktopApp;
      if (desktop?.isDesktop) {
        try {
          storedWorkspace = await desktop.loadWorkspace();
        } catch (error) {
          console.error("Не удалось прочитать JSON-файл рабочего пространства:", error);
        }
      }

      let rawTasks: unknown;
      let rawProjects: unknown;
      let rawProfile: unknown;
      let rawNotifications: unknown;
      let rawDismissedNotificationKeys: unknown;
      try {
        if (storedWorkspace) {
          rawTasks = storedWorkspace.tasks;
          rawProjects = storedWorkspace.projects;
          rawProfile = storedWorkspace.profile;
          rawNotifications = storedWorkspace.notifications ?? [];
          rawDismissedNotificationKeys = storedWorkspace.dismissedNotificationKeys ?? [];
        } else {
          const localData = readLegacyLocalStorage();
          rawTasks = localData.tasks;
          rawProjects = localData.projects;
          rawProfile = localData.profile;
          rawNotifications = localData.notifications;
          rawDismissedNotificationKeys = localData.dismissedNotificationKeys;
        }
      } catch (error) {
        console.error("Не удалось восстановить локальные данные, будут загружены начальные:", error);
        rawTasks = initialTasks;
        rawProjects = null;
        rawProfile = defaultProfile;
        rawNotifications = [];
        rawDismissedNotificationKeys = [];
      }

      const normalizedProjects = buildProjects(rawProjects, rawTasks);
      const normalizedTasks = Array.isArray(rawTasks)
        ? rawTasks.map((task, index) => asTask(task, index, normalizedProjects)).filter((task): task is Task => task !== null)
        : initialTasks;
      const normalizedProfile = asProfile(rawProfile);
      const normalizedNotifications = Array.isArray(rawNotifications)
        ? rawNotifications.map(asNotification).filter((notification): notification is NotificationItem => notification !== null).slice(0, 500)
        : [];
      const normalizedDismissedKeys = Array.isArray(rawDismissedNotificationKeys)
        ? rawDismissedNotificationKeys.filter((key): key is string => typeof key === "string" && key.length > 0).slice(0, 1000)
        : [];

      if (cancelled) return;
      dispatch(hydrateProjects(normalizedProjects));
      dispatch(hydrateTasks(normalizedTasks));
      dispatch(hydrateProfile(normalizedProfile));
      dispatch(hydrateNotifications({ items: normalizedNotifications, dismissedKeys: normalizedDismissedKeys }));
    }

    void hydrateWorkspace();
    return () => { cancelled = true; };
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) return;
    const snapshot: DesktopWorkspaceData = {
      version: 2,
      profile,
      projects,
      tasks,
      notifications,
      dismissedNotificationKeys,
      updatedAt: new Date().toISOString(),
    };
    const desktop = window.desktopApp;
    if (desktop?.isDesktop) {
      desktop.saveWorkspace(snapshot).catch((error) => {
        console.error("Не удалось сохранить workspace.json:", error);
      });
    } else {
      try {
        window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
        window.localStorage.setItem(DISMISSED_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(dismissedNotificationKeys));
      } catch (error) {
        console.error("Не удалось сохранить локальные данные браузера:", error);
      }
    }
  }, [dismissedNotificationKeys, isHydrated, notifications, profile, projects, tasks]);

  useEffect(() => {
    if (!isHydrated) return;
    const today = getLocalDateKey();
    const existingKeys = new Set([
      ...notifications.map((notification) => notification.dedupeKey),
      ...dismissedNotificationKeys,
    ]);

    tasks.forEach((task) => {
      if (!task.dueDate || task.status === "done") return;
      const isOverdue = task.dueDate < today;
      const isDueToday = task.dueDate === today;
      if (!isOverdue && !isDueToday) return;

      const type: NotificationType = isOverdue ? "deadline-overdue" : "deadline-today";
      const dedupeKey = `${type}:${task.id}:${task.dueDate}`;
      if (existingKeys.has(dedupeKey)) return;
      dispatch(addNotification(createNotification({
        type,
        title: isOverdue ? "Просроченная задача" : "Срок задачи сегодня",
        message: isOverdue
          ? `Срок задачи «${task.title}» уже прошёл. Проверьте её статус.`
          : `Сегодня необходимо завершить задачу «${task.title}».`,
        entityType: "task",
        entityId: task.id,
        dedupeKey,
      })));
    });
  }, [dispatch, dismissedNotificationKeys, isHydrated, notifications, tasks]);

  return null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return (
    <Provider store={storeRef.current}>
      <WorkspacePersistence />
      {children}
      <Toaster position="bottom-right" theme="dark" richColors closeButton toastOptions={{ className: "!border-line !bg-[#111923] !text-[#edf2f7]" }} />
    </Provider>
  );
}

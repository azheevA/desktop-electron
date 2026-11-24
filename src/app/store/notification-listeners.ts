import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  addProject,
  deleteProject,
  updateProject,
  type Project,
} from "@/entities/project";
import {
  addTask,
  deleteTask,
  setTaskStatus,
  toggleTaskCompletion,
  updateTask,
  type Task,
  type TaskStatus,
} from "@/entities/task";
import { addNotification, createNotification } from "@/entities/notification";
import type { NotificationsState } from "@/entities/notification/model/notifications-slice";
import type { TasksState } from "@/entities/task/model/tasks-slice";
import type { ProjectsState } from "@/entities/project/model/projects-slice";
import type { ProfileState } from "@/entities/profile/model/profile-slice";

type ListenerRootState = {
  tasks: TasksState;
  projects: ProjectsState;
  profile: ProfileState;
  notifications: NotificationsState;
};

export const notificationListenerMiddleware = createListenerMiddleware<ListenerRootState>();

function getProjectName(projects: Project[], projectId: string | null) {
  return projectId ? projects.find((project) => project.id === projectId)?.name ?? "Без проекта" : "Без проекта";
}

function makeTaskNotification(
  type: "task-created" | "task-completed" | "task-status" | "task-deleted",
  task: Task,
  projectName: string,
  dedupeKey: string,
) {
  const content = {
    "task-created": { title: "Добавлена новая задача", message: `«${task.title}» · ${projectName}` },
    "task-completed": { title: "Задача выполнена", message: `«${task.title}» отмечена как выполненная.` },
    "task-status": { title: "Изменён статус задачи", message: `«${task.title}» · ${projectName}` },
    "task-deleted": { title: "Задача удалена", message: `«${task.title}» была удалена.` },
  }[type];

  return createNotification({
    type,
    ...content,
    entityType: "task",
    entityId: task.id,
    dedupeKey,
  });
}

notificationListenerMiddleware.startListening({
  actionCreator: addTask,
  effect: (action, api) => {
    const task = action.payload;
    const projectName = getProjectName(api.getState().projects.items, task.projectId);
    api.dispatch(addNotification(makeTaskNotification("task-created", task, projectName, `task-created:${task.id}`)));
  },
});

notificationListenerMiddleware.startListening({
  matcher: isAnyOf(setTaskStatus, toggleTaskCompletion, updateTask),
  effect: (action, api) => {
    const previousState = api.getOriginalState();
    let id: string;
    if (updateTask.match(action) || setTaskStatus.match(action)) id = action.payload.id;
    else if (toggleTaskCompletion.match(action)) id = action.payload;
    else return;
    const previousTask = previousState.tasks.items.find((task) => task.id === id);
    const currentTask = api.getState().tasks.items.find((task) => task.id === id);
    if (!previousTask || !currentTask || previousTask.status === currentTask.status) return;

    const projectName = getProjectName(api.getState().projects.items, currentTask.projectId);
    const type = currentTask.status === "done" ? "task-completed" : "task-status";
    const statusLabels: Record<TaskStatus, string> = {
      todo: "К выполнению",
      "in-progress": "В работе",
      review: "На проверке",
      done: "Готово",
    };
    const notification = makeTaskNotification(
      type,
      currentTask,
      projectName,
      `task-status:${currentTask.id}:${currentTask.status}:${currentTask.updatedAt}`,
    );
    if (type === "task-status") notification.message = `«${currentTask.title}» · ${statusLabels[currentTask.status]}.`;
    api.dispatch(addNotification(notification));
  },
});

notificationListenerMiddleware.startListening({
  actionCreator: deleteTask,
  effect: (action, api) => {
    const task = api.getOriginalState().tasks.items.find((item) => item.id === action.payload);
    if (!task) return;
    const projectName = getProjectName(api.getOriginalState().projects.items, task.projectId);
    api.dispatch(addNotification(makeTaskNotification("task-deleted", task, projectName, `task-deleted:${task.id}:${Date.now()}`)));
  },
});

notificationListenerMiddleware.startListening({
  actionCreator: addProject,
  effect: (action, api) => {
    const project = action.payload;
    api.dispatch(addNotification(createNotification({
      type: "project-created",
      title: "Создан новый проект",
      message: `«${project.name}» теперь в вашем рабочем пространстве.`,
      entityType: "project",
      entityId: project.id,
      dedupeKey: `project-created:${project.id}`,
    })));
  },
});

notificationListenerMiddleware.startListening({
  actionCreator: updateProject,
  effect: (action, api) => {
    const previousState = api.getOriginalState();
    const previousProject = previousState.projects.items.find((item) => item.id === action.payload.id);
    const currentProject = api.getState().projects.items.find((item) => item.id === action.payload.id);
    if (!previousProject || !currentProject || previousProject.name === currentProject.name) return;
    api.dispatch(addNotification(createNotification({
      type: "project-updated",
      title: "Обновлён проект",
      message: `Название проекта изменено на «${currentProject.name}».`,
      entityType: "project",
      entityId: currentProject.id,
      dedupeKey: `project-updated:${currentProject.id}:${currentProject.updatedAt}`,
    })));
  },
});

notificationListenerMiddleware.startListening({
  actionCreator: deleteProject,
  effect: (action, api) => {
    const project = api.getOriginalState().projects.items.find((item) => item.id === action.payload);
    if (!project) return;
    api.dispatch(addNotification(createNotification({
      type: "project-deleted",
      title: "Проект удалён",
      message: `Проект «${project.name}» удалён. Его задачи сохранены без привязки.`,
      entityType: "project",
      entityId: project.id,
      dedupeKey: `project-deleted:${project.id}:${Date.now()}`,
    })));
  },
});

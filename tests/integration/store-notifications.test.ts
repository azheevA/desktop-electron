import { describe, expect, test } from "bun:test";
import { makeStore } from "../../src/app/store/store";
import { addProject, deleteProject } from "../../src/entities/project/model/projects-slice";
import { addTask, hydrateTasks, type Task } from "../../src/entities/task";
import { hydrateProjects } from "../../src/entities/project";

const project = {
  id: "project-integration",
  name: "Интеграционный проект",
  description: "",
  color: "lime" as const,
  createdAt: "2026-11-24T10:00:00.000Z",
  updatedAt: "2026-11-24T10:00:00.000Z",
};

const task: Task = {
  id: "task-integration",
  title: "Проверить уведомления",
  description: "",
  projectId: project.id,
  dueDate: null,
  status: "todo",
  priority: "medium",
  tags: [],
  createdAt: "2026-11-24T10:00:00.000Z",
  updatedAt: "2026-11-24T10:00:00.000Z",
  completedAt: null,
};

const flushListeners = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("Redux store integration", () => {
  test("creates a notification when a task is added", async () => {
    const store = makeStore();
    store.dispatch(hydrateProjects([project]));
    store.dispatch(hydrateTasks([]));

    store.dispatch(addTask(task));
    await flushListeners();

    expect(store.getState().tasks.items[0]).toEqual(task);
    expect(store.getState().notifications.items[0]).toMatchObject({
      type: "task-created",
      title: "Добавлена новая задача",
      entityType: "task",
      entityId: task.id,
      message: `«${task.title}» · ${project.name}`,
    });
  });

  test("clearing a project detaches its tasks and emits a project notification", async () => {
    const store = makeStore();
    store.dispatch(hydrateProjects([project]));
    store.dispatch(hydrateTasks([task]));

    store.dispatch(deleteProject(project.id));
    await flushListeners();

    expect(store.getState().projects.items).toHaveLength(0);
    expect(store.getState().tasks.items[0]?.projectId).toBeNull();
    expect(store.getState().notifications.items[0]).toMatchObject({
      type: "project-deleted",
      entityId: project.id,
    });
  });

  test("creates a project notification through listener middleware", async () => {
    const store = makeStore();
    store.dispatch(addProject(project));
    await flushListeners();

    expect(store.getState().notifications.items[0]).toMatchObject({
      type: "project-created",
      entityId: project.id,
    });
  });
});

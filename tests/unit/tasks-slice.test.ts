import { describe, expect, test } from "bun:test";
import reducer, {
  addTask,
  clearCompletedTasks,
  duplicateTask,
  hydrateTasks,
  setTaskStatus,
  toggleTaskCompletion,
  updateTask,
} from "../../src/entities/task/model/tasks-slice";
import type { Task } from "../../src/entities/task/model/task-types";

const task: Task = {
  id: "task-1",
  title: "Подготовить релиз",
  description: "Проверить сборку",
  projectId: "project-1",
  dueDate: "2026-12-01",
  status: "todo",
  priority: "high",
  tags: ["release"],
  createdAt: "2026-11-20T10:00:00.000Z",
  updatedAt: "2026-11-20T10:00:00.000Z",
  completedAt: null,
};

describe("tasks reducer", () => {
  test("hydrates tasks and marks the state as hydrated", () => {
    const state = reducer(undefined, hydrateTasks([task]));

    expect(state.items).toEqual([task]);
    expect(state.hydrated).toBe(true);
  });

  test("adds a task to the beginning of the list", () => {
    const state = reducer(
      { items: [task], hydrated: true },
      addTask({ ...task, id: "task-2", title: "Новая задача" }),
    );

    expect(state.items.map((item) => item.id)).toEqual(["task-2", "task-1"]);
  });

  test("sets completion timestamp when task is completed", () => {
    const state = reducer(
      { items: [task], hydrated: true },
      setTaskStatus({ id: task.id, status: "done" }),
    );

    expect(state.items[0]?.status).toBe("done");
    expect(typeof state.items[0]?.completedAt).toBe("string");
    expect(typeof state.items[0]?.updatedAt).toBe("string");
  });

  test("clears completion timestamp when task becomes active", () => {
    const completed = { ...task, status: "done" as const, completedAt: "2026-11-21T12:00:00.000Z" };
    const state = reducer(
      { items: [completed], hydrated: true },
      setTaskStatus({ id: task.id, status: "in-progress" }),
    );

    expect(state.items[0]?.status).toBe("in-progress");
    expect(state.items[0]?.completedAt).toBeNull();
  });

  test("updates fields and refreshes updatedAt", () => {
    const state = reducer(
      { items: [task], hydrated: true },
      updateTask({ id: task.id, changes: { title: "Релиз проверен" } }),
    );

    expect(state.items[0]?.title).toBe("Релиз проверен");
    expect(state.items[0]?.updatedAt).not.toBe(task.updatedAt);
  });

  test("duplicates a task as a new todo item", () => {
    const state = reducer(
      { items: [task], hydrated: true },
      duplicateTask({
        id: task.id,
        newId: "task-copy",
        now: "2026-11-24T12:00:00.000Z",
      }),
    );

    expect(state.items[0]).toMatchObject({
      id: "task-copy",
      title: "Подготовить релиз (копия)",
      status: "todo",
      completedAt: null,
    });
  });

  test("toggles completion in both directions", () => {
    const completed = reducer(
      { items: [task], hydrated: true },
      toggleTaskCompletion(task.id),
    );
    const active = reducer(completed, toggleTaskCompletion(task.id));

    expect(completed.items[0]?.status).toBe("done");
    expect(active.items[0]?.status).toBe("todo");
    expect(active.items[0]?.completedAt).toBeNull();
  });

  test("clears only completed tasks", () => {
    const state = reducer(
      { items: [task, { ...task, id: "task-done", status: "done" }], hydrated: true },
      clearCompletedTasks(),
    );

    expect(state.items.map((item) => item.id)).toEqual([task.id]);
  });
});

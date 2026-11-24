const { afterEach, describe, expect, test } = require("bun:test");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});

Object.defineProperties(globalThis, {
  window: { configurable: true, value: dom.window },
  document: { configurable: true, value: dom.window.document },
  navigator: { configurable: true, value: dom.window.navigator },
  HTMLElement: { configurable: true, value: dom.window.HTMLElement },
  Node: { configurable: true, value: dom.window.Node },
  MutationObserver: { configurable: true, value: dom.window.MutationObserver },
  getComputedStyle: { configurable: true, value: dom.window.getComputedStyle },
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const React = require("react");
const { configureStore } = require("@reduxjs/toolkit");
const { Provider, useSelector } = require("react-redux");
const { cleanup, fireEvent, render, screen } = require("@testing-library/react");
const { TaskCompletionCheckbox } = require("../../src/features/task-complete/ui/task-completion-checkbox.tsx");
const { hydrateTasks, tasksReducer } = require("../../src/entities/task");

afterEach(() => cleanup());

function ConnectedTaskCompletionCheckbox({ taskId }) {
  const task = useSelector((state) =>
    state.tasks.items.find((item) => item.id === taskId),
  );

  return task
    ? React.createElement(TaskCompletionCheckbox, { task })
    : null;
}

const task = {
  id: "component-task",
  title: "Тестовая задача",
  description: "",
  projectId: null,
  dueDate: null,
  status: "todo",
  priority: "medium",
  tags: [],
  createdAt: "2026-11-24T10:00:00.000Z",
  updatedAt: "2026-11-24T10:00:00.000Z",
  completedAt: null,
};

describe("TaskCompletionCheckbox component", () => {
  test("dispatches completion and can toggle the task back to todo", () => {
    const store = configureStore({ reducer: { tasks: tasksReducer } });
    store.dispatch(hydrateTasks([task]));

    render(
      React.createElement(
        Provider,
        { store },
        React.createElement(ConnectedTaskCompletionCheckbox, {
          taskId: task.id,
        }),
      ),
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");

    fireEvent.click(checkbox);
    expect(store.getState().tasks.items[0].status).toBe("done");
    expect(checkbox.getAttribute("data-state")).toBe("checked");

    fireEvent.click(checkbox);
    expect(store.getState().tasks.items[0].status).toBe("todo");
  });
});

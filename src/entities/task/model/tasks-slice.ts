import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskChanges, TaskStatus } from "./task-types";

export type TasksState = {
  items: Task[];
  hydrated: boolean;
};

const initialState: TasksState = {
  items: [],
  hydrated: false,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    hydrateTasks(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
      state.hydrated = true;
    },
    addTask(state, action: PayloadAction<Task>) {
      state.items.unshift(action.payload);
    },
    updateTask(state, action: PayloadAction<{ id: string; changes: TaskChanges }>) {
      const task = state.items.find((item) => item.id === action.payload.id);
      if (!task) return;
      Object.assign(task, action.payload.changes, { updatedAt: new Date().toISOString() });
      if (action.payload.changes.status === "done" && !task.completedAt) {
        task.completedAt = new Date().toISOString();
      }
      if (action.payload.changes.status && action.payload.changes.status !== "done") {
        task.completedAt = null;
      }
    },
    setTaskStatus(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const task = state.items.find((item) => item.id === action.payload.id);
      if (!task) return;
      task.status = action.payload.status;
      task.updatedAt = new Date().toISOString();
      task.completedAt = action.payload.status === "done" ? new Date().toISOString() : null;
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
    duplicateTask(state, action: PayloadAction<{ id: string; newId: string; now: string }>) {
      const source = state.items.find((task) => task.id === action.payload.id);
      if (!source) return;
      state.items.unshift({
        ...source,
        id: action.payload.newId,
        title: `${source.title} (копия)`,
        status: "todo",
        createdAt: action.payload.now,
        updatedAt: action.payload.now,
        completedAt: null,
      });
    },
    clearCompletedTasks(state) {
      state.items = state.items.filter((task) => task.status !== "done");
    },
    toggleTaskCompletion(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload);
      if (!task) return;
      task.status = task.status === "done" ? "todo" : "done";
      task.completedAt = task.status === "done" ? new Date().toISOString() : null;
      task.updatedAt = new Date().toISOString();
    },
  },
  extraReducers(builder) {
    builder.addMatcher((action): action is PayloadAction<string> => action.type === "projects/deleteProject", (state, action) => {
      const now = new Date().toISOString();
      state.items.forEach((task) => {
        if (task.projectId === action.payload) {
          task.projectId = null;
          task.updatedAt = now;
        }
      });
    });
  },
});

export const {
  hydrateTasks,
  addTask,
  updateTask,
  setTaskStatus,
  deleteTask,
  duplicateTask,
  clearCompletedTasks,
  toggleTaskCompletion,
} = tasksSlice.actions;

export { initialState as tasksInitialState };
export default tasksSlice.reducer;

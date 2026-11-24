import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Project, ProjectChanges } from "./project-types";

export type ProjectsState = {
  items: Project[];
  hydrated: boolean;
};

const initialState: ProjectsState = {
  items: [],
  hydrated: false,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    hydrateProjects(state, action: PayloadAction<Project[]>) {
      state.items = action.payload;
      state.hydrated = true;
    },
    addProject(state, action: PayloadAction<Project>) {
      state.items.unshift(action.payload);
    },
    updateProject(state, action: PayloadAction<{ id: string; changes: ProjectChanges }>) {
      const project = state.items.find((item) => item.id === action.payload.id);
      if (!project) return;
      Object.assign(project, action.payload.changes, { updatedAt: new Date().toISOString() });
    },
    deleteProject(state, action: PayloadAction<string>) {
      state.items = state.items.filter((project) => project.id !== action.payload);
    },
  },
});

export const { hydrateProjects, addProject, updateProject, deleteProject } = projectsSlice.actions;
export { initialState as projectsInitialState };
export default projectsSlice.reducer;

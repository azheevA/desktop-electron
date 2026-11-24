import { createSelector } from "@reduxjs/toolkit";
import type { Project, ProjectWithStats } from "./project-types";
import type { ProjectsState } from "./projects-slice";

type ProjectTask = { projectId: string | null; status: string };
type ProjectsRootState = {
  projects: ProjectsState;
  tasks: { items: ProjectTask[] };
};

export const selectProjects = (state: { projects: ProjectsState }): Project[] => state.projects.items;
export const selectProjectsHydrated = (state: { projects: ProjectsState }): boolean => state.projects.hydrated;

export const selectProjectsWithStats = createSelector(
  [
    (state: ProjectsRootState) => state.projects.items,
    (state: ProjectsRootState) => state.tasks.items,
  ],
  (projects, tasks): ProjectWithStats[] => {
    const tasksByProject = new Map<string, ProjectTask[]>();
    for (const task of tasks) {
      if (!task.projectId) continue;
      const bucket = tasksByProject.get(task.projectId) ?? [];
      bucket.push(task);
      tasksByProject.set(task.projectId, bucket);
    }

    return projects.map((project) => {
      const projectTasks = tasksByProject.get(project.id) ?? [];
      const completedCount = projectTasks.filter((task) => task.status === "done").length;
      const taskCount = projectTasks.length;
      return {
        ...project,
        taskCount,
        completedCount,
        activeCount: taskCount - completedCount,
        progress: taskCount ? Math.round((completedCount / taskCount) * 100) : 0,
      };
    });
  },
);

export const selectProjectById = (state: ProjectsRootState, projectId: string | null | undefined): Project | undefined =>
  projectId ? state.projects.items.find((project) => project.id === projectId) : undefined;

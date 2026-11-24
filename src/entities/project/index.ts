export type { Project, ProjectChanges, ProjectColor, ProjectWithStats } from "./model/project-types";
export { addProject, deleteProject, hydrateProjects, updateProject } from "./model/projects-slice";
export { selectProjectById, selectProjects, selectProjectsHydrated, selectProjectsWithStats } from "./model/projects-selectors";
export { initialProjects } from "./model/seed";
export { default as projectsReducer } from "./model/projects-slice";
export { ProjectProgress } from "./ui/project-progress";

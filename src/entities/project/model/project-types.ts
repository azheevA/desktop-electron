export type ProjectColor = "lime" | "cyan" | "violet" | "orange";

export type Project = {
  id: string;
  name: string;
  description: string;
  color: ProjectColor;
  createdAt: string;
  updatedAt: string;
};

export type ProjectChanges = Partial<Pick<Project, "name" | "description" | "color">>;

export type ProjectWithStats = Project & {
  taskCount: number;
  completedCount: number;
  activeCount: number;
  progress: number;
};

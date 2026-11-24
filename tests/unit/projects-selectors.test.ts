import { describe, expect, test } from "bun:test";
import {
  selectProjectById,
  selectProjectsWithStats,
} from "../../src/entities/project/model/projects-selectors";
import type { Project } from "../../src/entities/project/model/project-types";

const project: Project = {
  id: "project-1",
  name: "Проект",
  description: "Описание",
  color: "lime",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const state = {
  projects: { items: [project], hydrated: true },
  tasks: {
    items: [
      { projectId: project.id, status: "done" },
      { projectId: project.id, status: "todo" },
      { projectId: null, status: "todo" },
    ],
  },
};

describe("project selectors", () => {
  test("calculates progress from linked tasks only", () => {
    expect(selectProjectsWithStats(state)[0]).toMatchObject({
      taskCount: 2,
      completedCount: 1,
      activeCount: 1,
      progress: 50,
    });
  });

  test("returns zero progress for projects without tasks", () => {
    const result = selectProjectsWithStats({
      projects: { items: [project], hydrated: true },
      tasks: { items: [] },
    });

    expect(result[0]).toMatchObject({
      taskCount: 0,
      completedCount: 0,
      activeCount: 0,
      progress: 0,
    });
  });

  test("finds a project by id and safely handles an empty id", () => {
    expect(selectProjectById(state, project.id)).toEqual(project);
    expect(selectProjectById(state, null)).toBeUndefined();
    expect(selectProjectById(state, "missing")).toBeUndefined();
  });
});

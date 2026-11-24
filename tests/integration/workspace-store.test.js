const { afterEach, beforeEach, describe, expect, test } = require("bun:test");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createWorkspaceStore, normalizeWorkspace } = require("../../electron/workspace-store.cjs");

const workspace = {
  profile: { firstName: "  Алексей ", lastName: " Иванов " },
  projects: [
    {
      id: "project-1",
      name: "  Проект  ",
      description: "Описание",
      color: "invalid-color",
    },
    { id: "", name: "Пустой идентификатор" },
    { id: "project-2", name: "" },
  ],
  tasks: [
    {
      id: "task-1",
      title: "  Проверить файл  ",
      status: "unknown",
      priority: "unknown",
      tags: ["one", "two"],
    },
    { id: "", title: "Без ID" },
    { id: "task-2", title: "" },
  ],
};

describe("workspace persistence", () => {
  let directory;
  let filePath;
  let store;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "my-desktop-workspace-"));
    filePath = path.join(directory, "nested", "workspace.json");
    store = createWorkspaceStore({ filePath });
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  test("rejects payloads without the required project and task arrays", () => {
    expect(() => normalizeWorkspace({ projects: [] })).toThrow(
      "Некорректный формат файла рабочего пространства.",
    );
  });

  test("normalizes invalid fields and removes malformed records", () => {
    const { result } = normalizeWorkspace(workspace, "2026-11-24T12:00:00.000Z");

    expect(result.profile).toEqual({ firstName: "Алексей", lastName: "Иванов" });
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]).toMatchObject({ id: "project-1", name: "Проект", color: "lime" });
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0]).toMatchObject({
      id: "task-1",
      title: "Проверить файл",
      status: "todo",
      priority: "medium",
    });
    expect(result.version).toBe(2);
    expect(result.updatedAt).toBe("2026-11-24T12:00:00.000Z");
  });

  test("rejects a workspace above the item-count limits", () => {
    const oversized = {
      projects: Array.from({ length: 501 }, (_, index) => ({ id: String(index), name: "Project" })),
      tasks: [],
    };

    expect(() => normalizeWorkspace(oversized)).toThrow("Слишком много проектов");
  });

  test("returns null when no workspace file exists", async () => {
    expect(await store.load()).toBeNull();
  });

  test("writes atomically and loads a normalized workspace", async () => {
    const result = await store.save(workspace);
    const loaded = await store.load();
    const directoryFiles = await fs.readdir(path.dirname(filePath));

    expect(typeof result.savedAt).toBe("string");
    expect(loaded.projects).toHaveLength(1);
    expect(loaded.tasks).toHaveLength(1);
    expect(directoryFiles).toEqual(["workspace.json"]);
  });

  test("moves malformed JSON to a backup and returns an empty workspace", async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "{ invalid JSON", "utf8");

    expect(await store.load()).toBeNull();

    const files = await fs.readdir(path.dirname(filePath));
    expect(files.some((name) => name.startsWith("workspace.json.corrupted-") && name.endsWith(".bak"))).toBe(true);
  });

  test("backs up valid JSON with an invalid workspace schema", async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ projects: [] }), "utf8");

    expect(await store.load()).toBeNull();

    const files = await fs.readdir(path.dirname(filePath));
    expect(files.some((name) => name.startsWith("workspace.json.corrupted-") && name.endsWith(".bak"))).toBe(true);
  });

  test("backs up workspace files that exceed the raw file size limit", async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `{"projects":[],"tasks":[],"padding":"${"x".repeat(20 * 1024 * 1024)}"}`, "utf8");

    expect(await store.load()).toBeNull();

    const files = await fs.readdir(path.dirname(filePath));
    expect(files.some((name) => name.startsWith("workspace.json.corrupted-") && name.endsWith(".bak"))).toBe(true);
  });

  test("serializes concurrent saves so the last write wins", async () => {
    const first = { ...workspace, profile: { firstName: "Первый", lastName: "Профиль" } };
    const second = { ...workspace, profile: { firstName: "Второй", lastName: "Профиль" } };

    await Promise.all([store.save(first), store.save(second)]);

    expect((await store.load()).profile.firstName).toBe("Второй");
  });
});

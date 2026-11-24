const nodeFs = require("node:fs/promises");
const path = require("node:path");

const MAX_WORKSPACE_BYTES = 20 * 1024 * 1024;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value, maxLength, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function normalizeWorkspace(input, now = new Date().toISOString()) {
  if (!isRecord(input) || !Array.isArray(input.projects) || !Array.isArray(input.tasks)) {
    throw new Error("Некорректный формат файла рабочего пространства.");
  }

  const sourceNotifications = Array.isArray(input.notifications) ? input.notifications : [];
  const sourceDismissedKeys = Array.isArray(input.dismissedNotificationKeys) ? input.dismissedNotificationKeys : [];

  if (
    input.projects.length > 500 ||
    input.tasks.length > 10000 ||
    sourceNotifications.length > 5000 ||
    sourceDismissedKeys.length > 5000
  ) {
    throw new Error("Слишком много проектов, задач или уведомлений в одном файле.");
  }

  const sourceProfile = isRecord(input.profile) ? input.profile : {};
  const profile = {
    firstName: cleanString(sourceProfile.firstName, 50, "Александр") || "Александр",
    lastName: cleanString(sourceProfile.lastName, 50, "Ажеев") || "Ажеев",
  };

  const validColors = new Set(["lime", "cyan", "violet", "orange"]);
  const validStatuses = new Set(["todo", "in-progress", "review", "done"]);
  const validPriorities = new Set(["low", "medium", "high", "urgent"]);
  const validNotificationTypes = new Set([
    "task-created",
    "task-completed",
    "task-status",
    "task-deleted",
    "project-created",
    "project-updated",
    "project-deleted",
    "deadline-today",
    "deadline-overdue",
  ]);

  const projects = input.projects
    .filter(isRecord)
    .map((item) => ({
      id: cleanString(item.id, 120),
      name: cleanString(item.name, 160),
      description: cleanString(item.description, 2000),
      color: validColors.has(item.color) ? item.color : "lime",
      createdAt: cleanString(item.createdAt, 64, now),
      updatedAt: cleanString(item.updatedAt, 64, now),
    }))
    .filter((item) => item.id && item.name);

  const tasks = input.tasks
    .filter(isRecord)
    .map((item) => ({
      id: cleanString(item.id, 120),
      title: cleanString(item.title, 120),
      description: cleanString(item.description, 5000),
      projectId: typeof item.projectId === "string" ? cleanString(item.projectId, 120) || null : null,
      dueDate: typeof item.dueDate === "string" ? cleanString(item.dueDate, 32) || null : null,
      status: validStatuses.has(item.status) ? item.status : "todo",
      priority: validPriorities.has(item.priority) ? item.priority : "medium",
      tags: Array.isArray(item.tags)
        ? item.tags
            .filter((tag) => typeof tag === "string")
            .slice(0, 8)
            .map((tag) => cleanString(tag, 40))
        : [],
      createdAt: cleanString(item.createdAt, 64, now),
      updatedAt: cleanString(item.updatedAt, 64, now),
      completedAt: typeof item.completedAt === "string" ? cleanString(item.completedAt, 64) || null : null,
    }))
    .filter((item) => item.id && item.title);

  const notifications = sourceNotifications
    .filter(isRecord)
    .map((item) => ({
      id: cleanString(item.id, 160),
      type: validNotificationTypes.has(item.type) ? item.type : null,
      title: cleanString(item.title, 140),
      message: cleanString(item.message, 500),
      entityType: item.entityType === "task" || item.entityType === "project" ? item.entityType : null,
      entityId: typeof item.entityId === "string" ? cleanString(item.entityId, 120) || null : null,
      dedupeKey: cleanString(item.dedupeKey, 240),
      createdAt: cleanString(item.createdAt, 64, now),
      readAt: typeof item.readAt === "string" ? cleanString(item.readAt, 64) || null : null,
    }))
    .filter((item) => item.id && item.type && item.title && item.message && item.dedupeKey)
    .slice(0, 500);

  const dismissedNotificationKeys = sourceDismissedKeys
    .filter((key) => typeof key === "string")
    .map((key) => cleanString(key, 240))
    .filter(Boolean)
    .slice(0, 1000);

  const result = {
    version: 2,
    profile,
    projects,
    tasks,
    notifications,
    dismissedNotificationKeys,
    updatedAt: now,
  };

  const serialized = JSON.stringify(result, null, 2);
  if (Buffer.byteLength(serialized, "utf8") > MAX_WORKSPACE_BYTES) {
    throw new Error("Файл рабочего пространства слишком большой (лимит 20 МБ).");
  }

  return { result, serialized };
}

function createWorkspaceStore({ filePath, getFilePath, fs = nodeFs, now = () => new Date() }) {
  if (typeof filePath !== "string" && typeof getFilePath !== "function") {
    throw new TypeError("Передайте filePath или getFilePath для workspace store.");
  }

  const resolveFilePath = () => getFilePath?.() ?? filePath;
  let writeQueue = Promise.resolve();

  async function archiveInvalidWorkspace(resolvedPath) {
    const backupPath = `${resolvedPath}.corrupted-${now().getTime()}.bak`;
    await fs.rename(resolvedPath, backupPath);
  }

  async function load() {
    const resolvedPath = resolveFilePath();
    let contents;

    try {
      contents = await fs.readFile(resolvedPath, "utf8");
    } catch (error) {
      if (error && error.code === "ENOENT") return null;
      throw error;
    }

    try {
      if (Buffer.byteLength(contents, "utf8") > MAX_WORKSPACE_BYTES) {
        throw new Error("Файл рабочего пространства слишком большой (лимит 20 МБ).");
      }

      const parsed = JSON.parse(contents);
      return normalizeWorkspace(parsed, now().toISOString()).result;
    } catch {
      try {
        await archiveInvalidWorkspace(resolvedPath);
      } catch (archiveError) {
        throw new Error("Не удалось переместить повреждённый workspace в резервную копию.", {
          cause: archiveError,
        });
      }

      return null;
    }
  }

  async function write(input) {
    const timestamp = now().toISOString();
    const { result, serialized } = normalizeWorkspace(input, timestamp);
    const resolvedPath = resolveFilePath();
    const directory = path.dirname(resolvedPath);
    const temporaryPath = `${resolvedPath}.${process.pid}.tmp`;

    await fs.mkdir(directory, { recursive: true });

    try {
      await fs.writeFile(temporaryPath, serialized, {
        encoding: "utf8",
        mode: 0o600,
      });
      await fs.rename(temporaryPath, resolvedPath);
    } catch (error) {
      try {
        await fs.rm(temporaryPath, { force: true });
      } catch {
        // Preserve the original write error.
      }
      throw error;
    }

    return { savedAt: result.updatedAt };
  }

  function save(input) {
    writeQueue = writeQueue.catch(() => undefined).then(() => write(input));
    return writeQueue;
  }

  return { load, save };
}

module.exports = {
  createWorkspaceStore,
  normalizeWorkspace,
};

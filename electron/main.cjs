const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { createWorkspaceStore } = require("./workspace-store.cjs");
const { isAllowedNavigation, isTrustedIpcSender } = require("./security.cjs");

let mainWindow = null;
let nextServer = null;
let nextServerUrl = null;
const DEV_SERVER_URL = "http://localhost:3000";
const trustedOrigins = new Set();
const workspaceStore = createWorkspaceStore({
  getFilePath: () => path.join(app.getPath("userData"), "workspace.json"),
});

function isTrustedIpc(event) {
  return trustedOrigins.size > 0 && isTrustedIpcSender(event, trustedOrigins);
}

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Не удалось получить свободный локальный порт."));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
  });
}

ipcMain.handle("workspace:load", async (event) => {
  if (!isTrustedIpc(event))
    throw new Error("Недоверенный источник IPC-вызова.");
  return workspaceStore.load();
});
ipcMain.handle("workspace:save", async (event, input) => {
  if (!isTrustedIpc(event))
    throw new Error("Недоверенный источник IPC-вызова.");
  return workspaceStore.save(input);
});

function waitForServer(url, child) {
  return new Promise((resolve, reject) => {
    child.once("error", (error) =>
      reject(
        new Error(`Не удалось запустить встроенный сервер: ${error.message}`),
      ),
    );
    const startedAt = Date.now();
    const timeoutMs = 45000;

    const check = () => {
      if (child.exitCode !== null) {
        reject(
          new Error(
            `Локальный сервер Next.js завершился с кодом ${child.exitCode}.`,
          ),
        );
        return;
      }

      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(
            new Error(
              "Не удалось запустить локальный сервер приложения за отведённое время.",
            ),
          );
          return;
        }
        setTimeout(check, 300);
      });
      request.setTimeout(1500, () => request.destroy());
    };

    check();
  });
}

async function startNextServer() {
  if (nextServer && nextServerUrl && nextServer.exitCode === null)
    return nextServerUrl;

  const port = await findAvailablePort();
  const serverDirectory = path.join(process.resourcesPath, "app-server");
  const serverFile = path.join(serverDirectory, "server.js");

  nextServer = spawn(process.execPath, [serverFile], {
    cwd: serverDirectory,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
    },
    stdio: "ignore",
    windowsHide: true,
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url, nextServer);
  nextServerUrl = url;
  return url;
}

async function createWindow() {
  const appUrl = app.isPackaged ? await startNextServer() : DEV_SERVER_URL;
  const appOrigin = new URL(appUrl).origin;
  trustedOrigins.clear();
  trustedOrigins.add(appOrigin);

  mainWindow = new BrowserWindow({
    width: 1520,
    height: 980,
    center: true,
    minWidth: 920,
    minHeight: 680,
    show: false,
    frame: false,
    transparent: false,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
    hasShadow: true,
    backgroundColor: "#080b12",
    autoHideMenuBar: true,
    title: "my desktop — Рабочее пространство",
    icon: path.join(__dirname, "..", "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (!isAllowedNavigation(targetUrl, appOrigin)) event.preventDefault();
  });
  mainWindow.webContents.on("will-redirect", (event, targetUrl) => {
    if (!isAllowedNavigation(targetUrl, appOrigin)) event.preventDefault();
  });

  mainWindow.once("ready-to-show", () => mainWindow && mainWindow.show());
  mainWindow.on("maximize", () => {
    if (mainWindow && !mainWindow.isDestroyed())
      mainWindow.webContents.send("window:maximized", true);
  });
  mainWindow.on("unmaximize", () => {
    if (mainWindow && !mainWindow.isDestroyed())
      mainWindow.webContents.send("window:maximized", false);
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(appUrl);
}

ipcMain.on("window:minimize", (event) => {
  if (isTrustedIpc(event)) mainWindow?.minimize();
});
ipcMain.on("window:toggle-maximize", (event) => {
  if (!isTrustedIpc(event) || !mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on("window:close", (event) => {
  if (isTrustedIpc(event)) mainWindow?.close();
});
ipcMain.handle("window:get-state", (event) => {
  if (!isTrustedIpc(event))
    throw new Error("Недоверенный источник IPC-вызова.");
  return { isMaximized: mainWindow?.isMaximized() ?? false };
});

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    app.setAppUserModelId("com.mydesktop.app");
    try {
      await createWindow();
      app.on("activate", async () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          try {
            await createWindow();
          } catch (error) {
            dialog.showErrorBox(
              "Ошибка запуска my desktop",
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      });
    } catch (error) {
      dialog.showErrorBox(
        "Не удалось запустить my desktop",
        error instanceof Error ? error.message : String(error),
      );
      app.quit();
    }
  });
}

app.on("before-quit", () => {
  if (nextServer && !nextServer.killed) nextServer.kill();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

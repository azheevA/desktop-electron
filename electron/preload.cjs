const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "desktopApp",
  Object.freeze({
    isDesktop: true,
    platform: process.platform,
    minimize: () => ipcRenderer.send("window:minimize"),
    toggleMaximize: () => ipcRenderer.send("window:toggle-maximize"),
    close: () => ipcRenderer.send("window:close"),
    getWindowState: () => ipcRenderer.invoke("window:get-state"),
    onMaximizeChange: (callback) => {
      const listener = (_event, isMaximized) => callback(Boolean(isMaximized));
      ipcRenderer.on("window:maximized", listener);
      return () => ipcRenderer.removeListener("window:maximized", listener);
    },
    loadWorkspace: () => ipcRenderer.invoke("workspace:load"),
    saveWorkspace: (data) => ipcRenderer.invoke("workspace:save", data),
  }),
);

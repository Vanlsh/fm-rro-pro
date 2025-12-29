const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  ping: () => ipcRenderer.invoke("ping"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateDownloadProgress: (callback) =>
    ipcRenderer.on("update-download-progress", (_event, info) =>
      callback(info)
    ),
});

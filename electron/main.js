import { app, BrowserWindow, ipcMain } from "electron";
import updaterPkg from "electron-updater";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { autoUpdater } = updaterPkg;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const devServerURL =
    process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";

  if (
    process.env.NODE_ENV === "development" ||
    process.env.VITE_DEV_SERVER_URL
  ) {
    mainWindow.loadURL(devServerURL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  autoUpdater.on("download-progress", (info) => {
    if (mainWindow) {
      mainWindow.webContents.send("update-download-progress", info);
    }
  });

  ipcMain.handle("check-for-updates", async () => {
    if (!app.isPackaged) {
      return {
        status: "unavailable",
        message: "Updates are only available in packaged builds.",
      };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      const version = result?.updateInfo?.version;

      if (!version || version === app.getVersion()) {
        return { status: "up-to-date" };
      }

      await autoUpdater.downloadUpdate();
      return { status: "downloaded", version };
    } catch (error) {
      const message = error?.message || "Unable to check for updates.";
      if (
        message.includes("No published versions") ||
        message.includes("No update available")
      ) {
        return { status: "up-to-date" };
      }
      return { status: "error", message };
    }
  });

  ipcMain.handle("install-update", async () => {
    if (!app.isPackaged) {
      return {
        status: "unavailable",
        message: "Installation is only available in packaged builds.",
      };
    }
    try {
      autoUpdater.quitAndInstall();
      return { status: "installing" };
    } catch (error) {
      return {
        status: "error",
        message: error?.message || "Failed to start update installation.",
      };
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("ping", () => "pong");

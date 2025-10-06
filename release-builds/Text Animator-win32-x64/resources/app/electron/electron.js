// electron/electron.js
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { getFonts } from "font-list";  // ✅ use font-list

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC handler for fonts ---
ipcMain.handle("get-fonts", async () => {
  try {
    const fonts = await getFonts(); // returns array of font family names
    return fonts.sort();
  } catch (err) {
    console.error("Error fetching fonts:", err);
    return ["Arial", "Times New Roman", "Courier New"]; // fallback
  }
});

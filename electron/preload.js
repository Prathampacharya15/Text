// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe API surface
contextBridge.exposeInMainWorld("electronAPI", {
  getFonts: () => ipcRenderer.invoke("get-fonts") // async call
});

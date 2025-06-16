const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getSources: () => ipcRenderer.invoke("get-sources"),
  saveVideo: (folderName, filename, buffer) =>
    ipcRenderer.send("save-video", folderName, filename, buffer),
  openFolder: () => ipcRenderer.send("open-folder"),
});

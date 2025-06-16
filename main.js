const { app, BrowserWindow, ipcMain, desktopCapturer, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Handle screen/window sources
  ipcMain.handle('get-sources', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }));
  });

  // ✅ Save video IPC handler
ipcMain.on("save-video", (event, folderName, fileName, buffer) => {
  const videosDir = path.join(__dirname, 'videos', folderName);

  // Create the folder if it doesn't exist
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const filePath = path.join(videosDir, fileName);

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error("💥 Error saving video:", err);
    } else {
      console.log("✅ Video saved to:", filePath);
    }
  });
});

  // ✅ Open folder from renderer
  ipcMain.on('open-folder', () => {
    shell.openPath(path.join(__dirname, 'videos'));
  });
});

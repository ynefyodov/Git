const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");

ipcMain.handle("coop:get-lan-ws-urls", (_evt, port) => {
  const p = Number(port);
  const safePort = p > 0 && p < 65536 ? p : 8765;
  const out = [];
  const nets = os.networkInterfaces();
  for (const addrs of Object.values(nets)) {
    if (!addrs) continue;
    for (const a of addrs) {
      const fam = a.family;
      const isV4 = fam === "IPv4" || fam === 4;
      if (isV4 && !a.internal) {
        out.push(`ws://${a.address}:${safePort}`);
      }
    }
  }
  return [...new Set(out)];
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    autoHideMenuBar: true,
    backgroundColor: "#1d1518",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "..", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

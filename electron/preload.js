const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("coopHostInfo", {
  getLanWsUrls(port) {
    return ipcRenderer.invoke("coop:get-lan-ws-urls", port);
  },
});

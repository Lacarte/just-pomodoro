const { contextBridge, ipcRenderer } = require('electron');

// Expose the ipcRenderer to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    focusApp: () => ipcRenderer.invoke('focusApp')

});


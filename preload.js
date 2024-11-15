const { contextBridge, ipcRenderer } = require('electron');

// Expose the ipcRenderer to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    focusApp: () => ipcRenderer.invoke('focusApp'),
    toggleTray: (value) => ipcRenderer.invoke('toggleTray', value),
    toggleStartup: (value) => ipcRenderer.invoke('toggleStartup', value),
    setAlwaysOnTop: (value) => ipcRenderer.invoke('setAlwaysOnTop', value)

});


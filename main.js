const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, 'public', 'icon.png'), // Path to your icon file
        webPreferences: {
            contextIsolation: true, // Ensure this is set to true
            enableRemoteModule: false, // Set to false unless needed
            nodeIntegration: false // Set to false to avoid security risks
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    
    // Remove the default menu
    mainWindow.removeMenu();

    // Open DevTools (Optional for development)
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

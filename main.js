const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const packageJson = require('./package.json'); // Load package.json

let mainWindow;
let tray = null;

function createWindow() {
    app.setAppUserModelId('io.lcrt.justpomodoro'); // Set a custom appId

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, 'public', 'icon.png'), // Path to your icon file
        webPreferences: {
            contextIsolation: true, // Ensure this is set to true
            enableRemoteModule: false, // Set to false unless needed
            nodeIntegration: false, // Set to false to avoid security risks
            preload: path.join(__dirname, 'preload.js') // Use a preload script

        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    // Remove the default menu
    mainWindow.removeMenu();
    // Send version to the renderer process
    ipcMain.handle('get-app-version', () => {
        return packageJson.version;
    });


    ipcMain.handle('toggleTray', (event, isTrayEnabled) => {
        if (isTrayEnabled) {
            if (!tray) {
                tray = new Tray('public/icon.png');
                tray.setContextMenu(Menu.buildFromTemplate([
                    { label: 'Show App', click: () => mainWindow.show() },
                    { label: 'Quit', click: () => app.quit() }
                ]));
                tray.setToolTip('Just Pomodoro');
            }
            mainWindow.hide();
        } else {
            if (tray) {
                tray.destroy();
                tray = null;
            }
            mainWindow.show();
        }
    });
    
    ipcMain.handle('toggleStartup', (event, isStartupEnabled) => {
        app.setLoginItemSettings({
            openAtLogin: isStartupEnabled
        });
    });
    
    ipcMain.handle('setAlwaysOnTop', (event, isAlwaysOnTop) => {
        mainWindow.setAlwaysOnTop(isAlwaysOnTop);
    });

    // Open DevTools (Optional for development)
    //mainWindow.webContents.openDevTools();
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

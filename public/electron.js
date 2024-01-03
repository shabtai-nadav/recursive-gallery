const isDev = require('electron-is-dev');
const {app, BrowserWindow, dialog} = require("electron");
const path = require('node:path');
const fs = require('fs');
const mime = require('mime-types');
const {flatMap, filter, map, uniq} = require('lodash');
const {ipcMain, remote} = require('electron');
const openExplorer = require('open-file-explorer');

let entryPoint = process.argv[isDev ? 2 : 1];

const PATH_ONLY_MIME_TYPES = [
    'image/svg+xml',
    'image/bmp',
    'image/png',
    'image/webp',
    'image/jpeg',
    'image/gif',
];

const PLAIN_MIME_TYPES = [];

const BASE_64_MIME_TYPES = [];

const NONE_MIME_TYPES = [
    'video/quicktime',
    'video/mp4',
    'video/webm',
    'video/x-matroska',
    // 'video/mpeg', // NOT SUPPORTED
    // 'video/x-ms-wmv', // NOT SUPPORTED
    // 'video/x-msvideo', // NOT SUPPORTED
];

const SUPPORTED_MIME_TYPES = [
    ...PATH_ONLY_MIME_TYPES,
    ...BASE_64_MIME_TYPES,
    ...PLAIN_MIME_TYPES,
    ...NONE_MIME_TYPES
];

let window;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function findMedia(dirPath, recursive) {
    const content = map(fs.readdirSync(dirPath), c => {
        const filePath = path.resolve(dirPath, c);
        const stats = fs.statSync(filePath);

        return {path: filePath, dirPath, name: c, created: stats.birthtimeMs, updated: stats.ctimeMs, size: stats.size};
    });

    const subDirs = filter(content, c => fs.lstatSync(c.path).isDirectory());
    
    return [
        ...filter(content, c => SUPPORTED_MIME_TYPES.includes(mime.lookup(c.path))),
        ...recursive ? flatMap(subDirs, dir => findMedia(dir.path, recursive)) : []
    ];
}

ipcMain.handle("file/list", (event, recursive) => {
    if (fs.lstatSync(entryPoint).isDirectory()) {
        return findMedia(entryPoint, recursive);
    }

    return findMedia(path.dirname(entryPoint), recursive);
});

ipcMain.handle("file/get", (event, contentPath) => {
    try {
        const fileMimeType = mime.lookup(contentPath);
    
        let file;
    
        if (BASE_64_MIME_TYPES.includes(fileMimeType)) {
            file = fs.readFileSync(contentPath).toString('base64');
        } else if (PLAIN_MIME_TYPES.includes(fileMimeType)) {
            file = fs.readFileSync(contentPath).toString();
        }
    
        return {
            file,
            path: contentPath,
            mimeType: fileMimeType
        }
    } catch (e) {
        console.error(e, contentPath);
    }
});

ipcMain.handle('file/root', () => {
    return path.dirname(entryPoint);
});

ipcMain.handle("file/entrypoint", () => {
    return entryPoint;
});

ipcMain.handle('file/entrypoint/file', async () => {
    const selectedPath = await dialog.showOpenDialog({
        properties: ['openFile']
    });

    entryPoint = selectedPath.filePaths[0];

    return entryPoint;
});

ipcMain.handle('file/entrypoint/directory', async () => {
    const selectedPath = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    entryPoint = selectedPath.filePaths[0];

    return entryPoint;
});

ipcMain.handle('directory/open', (event, directory) => {
    openExplorer(directory);

    return null;
});

ipcMain.handle('devtools', () => {
    window.webContents.openDevTools();

    return null;
});

function createWindow() {
    // Create the browser window.
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });

    if (isDev) {
        //load the index.html from a url
        window.loadURL('http://localhost:3000');

        // Open the DevTools.
        window.webContents.openDevTools();

        return;
    }


    window.loadFile(path.join(__dirname, 'index.html'));

    window.on('closed', () => (window = null));
}
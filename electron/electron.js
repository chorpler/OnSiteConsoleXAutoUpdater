'use strict';
const electron = require('electron');
const PDFWindow = require('electron-pdf-window');
const windowStateKeeper = require('electron-window-state');
// Module to control application life.
const { app } = electron;
// Module to create native browser window.
const { BrowserWindow } = electron;
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let win, winUpdate;
function createWindow() {
    // Create the browser window.
    // win = new BrowserWindow({
    //     width: 1600,
    //     height: 900
    // });
    // Load the previous state with fallback to defaults
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1600,
      defaultHeight: 900,
    });

    // Create the window using the state information
    win = new BrowserWindow({
      'x': mainWindowState.x,
      'y': mainWindowState.y,
      'width': mainWindowState.width,
      'height': mainWindowState.height
    });
    // win = new PDFWindow({
    //   'x': mainWindowState.x,
    //   'y': mainWindowState.y,
    //   'width': mainWindowState.width,
    //   'height': mainWindowState.height
    // });

    // PDFWindow.addSupport(win);

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(win);
    var url = 'file://' + __dirname + '/../www/index.html';
    var Args = process.argv.slice(2);
    Args.forEach(function (val) {
        if (val === "test") {
          url = 'http://localhost:8100'
        }
    });
    // and load the index.html of the app.
    win.loadURL(url);
    // Open the DevTools.
    // win.webContents.openDevTools();
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

function sendStatusToWindow(text) {
  log.info(text);
  winUpdate.webContents.send('message', text);
}
function createDefaultWindow() {
  winUpdate = new BrowserWindow();
  winUpdate.webContents.openDevTools();
  winUpdate.on('closed', () => {
    winUpdate = null;
  });
  winUpdate.loadURL(`file://${__dirname}/../www/version.html#v${app.getVersion()}`);
  return winUpdate;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log("Electron: got app ready event!");
  if(!win) {
    createWindow();
  }
  if(!winUpdate) {
    createDefaultWindow();
  }
  autoUpdater.checkForUpdates();
  // createWindow();
});

autoUpdater.on('checking-for-update', () => {
  console.log(`autoUpdater(): received event 'checking-for-update'.`);
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (ev, info) => {
  console.log(`autoUpdater(): received event 'update-available':\n`, ev, `\n`, info);
  sendStatusToWindow('Update available.');
});
autoUpdater.on('error', (ev, err) => {
  console.log(`autoUpdater(): received event 'error':\n`, err);
  sendStatusToWindow('Error in auto-updater.');
  createWindow();
});
autoUpdater.on('download-progress', (ev, progressObj) => {
  console.log(`autoUpdater(): received event 'progress':\n`, progressObj);
  sendStatusToWindow('Download progress...');
});

autoUpdater.on('update-downloaded', (ev, info) => {
  console.log(`autoUpdater(): received event 'update-downloaded':\n`, ev, `\n`, info);
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  };

  dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('update-not-available', (ev, info) => {
  console.log(`autoUpdater(): received event 'update-not-available':\n`, ev, `\n`, info);
  sendStatusToWindow('Update not available.');
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

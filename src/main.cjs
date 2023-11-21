const { app, BrowserWindow, Menu } = require("electron");
const { autoUpdater, AppUpdater } = require("electron-updater");
const log = require("electron-log");
const spawn = require("child_process").spawn;
const path = require("path");

// Auto updates squirrel
const runStartupEvent = function (args, done) {
  const updateExe = path.resolve(
    path.dirname(process.execPath),
    "..",
    "Update.exe"
  );
  spawn(updateExe, args, {
    detached: true,
  }).on("close", done);
};

const handleStartupEvent = function () {
  if (process.platform !== "win32") {
    return false;
  }

  const squirrelCommand = process.argv[1];
  const target = path.basename(process.execPath);

  switch (squirrelCommand) {
    case "--squirrel-install":
    case "--squirrel-updated":
      runStartupEvent(["--createShortcut=" + target + ""], app.quit);
      app.quit();

      return true;
    case "--squirrel-uninstall":
      runStartupEvent(["--removeShortcut=" + target + ""], app.quit);
      app.quit();

      return true;
    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
};

if (handleStartupEvent()) {
  return;
}

/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates` callback from `updater` for the click property of `Check Updates...` MenuItem.
 */

// const server = "http://127.0.0.1:8080";
// const url = `${server}/update/${process.platform}/${app.getVersion()}`;
// autoUpdater.setFeedURL({ url });

// setInterval(() => {
// autoUpdater.checkForUpdates();
// }, 60000);

// export this to MenuItem click callback
function checkForUpdates(menuItem, focusedWindow, event) {
  console.log("checkForUpdates", menuItem, focusedWindow, event);
  updater = menuItem;
  updater.enabled = false;
  autoUpdater.checkForUpdates();
}

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
let template = [];
// OS X
const name = app.getName();
template.unshift({
  label: name,
  submenu: [
    {
      label: "About " + name,
      role: "about",
    },
    {
      label: "Check for updates",
      click: checkForUpdates,
    },
    {
      label: "Quit",
      accelerator: "Command+Q",
      click() {
        app.quit();
      },
    },
  ],
});

//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(data, type = "message") {
  const obj = {
    type,
    data,
  };
  log.info(data);
  win.webContents.send("message", JSON.stringify(obj));
}

function createDefaultWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.webContents.openDevTools();
  win.on("closed", () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});

autoUpdater.on("update-available", (ev, info) => {
  sendStatusToWindow("Update available.");
});

autoUpdater.on("update-not-available", (ev, info) => {
  sendStatusToWindow("Update not available.");
});

autoUpdater.on("error", (info) => {
  sendStatusToWindow(`Update error: ${info}`);
});

autoUpdater.on("download-progress", (progressObj) => {
  sendStatusToWindow(
    {
      bps: progressObj.bytesPerSecond,
      pct: progressObj.percent,
      curr: progressObj.transferred,
      total: progressObj.total,
    },
    "progress"
  );
});

autoUpdater.on("update-downloaded", (ev, info) => {
  sendStatusToWindow("Update downloaded; will install in 5 seconds");
  autoUpdater.quitAndInstall();
});

app.on("ready", function () {
  // Create the Menu
  console.log("app-is-ready");
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createDefaultWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  app.quit();
});

//-------------------------------------------------------------------
// Auto updates
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (ev, info) => {
// })
// autoUpdater.on('update-not-available', (ev, info) => {
// })
// autoUpdater.on('error', (ev, err) => {
// })
// autoUpdater.on('download-progress', (ev, progressObj) => {
// })

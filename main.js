const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const archiver = require("archiver");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // Use app.isPackaged to determine the correct path
  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar", "index.html")
    : path.join(__dirname, "index.html");

  win.loadFile(indexPath);

  // Open DevTools in development mode
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

if (process.platform === "darwin") {
  app.dock.setIcon(path.join(__dirname, "build", "icon.png"));
}

// Add IPC handler for executing commands
ipcMain.on("execute-command", (event, command) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      event.reply("command-result", `Error: ${error.message}`);
      return;
    }
    if (stderr) {
      event.reply("command-result", `stderr: ${stderr}`);
      return;
    }
    event.reply("command-result", stdout);
  });
});

// Add IPC handler for zipping RO-Crate
// Replace the existing ipcMain.on("zip-rocrate", ...) with this:
ipcMain.handle("zip-rocrate", async (event, rocratePath) => {
  return new Promise((resolve, reject) => {
    // Get the name of the input folder
    const folderName = path.basename(rocratePath);
    // Create the output zip file path
    const outputPath = path.join(
      path.dirname(rocratePath),
      `${folderName}.zip`
    );
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on("close", function () {
      resolve({ success: true, zipPath: output.path });
    });

    archive.on("error", function (err) {
      reject({ success: false, error: err.message });
    });

    archive.pipe(output);
    // Add the contents of the folder to the zip file,
    // using the folder name as the root in the zip
    archive.directory(rocratePath, folderName);
    archive.finalize();
  });
});

ipcMain.handle("open-directory-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result;
});

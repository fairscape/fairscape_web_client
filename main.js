const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const archiver = require("archiver");
const duckdb = require("duckdb");
const {
  generateEvidenceGraphs,
} = require("./src/rocrate/evidence_graph_builder");

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
}

async function getParquetSchema(filePath) {
  return new Promise((resolve, reject) => {
    const db = new duckdb.Database(":memory:");
    db.all(
      `DESCRIBE SELECT * FROM read_parquet('${filePath}')`,
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          const properties = result.map((column, index) => ({
            name: column.column_name,
            description: `Column ${column.column_name}`,
            index: index.toString(),
            valueURL: "",
            type: mapDuckDBTypeToJsonSchema(column.column_type),
          }));
          resolve(properties);
        }
        db.close();
      }
    );
  });
}

function mapDuckDBTypeToJsonSchema(duckDBType) {
  const typeMap = {
    INTEGER: "integer",
    BIGINT: "integer",
    DOUBLE: "number",
    VARCHAR: "string",
    BOOLEAN: "boolean",
    // Add more mappings as needed
  };
  return typeMap[duckDBType.toUpperCase()] || "string";
}

async function convertParquetToSchemaJSON(rocratePath, parquetFilePath) {
  const fullPath = path.join(rocratePath, parquetFilePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  try {
    const properties = await getParquetSchema(fullPath);
    const schemaJSON = {
      name: `Schema for ${path.basename(parquetFilePath, ".parquet")}`,
      description: `Auto-generated schema for Parquet file: ${path.basename(
        parquetFilePath
      )}`,
      properties: properties,
      separator: ",",
      header: true,
    };
    return schemaJSON;
  } catch (error) {
    console.error("Error reading Parquet file:", error);
    throw error;
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

// Add IPC handler for generating evidence graphs
ipcMain.handle("generate-evidence-graphs", async (event, rocratePath) => {
  try {
    const metadataPath = path.join(rocratePath, "ro-crate-metadata.json");
    const metadata = JSON.parse(
      await fs.promises.readFile(metadataPath, "utf8")
    );
    const updatedMetadata = generateEvidenceGraphs(metadata);
    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(updatedMetadata, null, 2)
    );
    return { success: true };
  } catch (error) {
    console.error("Error generating evidence graphs:", error);
    return { success: false, error: error.message };
  }
});

// Add IPC handler for zipping RO-Crate
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

// Add IPC handler for Parquet to Schema conversion
ipcMain.handle(
  "convert-parquet-to-schema",
  async (event, rocratePath, parquetFilePath) => {
    try {
      const schemaJSON = await convertParquetToSchemaJSON(
        rocratePath,
        parquetFilePath
      );
      return schemaJSON;
    } catch (error) {
      console.error("Error converting Parquet to Schema:", error);
      throw error;
    }
  }
);

module.exports = { createWindow };

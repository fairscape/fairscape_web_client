/**
 * Generates .ipynb notebook JSON and launches JupyterLite in a new tab
 * with the notebook pre-loaded.
 */

interface NotebookCell {
  cell_type: "code" | "markdown";
  source: string[];
  metadata: Record<string, any>;
  outputs?: any[];
  execution_count?: number | null;
}

interface NotebookJSON {
  nbformat: number;
  nbformat_minor: number;
  metadata: {
    kernelspec: { name: string; display_name: string; language: string };
    language_info: { name: string; version: string };
  };
  cells: NotebookCell[];
}

function makeMarkdownCell(lines: string[]): NotebookCell {
  return {
    cell_type: "markdown",
    source: lines.map((l, i) => (i < lines.length - 1 ? l + "\n" : l)),
    metadata: {},
  };
}

function makeCodeCell(code: string): NotebookCell {
  return {
    cell_type: "code",
    source: code.split("\n").map((l, i, arr) => (i < arr.length - 1 ? l + "\n" : l)),
    metadata: {},
    outputs: [],
    execution_count: null,
  };
}

function buildNotebook(cells: NotebookCell[]): NotebookJSON {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        name: "python",
        display_name: "Python (Pyodide)",
        language: "python",
      },
      language_info: {
        name: "python",
        version: "3.11",
      },
    },
    cells,
  };
}

/**
 * Generate a schema-focused notebook for exploring table structures.
 */
export function generateSchemaNotebook(
  title: string,
  pythonCode: string
): NotebookJSON {
  return buildNotebook([
    makeMarkdownCell([
      `# Schema Explorer: ${title}`,
      "",
      "This notebook loads the datasets and inspects their schemas, column types, and join keys.",
      "Run all cells to get started.",
    ]),
    makeCodeCell("%pip install fairscape-models"),
    makeCodeCell(pythonCode),
    makeMarkdownCell(["## Inspect Column Types"]),
    makeCodeCell(
      "# Show dtypes for each loaded DataFrame\nimport pandas as pd\n\n" +
      "for name, obj in list(locals().items()):\n" +
      "    if isinstance(obj, pd.DataFrame):\n" +
      '        print(f"\\n--- {name} ---")\n' +
      "        print(f\"Shape: {obj.shape}\")\n" +
      "        print(obj.dtypes)\n"
    ),
    makeMarkdownCell(["## Preview Data"]),
    makeCodeCell(
      "# Show first few rows of each DataFrame\nfor name, obj in list(locals().items()):\n" +
      "    if isinstance(obj, pd.DataFrame):\n" +
      '        print(f"\\n--- {name} (first 5 rows) ---")\n' +
      "        display(obj.head())\n"
    ),
    makeMarkdownCell(["## Your Analysis", "", "Add cells below to explore the data further."]),
    makeCodeCell(""),
  ]);
}

/**
 * Generate a code-focused notebook from whatever Python snippet is displayed.
 * When metadata is included, adds a cell to load ro-crate-metadata.json.
 */
export function generateCodeNotebook(
  title: string,
  pythonCode: string,
  includeMetadata?: boolean
): NotebookJSON {
  const cells: NotebookCell[] = [
    makeMarkdownCell([
      `# ${title}`,
      "",
      "Auto-generated notebook from FAIRSCAPE. Run all cells to load and explore the data.",
    ]),
    makeCodeCell("%pip install fairscape-models"),
    makeCodeCell(pythonCode),
  ];

  if (includeMetadata) {
    cells.push(
      makeMarkdownCell([
        "## RO-Crate Metadata",
        "",
        "The `ro-crate-metadata.json` file is available in the file browser. "
        + "Run the cell below to load it.",
      ]),
      makeCodeCell(
        "import json\n\n"
        + 'with open("ro-crate-metadata.json") as f:\n'
        + "    rocrate_metadata = json.load(f)\n\n"
        + 'print(f"RO-Crate: {rocrate_metadata.get(\'name\', \'Unknown\')}")\n'
        + 'print(f"Entities in @graph: {len(rocrate_metadata.get(\'@graph\', []))}")\n'
        + "for entry in rocrate_metadata.get('@graph', []):\n"
        + "    print(f\"  - {entry.get('@type', '?'):30s} {entry.get('name', entry.get('@id', ''))}\")"
      ),
    );
  }

  cells.push(
    makeMarkdownCell(["## Explore"]),
    makeCodeCell(""),
  );

  return buildNotebook(cells);
}

/**
 * Write a file directly into JupyterLite's IndexedDB virtual filesystem.
 * This bypasses localStorage (which has a ~5 MB quota) and writes straight
 * to the same localforage-backed store that JupyterLite uses.
 */
function writeToJupyterLiteFS(
  dbName: string,
  fname: string,
  content: string,
  mimetype: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files");
      }
    };

    req.onerror = () => reject(req.error);

    req.onsuccess = () => {
      const db = req.result;

      // If the "files" store doesn't exist yet, we need to create it
      // by reopening with a version bump.
      if (!db.objectStoreNames.contains("files")) {
        const newVersion = db.version + 1;
        db.close();
        const upgrade = indexedDB.open(dbName, newVersion);
        upgrade.onupgradeneeded = () => {
          upgrade.result.createObjectStore("files");
        };
        upgrade.onerror = () => reject(upgrade.error);
        upgrade.onsuccess = () => {
          putFile(upgrade.result);
        };
        return;
      }

      putFile(db);
    };

    function putFile(db: IDBDatabase) {
      const now = new Date().toISOString();
      const model = {
        name: fname,
        path: fname,
        format: "text",
        created: now,
        last_modified: now,
        content,
        mimetype,
        size: content.length,
        writable: true,
        type: "file",
      };

      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const put = store.put(model, fname);
      put.onsuccess = () => { db.close(); resolve(); };
      put.onerror = () => { db.close(); reject(put.error); };
    }
  });
}

/**
 * Write notebook to localStorage and open JupyterLite in a new tab.
 * Large extra files (ro-crate-metadata.json) are written directly to
 * JupyterLite's IndexedDB to avoid the localStorage quota limit.
 */
export async function openInJupyterLite(
  notebook: NotebookJSON,
  filename?: string,
  metadata?: any
): Promise<void> {
  const fname = filename || "explore.ipynb";

  // The notebook itself is small — localStorage is fine for it.
  localStorage.setItem(
    "fairscape:notebook",
    JSON.stringify({ filename: fname, content: notebook })
  );

  // Write large files directly to JupyterLite's IndexedDB.
  // DB name matches the convention in bridge.html.
  if (metadata) {
    const basePath = "/jupyterlite/";
    const dbName = `JupyterLite Storage - ${basePath}`;
    try {
      await writeToJupyterLiteFS(
        dbName,
        "ro-crate-metadata.json",
        JSON.stringify(metadata, null, 2),
        "application/json"
      );
    } catch (err) {
      console.warn("[openInJupyterLite] Failed to write metadata to IndexedDB:", err);
    }
  }

  // Open via the bridge page, which injects the notebook into JupyterLite's
  // IndexedDB filesystem before redirecting to the lab UI.
  const baseUrl = `${window.location.origin}/jupyterlite/bridge.html`;
  window.open(baseUrl, "_blank");
}

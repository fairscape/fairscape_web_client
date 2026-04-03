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
    makeCodeCell("%pip install pyarrow pandas"),
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
 */
export function generateCodeNotebook(
  title: string,
  pythonCode: string
): NotebookJSON {
  return buildNotebook([
    makeMarkdownCell([
      `# ${title}`,
      "",
      "Auto-generated notebook from FAIRSCAPE. Run all cells to load and explore the data.",
    ]),
    makeCodeCell("%pip install pyarrow pandas"),
    makeCodeCell(pythonCode),
    makeMarkdownCell(["## Explore"]),
    makeCodeCell(""),
  ]);
}

/**
 * Write notebook to localStorage and open JupyterLite in a new tab.
 * The bridge script in JupyterLite's index.html reads from localStorage
 * and injects the notebook into the virtual filesystem.
 */
export function openInJupyterLite(notebook: NotebookJSON, filename?: string): void {
  const fname = filename || "explore.ipynb";

  localStorage.setItem(
    "fairscape:notebook",
    JSON.stringify({
      filename: fname,
      content: notebook,
    })
  );

  // Open JupyterLite lab in a new tab
  // The base URL depends on where the app is hosted. In dev it's at /jupyterlite/lab/
  const baseUrl = `${window.location.origin}/jupyterlite/lab/index.html`;
  window.open(baseUrl, "_blank");
}

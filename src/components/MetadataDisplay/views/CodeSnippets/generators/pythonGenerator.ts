interface DatasetInfo {
  name: string;
  contentUrl: string;
  fileFormat?: string;
  schemaName?: string;
  columns?: string[];
}

interface JoinKeyInfo {
  column: string;
  datasets: string[];
}

function varName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase()
    .slice(0, 30);
}

function isParquet(ds: DatasetInfo): boolean {
  const fmt = (ds.fileFormat || "").toLowerCase();
  const url = (ds.contentUrl || "").toLowerCase();
  return fmt.includes("parquet") || url.endsWith(".parquet");
}

export function generatePythonSingle(ds: DatasetInfo): string {
  const vn = varName(ds.name) || "df";
  const reader = isParquet(ds) ? "pd.read_parquet" : "pd.read_csv";

  let code = `import pandas as pd\n\n`;
  code += `# Load: ${ds.name}\n`;
  code += `${vn} = ${reader}("${ds.contentUrl}")\n\n`;
  code += `print(${vn}.shape)\n`;
  code += `print(${vn}.head())\n`;

  if (ds.columns && ds.columns.length > 0) {
    code += `\n# Available columns:\n`;
    code += `# ${ds.columns.join(", ")}\n`;
  }

  return code;
}

export function generatePythonMulti(
  datasets: DatasetInfo[],
  joinKeys: JoinKeyInfo[]
): string {
  let code = `import pandas as pd\n\n`;

  // Load each dataset
  for (const ds of datasets) {
    const vn = varName(ds.name) || "df";
    const reader = isParquet(ds) ? "pd.read_parquet" : "pd.read_csv";
    code += `# Load: ${ds.name}\n`;
    code += `${vn} = ${reader}("${ds.contentUrl}")\n\n`;
  }

  // Join code if there are join keys
  if (joinKeys.length > 0 && datasets.length >= 2) {
    code += `# --- Join datasets ---\n`;
    const primaryJoinCols = joinKeys
      .filter((jk) => jk.datasets.length >= 2)
      .slice(0, 5)
      .map((jk) => jk.column);

    if (primaryJoinCols.length > 0) {
      const firstVar = varName(datasets[0].name) || "df1";
      code += `merged = ${firstVar}\n`;

      for (let i = 1; i < datasets.length; i++) {
        const vn = varName(datasets[i].name) || `df${i + 1}`;
        // Find join columns shared between these two datasets
        const sharedCols = primaryJoinCols.filter((col) => {
          const jk = joinKeys.find((j) => j.column === col);
          return (
            jk &&
            jk.datasets.includes(datasets[0].name) &&
            jk.datasets.includes(datasets[i].name)
          );
        });

        if (sharedCols.length > 0) {
          const onClause =
            sharedCols.length === 1
              ? `"${sharedCols[0]}"`
              : `[${sharedCols.map((c) => `"${c}"`).join(", ")}]`;
          code += `merged = merged.merge(${vn}, on=${onClause}, how="outer", suffixes=("", "_${vn}"))\n`;
        }
      }

      code += `\nprint(merged.shape)\n`;
      code += `print(merged.head())\n`;
    }
  }

  return code;
}

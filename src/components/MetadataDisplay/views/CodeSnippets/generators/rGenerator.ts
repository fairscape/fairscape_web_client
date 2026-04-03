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
    .replace(/[^a-zA-Z0-9_.]/g, "_")
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

export function generateRSingle(ds: DatasetInfo): string {
  const vn = varName(ds.name) || "df";

  let code = "";
  if (isParquet(ds)) {
    code += `library(arrow)\n\n`;
    code += `# Load: ${ds.name}\n`;
    code += `${vn} <- read_parquet("${ds.contentUrl}")\n\n`;
  } else {
    code += `# Load: ${ds.name}\n`;
    code += `${vn} <- read.csv("${ds.contentUrl}")\n\n`;
  }

  code += `dim(${vn})\n`;
  code += `head(${vn})\n`;

  if (ds.columns && ds.columns.length > 0) {
    code += `\n# Available columns:\n`;
    code += `# ${ds.columns.join(", ")}\n`;
  }

  return code;
}

export function generateRMulti(
  datasets: DatasetInfo[],
  joinKeys: JoinKeyInfo[]
): string {
  let code = `library(dplyr)\n`;
  if (datasets.some(isParquet)) {
    code += `library(arrow)\n`;
  }
  code += `\n`;

  for (const ds of datasets) {
    const vn = varName(ds.name) || "df";
    if (isParquet(ds)) {
      code += `# Load: ${ds.name}\n`;
      code += `${vn} <- read_parquet("${ds.contentUrl}")\n\n`;
    } else {
      code += `# Load: ${ds.name}\n`;
      code += `${vn} <- read.csv("${ds.contentUrl}")\n\n`;
    }
  }

  if (joinKeys.length > 0 && datasets.length >= 2) {
    code += `# --- Join datasets ---\n`;
    const primaryJoinCols = joinKeys
      .filter((jk) => jk.datasets.length >= 2)
      .slice(0, 5)
      .map((jk) => jk.column);

    if (primaryJoinCols.length > 0) {
      const firstVar = varName(datasets[0].name) || "df1";
      code += `merged <- ${firstVar}\n`;

      for (let i = 1; i < datasets.length; i++) {
        const vn = varName(datasets[i].name) || `df${i + 1}`;
        const sharedCols = primaryJoinCols.filter((col) => {
          const jk = joinKeys.find((j) => j.column === col);
          return (
            jk &&
            jk.datasets.includes(datasets[0].name) &&
            jk.datasets.includes(datasets[i].name)
          );
        });

        if (sharedCols.length > 0) {
          const byCols = sharedCols.map((c) => `"${c}"`).join(", ");
          code += `merged <- full_join(merged, ${vn}, by = c(${byCols}))\n`;
        }
      }

      code += `\ndim(merged)\n`;
      code += `head(merged)\n`;
    }
  }

  return code;
}

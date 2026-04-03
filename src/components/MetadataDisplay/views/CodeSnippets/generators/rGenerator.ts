import type { DatasetInfo, DatasetGroup, JoinKeyInfo } from "../CodeSnippetsView";

function varName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_.]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase()
    .slice(0, 30);
}

function isParquet(fmt: string, url: string): boolean {
  return (fmt || "").toLowerCase().includes("parquet") || (url || "").toLowerCase().endsWith(".parquet");
}

export function generateRSingle(ds: DatasetInfo): string {
  const vn = varName(ds.name) || "df";
  const parquet = isParquet(ds.fileFormat || "", ds.contentUrl);

  let code = "";
  if (parquet) {
    code += `library(arrow)\n\n`;
    code += `# Load: ${ds.name}\n`;
    code += `${vn} <- read_parquet("${ds.contentUrl}")\n\n`;
  } else {
    code += `# Load: ${ds.name}\n`;
    code += `${vn} <- read.csv("${ds.contentUrl}")\n\n`;
  }

  code += `dim(${vn})\n`;
  code += `head(${vn})\n`;
  return code;
}

export function generateRMulti(
  groups: DatasetGroup[],
  ungrouped: DatasetInfo[],
  joinKeys: JoinKeyInfo[]
): string {
  const needsArrow = groups.some((g) => isParquet(g.fileFormat || "", g.datasets[0]?.contentUrl || ""))
    || ungrouped.some((ds) => isParquet(ds.fileFormat || "", ds.contentUrl));

  let code = `library(dplyr)\n`;
  if (needsArrow) code += `library(arrow)\n`;
  code += `\n`;

  const loadedVars: { varName: string; schemaName: string }[] = [];

  for (const group of groups) {
    const parquet = isParquet(group.fileFormat || "", group.datasets[0]?.contentUrl || "");
    const readFn = parquet ? "read_parquet" : "read.csv";

    if (group.datasets.length === 1) {
      const ds = group.datasets[0];
      const vn = varName(ds.name) || "df";
      code += `# ${group.schemaName}\n`;
      code += `${vn} <- ${readFn}("${ds.contentUrl}")\n\n`;
      loadedVars.push({ varName: vn, schemaName: group.schemaName });
    } else {
      const listVn = varName(group.schemaName) + "_urls";
      const dfVn = varName(group.schemaName) + "_all";
      code += `# ${group.schemaName} (${group.datasets.length} files)\n`;
      code += `${listVn} <- c(\n`;
      const show = group.datasets.length <= 6 ? group.datasets : group.datasets.slice(0, 3);
      const remaining = group.datasets.length - show.length;
      for (const ds of show) {
        code += `  "${ds.contentUrl}",  # ${ds.name}\n`;
      }
      if (remaining > 0) {
        code += `  # ... and ${remaining} more URLs (full list in RO-Crate metadata)\n`;
      }
      code += `)\n\n`;
      code += `${dfVn} <- bind_rows(lapply(${listVn}, ${readFn}))\n`;
      code += `cat(sprintf("${group.schemaName}: %d rows from %d files\\n", nrow(${dfVn}), length(${listVn})))\n\n`;
      loadedVars.push({ varName: dfVn, schemaName: group.schemaName });
    }
  }

  for (const ds of ungrouped) {
    const vn = varName(ds.name) || "df";
    const parquet = isParquet(ds.fileFormat || "", ds.contentUrl);
    const readFn = parquet ? "read_parquet" : "read.csv";
    code += `# ${ds.name}\n`;
    code += `${vn} <- ${readFn}("${ds.contentUrl}")\n\n`;
    loadedVars.push({ varName: vn, schemaName: ds.name });
  }

  if (joinKeys.length > 0 && loadedVars.length >= 2) {
    const topJoinCols = joinKeys.slice(0, 5).map((jk) => jk.column);
    const byCols = topJoinCols.map((c) => `"${c}"`).join(", ");
    code += `# --- Join datasets ---\n`;
    code += `merged <- ${loadedVars[0].varName}\n`;

    for (let i = 1; i < loadedVars.length; i++) {
      code += `merged <- full_join(merged, ${loadedVars[i].varName}, by = c(${byCols}))\n`;
    }

    code += `\ndim(merged)\n`;
    code += `head(merged)\n`;
  }

  return code;
}

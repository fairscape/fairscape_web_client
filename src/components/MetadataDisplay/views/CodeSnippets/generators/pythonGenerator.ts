import type { DatasetInfo, DatasetGroup, JoinKeyInfo } from "../CodeSnippetsView";

function varName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase()
    .slice(0, 30);
}

function isParquet(fmt: string, url: string): boolean {
  return (fmt || "").toLowerCase().includes("parquet") || (url || "").toLowerCase().endsWith(".parquet");
}

function readerFn(fmt: string, url: string): string {
  return isParquet(fmt, url) ? "pd.read_parquet" : "pd.read_csv";
}

export function generatePythonSingle(ds: DatasetInfo): string {
  const vn = varName(ds.name) || "df";
  let code = `import pandas as pd\n\n`;
  code += `# Load: ${ds.name}\n`;
  code += `${vn} = ${readerFn(ds.fileFormat || "", ds.contentUrl)}("${ds.contentUrl}")\n\n`;
  code += `print(${vn}.shape)\n`;
  code += `print(${vn}.head())\n`;
  return code;
}

export function generatePythonMulti(
  groups: DatasetGroup[],
  ungrouped: DatasetInfo[],
  joinKeys: JoinKeyInfo[]
): string {
  let code = `import pandas as pd\n\n`;

  // Emit each group: if 1 dataset, load directly; if many, use a loop with a list of URLs
  const loadedVars: { varName: string; schemaName: string; isList: boolean }[] = [];

  for (const group of groups) {
    const reader = readerFn(group.fileFormat || "", group.datasets[0]?.contentUrl || "");

    if (group.datasets.length === 1) {
      // Single dataset in this schema group — load directly
      const ds = group.datasets[0];
      const vn = varName(ds.name) || "df";
      code += `# ${group.schemaName}\n`;
      code += `${vn} = ${reader}("${ds.contentUrl}")\n\n`;
      loadedVars.push({ varName: vn, schemaName: group.schemaName, isList: false });
    } else {
      // Multiple datasets sharing same schema — load as list via loop
      const listVn = varName(group.schemaName) + "_list";
      const dfVn = varName(group.schemaName) + "_all";
      code += `# ${group.schemaName} (${group.datasets.length} files)\n`;
      code += `${listVn}_urls = [\n`;
      // Show first 3 and last 1 to give the idea, then note the rest
      const show = group.datasets.length <= 6 ? group.datasets : [
        ...group.datasets.slice(0, 3),
      ];
      const remaining = group.datasets.length - show.length;
      for (const ds of show) {
        code += `    "${ds.contentUrl}",  # ${ds.name}\n`;
      }
      if (remaining > 0) {
        code += `    # ... and ${remaining} more URLs (full list in RO-Crate metadata)\n`;
      }
      code += `]\n\n`;
      code += `${listVn} = [${reader}(url) for url in ${listVn}_urls]\n`;
      code += `${dfVn} = pd.concat(${listVn}, ignore_index=True)\n`;
      code += `print(f"${group.schemaName}: {${dfVn}.shape[0]} rows from {len(${listVn})} files")\n\n`;
      loadedVars.push({ varName: dfVn, schemaName: group.schemaName, isList: true });
    }
  }

  // Ungrouped datasets (no schema)
  for (const ds of ungrouped) {
    const vn = varName(ds.name) || "df";
    const reader = readerFn(ds.fileFormat || "", ds.contentUrl);
    code += `# ${ds.name}\n`;
    code += `${vn} = ${reader}("${ds.contentUrl}")\n\n`;
    loadedVars.push({ varName: vn, schemaName: ds.name, isList: false });
  }

  // Join code
  if (joinKeys.length > 0 && loadedVars.length >= 2) {
    const topJoinCols = joinKeys.slice(0, 5).map((jk) => jk.column);
    code += `# --- Join datasets on shared columns: ${topJoinCols.join(", ")} ---\n`;
    code += `merged = ${loadedVars[0].varName}\n`;

    for (let i = 1; i < loadedVars.length; i++) {
      const onClause = topJoinCols.length === 1
        ? `"${topJoinCols[0]}"`
        : `[${topJoinCols.map((c) => `"${c}"`).join(", ")}]`;
      code += `merged = merged.merge(${loadedVars[i].varName}, on=${onClause}, how="outer", suffixes=("", "_${varName(loadedVars[i].schemaName)}"))\n`;
    }

    code += `\nprint(merged.shape)\n`;
    code += `print(merged.head())\n`;
  }

  return code;
}

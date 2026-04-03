import type { DatasetInfo, DatasetGroup } from "../CodeSnippetsView";

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 60);
}

function ext(ds: DatasetInfo): string {
  return (ds.fileFormat || "").toLowerCase().includes("parquet") ? ".parquet" : ".csv";
}

export function generateCLISingle(ds: DatasetInfo): string {
  return `# Download: ${ds.name}\ncurl -L -o "${safeFilename(ds.name)}${ext(ds)}" "${ds.contentUrl}"\n`;
}

export function generateCLIMulti(groups: DatasetGroup[], ungrouped: DatasetInfo[]): string {
  let code = `#!/bin/bash\n# Download all datasets\n\nmkdir -p data\ncd data\n\n`;

  for (const group of groups) {
    if (group.datasets.length === 1) {
      const ds = group.datasets[0];
      code += `# ${group.schemaName}\n`;
      code += `curl -L -o "${safeFilename(ds.name)}${ext(ds)}" "${ds.contentUrl}"\n\n`;
    } else {
      const fileExt = (group.fileFormat || "").toLowerCase().includes("parquet") ? ".parquet" : ".csv";
      code += `# ${group.schemaName} (${group.datasets.length} files)\n`;
      code += `mkdir -p "${safeFilename(group.schemaName)}"\n`;
      code += `urls=(\n`;
      const show = group.datasets.length <= 6 ? group.datasets : group.datasets.slice(0, 3);
      const remaining = group.datasets.length - show.length;
      for (const ds of show) {
        code += `  "${ds.contentUrl}"  # ${ds.name}\n`;
      }
      if (remaining > 0) {
        code += `  # ... and ${remaining} more URLs\n`;
      }
      code += `)\n`;
      code += `for i in "\${!urls[@]}"; do\n`;
      code += `  curl -L -o "${safeFilename(group.schemaName)}/file_\${i}${fileExt}" "\${urls[$i]}"\n`;
      code += `done\n`;
      code += `echo "Downloaded \${#urls[@]} ${group.schemaName} files"\n\n`;
    }
  }

  for (const ds of ungrouped) {
    code += `curl -L -o "${safeFilename(ds.name)}${ext(ds)}" "${ds.contentUrl}"\n`;
  }

  const total = groups.reduce((s, g) => s + g.datasets.length, 0) + ungrouped.length;
  code += `\necho "Done! ${total} files total."\n`;
  return code;
}

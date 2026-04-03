interface DatasetInfo {
  name: string;
  contentUrl: string;
  fileFormat?: string;
}

export function generateCLISingle(ds: DatasetInfo): string {
  const filename = ds.name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 60);
  const ext = (ds.fileFormat || "").toLowerCase().includes("parquet")
    ? ".parquet"
    : ".csv";

  return `# Download: ${ds.name}\ncurl -L -o "${filename}${ext}" "${ds.contentUrl}"\n`;
}

export function generateCLIMulti(datasets: DatasetInfo[]): string {
  let code = `#!/bin/bash\n# Download all datasets\n\nmkdir -p data\ncd data\n\n`;

  for (const ds of datasets) {
    const filename = ds.name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 60);
    const ext = (ds.fileFormat || "").toLowerCase().includes("parquet")
      ? ".parquet"
      : ".csv";
    code += `echo "Downloading ${ds.name}..."\n`;
    code += `curl -L -o "${filename}${ext}" "${ds.contentUrl}"\n\n`;
  }

  code += `echo "Done! Downloaded ${datasets.length} files."\n`;
  return code;
}

function normalizeType(t: string): string {
  if (!t) return "";
  return t
    .replace(/^EVI:/i, "")
    .replace(/^https?:\/\/w3id\.org\/EVI#?/i, "")
    .toLowerCase();
}

export function classify(main: any): string {
  if (!main || typeof main !== "object") return "entity";

  // find root node
  const graph: any[] | undefined = Array.isArray(main?.["@graph"])
    ? main["@graph"]
    : undefined;

  let root: any = main;
  if (graph) {
    const crateRoot = graph.find((n) => n?.["@id"] === "./");
    if (crateRoot) root = crateRoot;
  }

  const rawTypes: string[] = []
    .concat(root?.["@type"] || [])
    .concat(root?.type || []);
  const types = rawTypes.map((t) => normalizeType(String(t))).filter(Boolean);

  if (types.length === 0) return "entity";

  // ROCrate logic
  if (types.includes("rocrate") || types.includes("ro-crate")) {
    return "rocrate";
  }

  // fallback: first normalized type
  return (types[0] as EntityKind) || "entity";
}

export function classifyROCrate(main: any): string {
  if (!main || typeof main !== "object") return "entity";

  const graph: any[] | undefined = Array.isArray(main?.["@graph"])
    ? main["@graph"]
    : undefined;

  if (!graph) return "entity";

  let datasetROCrateCount = 0;

  for (const item of graph) {
    if (!item || typeof item !== "object") continue;

    const rawTypes: string[] = []
      .concat(item?.["@type"] || [])
      .concat(item?.type || []);
    const types = rawTypes.map((t) => String(t));

    const hasDataset = types.includes("Dataset");
    const hasROCrate = types.some(
      (t) =>
        t === "https://w3id.org/EVI#ROCrate" || normalizeType(t) === "rocrate"
    );

    if (hasDataset && hasROCrate) {
      datasetROCrateCount++;
    }
  }

  if (datasetROCrateCount > 1) {
    return "release";
  } else if (datasetROCrateCount === 1) {
    return "rocrate";
  }

  return "entity";
}

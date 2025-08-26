import type { EntityKind } from "../types";

// normalize a @type value
function normalizeType(t: string): string {
  if (!t) return "";
  return t
    .replace(/^EVI:/i, "")
    .replace(/^https?:\/\/w3id\.org\/EVI#?/i, "")
    .toLowerCase();
}

export function classify(main: any): EntityKind {
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
    const hasPart = [].concat(root?.hasPart || []);
    const nestedCrates = hasPart.filter((hp: any) => {
      const partTypes: string[] = []
        .concat(hp?.["@type"] || [])
        .concat(hp?.type || [])
        .map((t) => normalizeType(String(t)));
      return partTypes.includes("rocrate") || partTypes.includes("ro-crate");
    });
    if (nestedCrates.length > 1) {
      return "release";
    }
    return "rocrate";
  }

  // fallback: first normalized type
  return (types[0] as EntityKind) || "entity";
}

export function extractEvidenceGraphId(from: any): string | undefined {
  if (!from || typeof from !== "object") return undefined;

  // if direct hasEvidenceGraph is present
  const val = from["hasEvidenceGraph"];
  if (val && typeof val === "object" && typeof val["@id"] === "string") {
    return val["@id"];
  }

  // if root object has it (common in RO-Crate style)
  const root =
    (Array.isArray(from?.["@graph"]) &&
      from["@graph"].find((n: any) => n?.["@id"] === "./")) ||
    from?.root ||
    undefined;

  if (root) {
    const rVal = root["hasEvidenceGraph"];
    if (rVal && typeof rVal === "object" && typeof rVal["@id"] === "string") {
      return rVal["@id"];
    }
  }

  return undefined;
}

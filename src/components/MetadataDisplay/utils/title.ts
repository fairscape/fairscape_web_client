export function deriveTitleAndVersion(main?: any) {
  let title = "Details";
  let version = "1.0";

  if (!main) return { title, version };

  if (Array.isArray(main["@graph"])) {
    const root =
      main["@graph"].find((x: any) => x?.["@id"] === "./") || main["@graph"][1];
    if (root) {
      if (root.name) title = root.name;
      if (root.version) version = root.version;
    }
  } else {
    if (main.name) title = main.name;
    if (main.version) version = main.version;
  }

  if (title === "Details" && typeof main?.["@type"] === "string") {
    const t = main["@type"].split(/[/#]/).pop();
    if (t) title = `${t[0].toUpperCase()}${t.slice(1)} Details`;
  }
  return { title, version };
}

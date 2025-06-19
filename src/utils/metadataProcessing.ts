import { Metadata, RawGraphEntity } from "../types"; // Adjust path as needed

export const findRootEntity = (
  graph: RawGraphEntity[]
): RawGraphEntity | undefined => {
  const metadataDescriptor = graph.find(
    (e) =>
      e["@id"] === "ro-crate-metadata.json" ||
      e["@id"] === null ||
      e["@id"] === "./ro-crate-metadata.json"
  );

  let rootId = metadataDescriptor?.about?.["@id"];

  if (
    !rootId &&
    metadataDescriptor?.about &&
    Array.isArray(metadataDescriptor.about) &&
    metadataDescriptor.about.length > 0
  ) {
    rootId = metadataDescriptor.about[0]["@id"];
  }

  if (rootId === "./" && metadataDescriptor) {
    const mainEntity = graph.find(
      (e) =>
        Array.isArray(e["@type"]) &&
        e["@type"].includes("https://w3id.org/EVI#ROCrate")
    );
    if (mainEntity) return mainEntity;
  }

  if (rootId) {
    const foundRoot = graph.find((e) => e["@id"] === rootId);
    if (foundRoot) return foundRoot;
  }

  return (
    graph.find(
      (e) =>
        (Array.isArray(e["@type"]) &&
          e["@type"].includes("https://w3id.org/EVI#ROCrate")) ||
        e["@id"] === "./"
    ) || graph.find((e) => e["@id"] === "./")
  );
};

const resolveLink = (value: any, graph: RawGraphEntity[]): string => {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && value["@id"]) {
    const linkedEntity = graph.find((e) => e["@id"] === value["@id"]);
    return linkedEntity?.name || linkedEntity?.label || value["@id"];
  }
  return String(value);
};

export interface OverviewData {
  title: string;
  version?: string;
  id_value: string;
  doi?: string;
  release_date?: string;
  content_size?: string;
  description?: string;
  authors?: string;
  publisher?: string;
  principal_investigator?: string;
  contact_email?: string;
  license_value?: string;
  confidentiality_level?: string;
  keywords?: string | string[];
  citation?: string;
  human_subject?: string | boolean;
  funding?: string;
  completeness?: string;
  related_publications?: string[];
  externalUrl?: string;
  contentUrl?: string;
  copyright?: string;
  additionalCustomProperties?: Array<{
    name: string;
    value: string | string[];
  }>;
}

export const processOverview = (metadata: Metadata): OverviewData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);

  if (!root) return {} as OverviewData;

  let authors = "";
  if (root.author) {
    if (Array.isArray(root.author)) {
      authors = root.author
        .map((a) =>
          typeof a === "object" && a !== null && a.name ? a.name : String(a)
        )
        .join("; ");
    } else if (
      typeof root.author === "object" &&
      root.author !== null &&
      (root.author as any).name
    ) {
      authors = (root.author as any).name;
    } else {
      authors = String(root.author);
    }
  } else if (root.creator) {
    if (Array.isArray(root.creator)) {
      authors = root.creator.map((c) => resolveLink(c, graph)).join(", ");
    } else {
      authors = resolveLink(root.creator, graph);
    }
  }

  const publisherValue = root.publisher || root.sdPublisher;
  const publisher = resolveLink(publisherValue, graph);

  let doi;
  const identifiers = Array.isArray(root.identifier)
    ? root.identifier
    : root.identifier
    ? [root.identifier]
    : [];
  const doiObject = identifiers.find(
    (id) =>
      typeof id === "object" && id !== null && (id as any).propertyID === "doi"
  );

  if (doiObject) {
    doi = (doiObject as any).value || (doiObject as any)["@id"];
  } else {
    const doiString = identifiers.find(
      (id) =>
        typeof id === "string" &&
        (id.startsWith("https://doi.org/") || id.startsWith("doi:"))
    );
    if (doiString) doi = doiString;
  }
  if (
    doi &&
    typeof doi === "string" &&
    !doi.startsWith("https://doi.org/") &&
    !doi.startsWith("doi:")
  ) {
    doi = `https://doi.org/${doi.replace(/^doi:\s*/, "")}`;
  }

  let license_value = "";
  if (typeof root.license === "string") {
    license_value = root.license;
  } else if (
    typeof root.license === "object" &&
    root.license !== null &&
    root.license["@id"]
  ) {
    license_value = root.license["@id"];
  }

  let related_publications: string[] = [];
  if (root.associatedPublication) {
    const pubs = Array.isArray(root.associatedPublication)
      ? root.associatedPublication
      : [root.associatedPublication];
    related_publications = pubs
      .map((pub) => {
        if (typeof pub === "string") return pub;
        if (typeof pub === "object" && pub !== null) {
          return pub["@id"] || pub.citation || pub.name || JSON.stringify(pub);
        }
        return String(pub);
      })
      .filter(Boolean);
  }

  let completeness: string | undefined;
  let human_subject_value: string | boolean | undefined;
  const additionalCustomProperties: Array<{
    name: string;
    value: string | string[];
  }> = [];

  if (root.additionalProperty && Array.isArray(root.additionalProperty)) {
    root.additionalProperty.forEach((p) => {
      if (p.name && p.value !== undefined && p.value !== null) {
        if (p.name === "Completeness") {
          completeness = String(p.value);
        } else if (
          p.name === "Human Subject" ||
          p.name === "Human Subject Data"
        ) {
          if (typeof p.value === "string") {
            if (p.value.toLowerCase() === "true") human_subject_value = true;
            else if (p.value.toLowerCase() === "false")
              human_subject_value = false;
            else human_subject_value = p.value;
          } else if (typeof p.value === "boolean") {
            human_subject_value = p.value;
          } else {
            human_subject_value = String(p.value);
          }
        } else {
          additionalCustomProperties.push({ name: p.name, value: p.value });
        }
      }
    });
  }

  let keywordsValue = root.keywords;
  if (typeof keywordsValue === "string") {
    keywordsValue = keywordsValue
      .split(/[,;]\s*/)
      .map((k) => k.trim())
      .filter((k) => k);
  } else if (Array.isArray(keywordsValue)) {
    keywordsValue = keywordsValue.map((k) => String(k).trim()).filter((k) => k);
  }

  const overviewData: OverviewData = {
    title: root.name || root.headline || "Untitled",
    version: root.version || undefined,
    id_value: root["@id"] || "N/A",
    doi: doi,
    externalUrl: root.url || undefined,
    contentUrl: root.contentUrl || undefined,
    release_date:
      root.datePublished || root.dateCreated || root.dateModified || undefined,
    content_size: root.contentSize || undefined,
    description: root.description || root.abstract || undefined,
    authors: authors || undefined,
    publisher: publisher || undefined,
    principal_investigator:
      root.principalInvestigator || (root.PI as any)?.name || undefined,
    contact_email: root.contactPoint?.email || root.contactEmail || undefined,
    license_value: license_value || undefined,
    confidentiality_level: (root as any).confidentialityLevel || undefined,
    keywords: keywordsValue,
    citation: root.citation || undefined,
    human_subject: human_subject_value,
    funding: root.funder
      ? Array.isArray(root.funder)
        ? root.funder.map((f) => (f as any).name || String(f)).join("; ")
        : (root.funder as any).name || String(root.funder)
      : undefined,
    completeness: completeness || undefined,
    related_publications:
      related_publications.length > 0 ? related_publications : undefined,
    copyright:
      root.copyrightNotice ||
      root.copyrightHolder?.name ||
      (root.copyrightHolder && typeof root.copyrightHolder === "string"
        ? root.copyrightHolder
        : undefined) ||
      undefined,
    additionalCustomProperties:
      additionalCustomProperties.length > 0
        ? additionalCustomProperties
        : undefined,
  };

  return overviewData;
};

export interface UseCasesData {
  intended_uses?: string;
  limitations?: string;
  prohibited_uses?: string;
  maintenance_plan?: string;
}

export const processUseCases = (metadata: Metadata): UseCasesData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);
  if (!root) return {};

  let intended_uses, limitations, prohibited_uses, maintenance_plan;
  if (root.additionalProperty && Array.isArray(root.additionalProperty)) {
    const intendedUseProperty = root.additionalProperty.find(
      (p) => p.name === "Intended Use" || p.name === "Intended Uses"
    );
    if (intendedUseProperty) {
      intended_uses = Array.isArray(intendedUseProperty.value)
        ? intendedUseProperty.value.join("\n")
        : String(intendedUseProperty.value);
    }

    const limitationsProperty = root.additionalProperty.find(
      (p) => p.name === "Limitations"
    );
    if (limitationsProperty) {
      limitations = Array.isArray(limitationsProperty.value)
        ? limitationsProperty.value.join("\n")
        : String(limitationsProperty.value);
    }

    const prohibitedUsesProperty = root.additionalProperty.find(
      (p) => p.name === "Prohibited Uses"
    );
    if (prohibitedUsesProperty) {
      prohibited_uses = Array.isArray(prohibitedUsesProperty.value)
        ? prohibitedUsesProperty.value.join("\n")
        : String(prohibitedUsesProperty.value);
    }

    const maintenancePlanProperty = root.additionalProperty.find(
      (p) => p.name === "Maintenance Plan"
    );
    if (maintenancePlanProperty) {
      maintenance_plan = Array.isArray(maintenancePlanProperty.value)
        ? maintenancePlanProperty.value.join("\n")
        : String(maintenancePlanProperty.value);
    }
  }

  return {
    intended_uses: intended_uses || root.usageInfo || undefined,
    limitations: limitations || undefined,
    prohibited_uses: prohibited_uses || undefined,
    maintenance_plan: maintenance_plan || undefined,
  };
};

export interface DistributionData {
  publisher?: string;
  host?: string;
  license_value?: string;
  doi?: string;
  release_date?: string;
  version?: string;
}

export const processDistribution = (metadata: Metadata): DistributionData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);
  if (!root) return {};

  const publisherValue = root.publisher || root.sdPublisher;
  const publisher = resolveLink(publisherValue, graph);

  let doi;
  const identifiers = Array.isArray(root.identifier)
    ? root.identifier
    : root.identifier
    ? [root.identifier]
    : [];
  const doiObject = identifiers.find(
    (id) =>
      typeof id === "object" && id !== null && (id as any).propertyID === "doi"
  );
  if (doiObject) {
    doi = (doiObject as any).value || (doiObject as any)["@id"];
  } else {
    const doiString = identifiers.find(
      (id) =>
        typeof id === "string" &&
        (id.startsWith("https://doi.org/") || id.startsWith("doi:"))
    );
    if (doiString) doi = doiString;
  }
  if (
    doi &&
    typeof doi === "string" &&
    !doi.startsWith("https://doi.org/") &&
    !doi.startsWith("doi:")
  ) {
    doi = `https://doi.org/${doi.replace(/^doi:\s*/, "")}`;
  }

  let license_value = "";
  if (typeof root.license === "string") {
    license_value = root.license;
  } else if (
    typeof root.license === "object" &&
    root.license !== null &&
    root.license["@id"]
  ) {
    license_value = root.license["@id"];
  }

  return {
    publisher: publisher || undefined,
    host:
      (root as any).distributionHost ||
      (root.distribution as any)?.contentUrl ||
      undefined,
    license_value: license_value || undefined,
    doi: doi,
    release_date:
      root.datePublished || root.dateCreated || root.dateModified || undefined,
    version: root.version || undefined,
  };
};

export interface SubcrateSummary {
  id: string;
  name: string;
  description?: string;
  authors?: string;
  date?: string;
  size?: string;
  doi?: string;
  contact?: string;
  license?: string;
  keywords?: string[];
  funder?: string;
  related_publications?: string[];
  error?: string;
  metadataPath?: string;
  previewUrl?: string | null;
}

export interface CompositionData {
  subcrates: SubcrateSummary[];
}

export const processCompositionRefs = (metadata: Metadata): CompositionData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);
  if (!root || !root.hasPart) return { subcrates: [] };

  const parts = Array.isArray(root.hasPart) ? root.hasPart : [root.hasPart];

  const subcrateRefs = parts
    .map((partRef) => {
      if (typeof partRef === "object" && partRef !== null && partRef["@id"]) {
        const partId = partRef["@id"];
        const partEntity = graph.find((e) => e["@id"] === partId);

        if (
          partEntity &&
          (Array.isArray(partEntity["@type"])
            ? partEntity["@type"].includes("https://w3id.org/EVI#ROCrate") ||
              partEntity["@type"].includes("Dataset")
            : partEntity["@type"] === "https://w3id.org/EVI#ROCrate" ||
              partEntity["@type"] === "Dataset")
        ) {
          let metadataPath =
            (partEntity as any)["ro-crate-metadata"] ||
            (partId.endsWith("/")
              ? `${partId}ro-crate-metadata.json`
              : `${partId}/ro-crate-metadata.json`);
          if (partId === "./") {
            metadataPath = "ro-crate-metadata.json";
          }

          let authors = "";
          if (partEntity.author) {
            if (Array.isArray(partEntity.author)) {
              authors = partEntity.author
                .map((a) =>
                  typeof a === "object" && a !== null && a.name
                    ? a.name
                    : String(a)
                )
                .join("; ");
            } else if (
              typeof partEntity.author === "object" &&
              partEntity.author !== null &&
              (partEntity.author as any).name
            ) {
              authors = (partEntity.author as any).name;
            } else {
              authors = String(partEntity.author);
            }
          }

          let keywords: string[] = [];
          if (partEntity.keywords) {
            if (Array.isArray(partEntity.keywords)) {
              keywords = partEntity.keywords.map((k) => String(k));
            } else if (typeof partEntity.keywords === "string") {
              keywords = partEntity.keywords
                .split(/[,;]\s*/)
                .map((k) => k.trim())
                .filter((k) => k);
            }
          }

          let related_publications: string[] = [];
          if (partEntity.associatedPublication) {
            const pubs = Array.isArray(partEntity.associatedPublication)
              ? partEntity.associatedPublication
              : [partEntity.associatedPublication];
            related_publications = pubs
              .map((pub) => {
                if (typeof pub === "string") return pub;
                if (typeof pub === "object" && pub !== null) {
                  return (
                    pub["@id"] ||
                    pub.citation ||
                    pub.name ||
                    JSON.stringify(pub)
                  );
                }
                return String(pub);
              })
              .filter(Boolean);
          }

          let previewUrl = null;
          if (metadataPath && typeof metadataPath === "string") {
            const basePath = metadataPath.substring(
              0,
              metadataPath.lastIndexOf("/")
            );
            previewUrl = `/data/${basePath}/ro-crate-preview.html`;
            if (basePath === "" && partId !== "./") {
              previewUrl = `/data/${partId
                .replace(/^\.\//, "")
                .replace(/\/$/, "")}/ro-crate-preview.html`;
            } else if (partId === "./") {
              previewUrl = `/data/ro-crate-preview.html`;
            }
          }

          let subcrateDOI;
          const subIdentifiers = Array.isArray(partEntity.identifier)
            ? partEntity.identifier
            : partEntity.identifier
            ? [partEntity.identifier]
            : [];
          const subDoiObject = subIdentifiers.find(
            (id) =>
              typeof id === "object" &&
              id !== null &&
              (id as any).propertyID === "doi"
          );
          if (subDoiObject) {
            subcrateDOI =
              (subDoiObject as any).value || (subDoiObject as any)["@id"];
          } else {
            const subDoiString = subIdentifiers.find(
              (id) =>
                typeof id === "string" &&
                (id.startsWith("https://doi.org/") || id.startsWith("doi:"))
            );
            if (subDoiString) subcrateDOI = subDoiString;
          }
          if (
            subcrateDOI &&
            typeof subcrateDOI === "string" &&
            !subcrateDOI.startsWith("https://doi.org/") &&
            !subcrateDOI.startsWith("doi:")
          ) {
            subcrateDOI = `https://doi.org/${subcrateDOI.replace(
              /^doi:\s*/,
              ""
            )}`;
          }

          return {
            id: partEntity["@id"],
            name:
              partEntity.name ||
              (typeof partEntity["@id"] === "string"
                ? partEntity["@id"]
                    .replace(/^\.\//, "")
                    .split("/")
                    .filter(Boolean)
                    .pop()
                : undefined) ||
              partEntity["@id"],
            description: partEntity.description || undefined,
            authors: authors || undefined,
            date:
              partEntity.datePublished ||
              partEntity.dateCreated ||
              partEntity.dateModified ||
              undefined,
            size: partEntity.contentSize || undefined,
            doi: subcrateDOI || undefined,
            contact:
              partEntity.contactPoint?.email ||
              (partEntity as any).contactEmail ||
              undefined,
            license:
              (partEntity.license as any)?.["@id"] ||
              partEntity.license ||
              undefined,
            keywords: keywords.length > 0 ? keywords : undefined,
            funder: partEntity.funder
              ? Array.isArray(partEntity.funder)
                ? partEntity.funder
                    .map((f) => (f as any).name || String(f))
                    .join("; ")
                : (partEntity.funder as any).name || String(partEntity.funder)
              : undefined,
            related_publications:
              related_publications.length > 0
                ? related_publications
                : undefined,
            metadataPath: metadataPath,
            previewUrl: previewUrl,
          } as SubcrateSummary;
        }
      }
      return null;
    })
    .filter((ref): ref is SubcrateSummary => ref !== null);

  return { subcrates: subcrateRefs };
};

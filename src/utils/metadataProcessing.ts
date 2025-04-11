// src/utils/metadataProcessing.ts
import { Metadata, RawGraphEntity } from "../types"; // Adjust path

// Helper to find the root entity in the graph
export const findRootEntity = (
  graph: RawGraphEntity[]
): RawGraphEntity | undefined => {
  // Find the metadata descriptor - could have @id null OR ro-crate-metadata.json
  const metadataDescriptor = graph.find(
    (e) => e["@id"] === "ro-crate-metadata.json" || e["@id"] === null
  );

  // Get the root ID from the about property
  const rootId = metadataDescriptor?.about?.["@id"];

  if (rootId) {
    // Find and return the root entity
    return graph.find((e) => e["@id"] === rootId);
  }

  // Fallback: look for entity with type ROCrate
  return graph.find(
    (e) =>
      Array.isArray(e["@type"]) &&
      e["@type"].includes("https://w3id.org/EVI#ROCrate")
  );
};

// Helper to get a potentially linked property's value or name
const resolveLink = (value: any, graph: RawGraphEntity[]): string => {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && value["@id"]) {
    const linkedEntity = graph.find((e) => e["@id"] === value["@id"]);
    return linkedEntity?.name || linkedEntity?.label || value["@id"];
  }
  return String(value); // Fallback
};

// --- Section Processing Functions ---

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
  human_subject?: string;
  funding?: string;
  completeness?: string;
  related_publications?: string[];
}

export const processOverview = (metadata: Metadata): OverviewData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);

  console.log("Processing overview, found root:", root);

  if (!root) return {} as OverviewData; // Return empty if no root

  // Resolve linked authors/publisher
  let authors = "";
  if (root.author) {
    if (Array.isArray(root.author)) {
      authors = root.author.join("; ");
    } else {
      authors = root.author;
    }
  } else if (root.creator) {
    if (Array.isArray(root.creator)) {
      authors = root.creator.map((c) => resolveLink(c, graph)).join(", ");
    } else {
      authors = resolveLink(root.creator, graph);
    }
  }

  const publisher = resolveLink(root.publisher, graph);

  // Extract DOI from identifier if available
  let doi;
  if (
    root.identifier &&
    typeof root.identifier === "string" &&
    (root.identifier.startsWith("https://doi.org/") ||
      root.identifier.startsWith("doi:"))
  ) {
    doi = root.identifier;
  }

  // Resolve license
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

  // Extract related publications
  let related_publications: string[] = [];
  if (root.associatedPublication) {
    if (Array.isArray(root.associatedPublication)) {
      related_publications = root.associatedPublication;
    } else {
      related_publications = [root.associatedPublication];
    }
  }

  // Extract additional properties
  let completeness, human_subject;
  if (root.additionalProperty && Array.isArray(root.additionalProperty)) {
    const completenessProperty = root.additionalProperty.find(
      (p) => p.name === "Completeness"
    );
    if (completenessProperty) {
      completeness = completenessProperty.value;
    }

    const humanSubjectProperty = root.additionalProperty.find(
      (p) => p.name === "Human Subject"
    );
    if (humanSubjectProperty) {
      human_subject = humanSubjectProperty.value;
    }
  }

  // Return the processed overview data
  const overviewData = {
    title: root.name || "Untitled",
    version: root.version || undefined,
    id_value: root["@id"] || "N/A",
    doi: doi,
    release_date: root.datePublished || undefined,
    content_size: root.contentSize || undefined,
    description: root.description || undefined,
    authors: authors || undefined,
    publisher: publisher || undefined,
    principal_investigator: root.principalInvestigator || undefined,
    contact_email: root.contactEmail || undefined,
    license_value: license_value || undefined,
    confidentiality_level: root.confidentialityLevel || undefined,
    keywords: root.keywords,
    citation: root.citation || undefined,
    human_subject: human_subject || undefined,
    funding: root.funder || undefined,
    completeness: completeness || undefined,
    related_publications: related_publications,
  };

  console.log("Processed overview data:", overviewData);
  return overviewData;
};

// Rest of the file remains the same...

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

  // Extract from additionalProperty if available
  let intended_uses, limitations, prohibited_uses, maintenance_plan;
  if (root.additionalProperty && Array.isArray(root.additionalProperty)) {
    const intendedUseProperty = root.additionalProperty.find(
      (p) => p.name === "Intended Use"
    );
    if (intendedUseProperty) {
      intended_uses = intendedUseProperty.value;
    }

    const limitationsProperty = root.additionalProperty.find(
      (p) => p.name === "Limitations"
    );
    if (limitationsProperty) {
      limitations = limitationsProperty.value;
    }

    const prohibitedUsesProperty = root.additionalProperty.find(
      (p) => p.name === "Prohibited Uses"
    );
    if (prohibitedUsesProperty) {
      prohibited_uses = prohibitedUsesProperty.value;
    }

    const maintenancePlanProperty = root.additionalProperty.find(
      (p) => p.name === "Maintenance Plan"
    );
    if (maintenancePlanProperty) {
      maintenance_plan = maintenancePlanProperty.value;
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

  const publisher = resolveLink(root.publisher, graph);

  // Extract DOI from identifier if available
  let doi;
  if (
    root.identifier &&
    typeof root.identifier === "string" &&
    (root.identifier.startsWith("https://doi.org/") ||
      root.identifier.startsWith("doi:"))
  ) {
    doi = root.identifier;
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
    host: root.distributionHost || undefined,
    license_value: license_value || undefined,
    doi: doi,
    release_date: root.datePublished || undefined,
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
  previewUrl?: string;
}

export interface CompositionData {
  subcrates: SubcrateSummary[];
}

// This function extracts subcrate information directly from the main @graph
export const processCompositionRefs = (metadata: Metadata): CompositionData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);
  if (!root || !root.hasPart) return { subcrates: [] };

  const parts = Array.isArray(root.hasPart) ? root.hasPart : [root.hasPart];

  const subcrateRefs = parts
    .map((partRef) => {
      if (typeof partRef === "object" && partRef !== null && partRef["@id"]) {
        // Find the corresponding entity in the main graph
        const partId = partRef["@id"];
        const partEntity = graph.find((e) => e["@id"] === partId);

        if (partEntity) {
          // Get the metadata path if available (for future use)
          let metadataPath = partEntity["ro-crate-metadata"] || null;

          // Process author information
          let authors = "";
          if (partEntity.author) {
            if (Array.isArray(partEntity.author)) {
              authors = partEntity.author.join("; ");
            } else {
              authors = String(partEntity.author);
            }
          }

          // Process keywords
          let keywords: string[] = [];
          if (partEntity.keywords) {
            if (Array.isArray(partEntity.keywords)) {
              keywords = partEntity.keywords;
            } else if (typeof partEntity.keywords === "string") {
              keywords = [partEntity.keywords];
            }
          }

          // Process related publications
          let related_publications: string[] = [];
          if (partEntity.associatedPublication) {
            if (Array.isArray(partEntity.associatedPublication)) {
              related_publications = partEntity.associatedPublication;
            } else if (typeof partEntity.associatedPublication === "string") {
              related_publications = [partEntity.associatedPublication];
            }
          }

          // Create a preview URL if we have a metadata path
          let previewUrl = null;
          if (metadataPath) {
            const basePath = metadataPath.substring(
              0,
              metadataPath.lastIndexOf("/")
            );
            previewUrl = `/data/${basePath}/ro-crate-preview.html`;
          }

          return {
            id: partEntity["@id"],
            name:
              partEntity.name ||
              partEntity["@id"].split("/").pop() ||
              partEntity["@id"],
            description: partEntity.description || undefined,
            authors: authors || undefined,
            date: partEntity.datePublished || undefined,
            size: partEntity.contentSize || undefined,
            doi: partEntity.identifier || undefined,
            contact: partEntity.contactEmail || undefined,
            license: partEntity.license || undefined,
            keywords: keywords,
            funder: partEntity.funder || undefined,
            related_publications: related_publications,
            metadataPath: metadataPath,
            previewUrl: previewUrl,
          };
        }
      }
      return null;
    })
    .filter((ref): ref is SubcrateSummary => ref !== null);

  return { subcrates: subcrateRefs };
};

// --- Function to process details of a SINGLE sub-crate ---
export const processSingleSubcrateDetails = (
  subcrateMetadata: Metadata,
  basePath: string
): Omit<SubcrateSummary, "id" | "metadataPath" | "previewUrl"> => {
  const graph = (subcrateMetadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);
  if (!root)
    return {
      name: "Error: No root found",
      error: "Invalid sub-crate metadata",
    };

  // Parse author information
  let authors = "";
  if (root.author) {
    if (Array.isArray(root.author)) {
      authors = root.author.join("; ");
    } else {
      authors = root.author.toString();
    }
  } else if (root.creator) {
    if (Array.isArray(root.creator)) {
      authors = root.creator.map((c) => resolveLink(c, graph)).join(", ");
    } else {
      authors = resolveLink(root.creator, graph);
    }
  }

  // Handle keywords
  let keywords: string[] = [];
  if (root.keywords) {
    if (Array.isArray(root.keywords)) {
      keywords = root.keywords;
    } else if (typeof root.keywords === "string") {
      keywords = [root.keywords];
    }
  }

  // Handle related publications
  let related_publications: string[] = [];
  if (root.associatedPublication) {
    if (Array.isArray(root.associatedPublication)) {
      related_publications = root.associatedPublication;
    } else if (typeof root.associatedPublication === "string") {
      related_publications = [root.associatedPublication];
    }
  }

  return {
    name: root.name || "Untitled Sub-Crate",
    description: root.description,
    authors: authors,
    date: root.datePublished,
    size: root.contentSize,
    doi: root.identifier,
    contact: root.contactEmail,
    license: root.license,
    keywords: keywords,
    funder: root.funder,
    related_publications: related_publications,
  };
};

// --- Fallback processing for non-datasheet types ---
export interface FallbackMetadataItem {
  key: string;
  label: string;
  value: any;
}

export const processFallbackMetadata = (
  metadata: Metadata
): FallbackMetadataItem[] => {
  // Simple key-value extraction for the table view
  return Object.entries(metadata)
    .filter(([key]) => key !== "@context") // Exclude context
    .map(([key, value]) => ({
      key: key,
      label: key, // Use raw key for fallback
      value: value,
    }));
};

// Function to determine the type from metadata
export const determineReleaseType = (metadata: Metadata): string => {
  // Check if metadata has a graph
  const hasGraph =
    metadata["@graph"] &&
    Array.isArray(metadata["@graph"]) &&
    metadata["@graph"].length > 0;

  // Get the root entity - either from graph or treat metadata as root
  let root: RawGraphEntity;

  if (hasGraph) {
    const graph = metadata["@graph"] as RawGraphEntity[];
    const foundRoot = findRootEntity(graph);
    if (!foundRoot) {
      return "unknown";
    }
    root = foundRoot;
  } else {
    // Treat the metadata itself as the root
    root = metadata as unknown as RawGraphEntity;
  }

  // Get the types as an array
  const jsonLdTypes = Array.isArray(root["@type"])
    ? root["@type"]
    : [root["@type"]].filter(Boolean);

  // Check if it's a ROCrate
  const isROCrate =
    jsonLdTypes.includes("https://w3id.org/EVI#ROCrate") ||
    jsonLdTypes.some((type) => type && type.toLowerCase().includes("rocrate"));

  // Check if it has parts that are ROCrates
  let hasROCrateParts = false;

  if (hasGraph) {
    const graph = metadata["@graph"] as RawGraphEntity[];

    hasROCrateParts =
      root.hasPart &&
      (Array.isArray(root.hasPart)
        ? root.hasPart.some((part) => {
            if (typeof part === "object" && part["@id"]) {
              const partEntity = graph.find((e) => e["@id"] === part["@id"]);
              if (partEntity && partEntity["@type"]) {
                const partTypes = Array.isArray(partEntity["@type"])
                  ? partEntity["@type"]
                  : [partEntity["@type"]];
                return partTypes.some(
                  (type) =>
                    type === "https://w3id.org/EVI#ROCrate" ||
                    (type && type.toLowerCase().includes("rocrate"))
                );
              }
            }
            return false;
          })
        : typeof root.hasPart === "object" &&
          root.hasPart["@id"] &&
          (() => {
            const partEntity = graph.find(
              (e) => e["@id"] === root.hasPart["@id"]
            );
            if (partEntity && partEntity["@type"]) {
              const partTypes = Array.isArray(partEntity["@type"])
                ? partEntity["@type"]
                : [partEntity["@type"]];
              return partTypes.some(
                (type) =>
                  type === "https://w3id.org/EVI#ROCrate" ||
                  (type && type.toLowerCase().includes("rocrate"))
              );
            }
            return false;
          })());
  }

  // Classify as release if it's an ROCrate with ROCrate parts
  if (isROCrate && hasROCrateParts) {
    return "release";
  }
  // Just an ROCrate
  else if (isROCrate) {
    return "rocrate";
  }
  // Dataset but not ROCrate
  else if (
    jsonLdTypes.includes("https://w3id.org/EVI#Dataset") ||
    jsonLdTypes.includes("Dataset") ||
    jsonLdTypes.includes("EVI:Dataset")
  ) {
    return "dataset";
  }
  // Other types
  else if (
    jsonLdTypes.includes("https://w3id.org/EVI#Software") ||
    jsonLdTypes.includes("Software") ||
    jsonLdTypes.includes("SoftwareApplication") ||
    jsonLdTypes.includes("SoftwareSourceCode")
  ) {
    return "software";
  } else if (
    jsonLdTypes.includes("https://w3id.org/EVI#Computation") ||
    jsonLdTypes.includes("Computation") ||
    jsonLdTypes.includes("ComputationalWorkflow") ||
    jsonLdTypes.includes("HowTo")
  ) {
    return "computation";
  } else if (
    jsonLdTypes.includes("Schema") ||
    jsonLdTypes.includes("EVI:Schema")
  ) {
    return "schema";
  } else if (jsonLdTypes.includes("EvidenceGraph")) {
    return "evidencegraph";
  } else {
    return (
      jsonLdTypes[0]
        ?.split(/[#**\/**]/)
        .pop()
        ?.toLowerCase() || "unknown"
    );
  }
};

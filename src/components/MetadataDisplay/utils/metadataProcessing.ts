import { Metadata, RawGraphEntity } from "../types";

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

const resolveField = (
  root: RawGraphEntity,
  topLevelKey: string,
  additionalPropertyNames?: string[]
): any => {
  if (root[topLevelKey] !== undefined && root[topLevelKey] !== null) {
    return root[topLevelKey];
  }
  if (
    additionalPropertyNames &&
    root.additionalProperty &&
    Array.isArray(root.additionalProperty)
  ) {
    for (const name of additionalPropertyNames) {
      const prop = root.additionalProperty.find((p: any) => p.name === name);
      if (prop && prop.value !== undefined && prop.value !== null) {
        return prop.value;
      }
    }
  }
  return undefined;
};

const resolveLink = (value: any, graph: RawGraphEntity[]): string => {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && value["@id"]) {
    const linkedEntity = graph.find((e) => e["@id"] === value["@id"]);
    return linkedEntity?.name || linkedEntity?.label || value["@id"];
  }
  return String(value);
};

export interface AuthorEntry {
  name: string;
  id?: string;
}

export interface DefinedTermEntry {
  name: string;
  id: string;
  termCode?: string;
}

export interface OverviewData {
  title: string;
  version?: string;
  id_value: string;
  doi?: string;
  release_date?: string;
  content_size?: string;
  description?: string;
  authors?: AuthorEntry[];
  about?: DefinedTermEntry[];
  publisher?: string;
  principal_investigator?: string;
  contact_email?: string;
  license_value?: string;
  keywords?: string | string[];
  citation?: string;
  funding?: string;
  related_publications?: string[];
  externalUrl?: string;
  contentUrl?: string;
  copyright?: string;
  kaggleUrl?: string;
  notebookUrl?: string;
  additionalCustomProperties?: Array<{
    name: string;
    value: string | string[];
  }>;
}

export const processOverview = (metadata: Metadata): OverviewData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);

  if (!root) return {} as OverviewData;

  const authorList: AuthorEntry[] = [];
  if (root.author) {
    const rawAuthors = Array.isArray(root.author) ? root.author : [root.author];
    for (const a of rawAuthors) {
      if (typeof a === "object" && a !== null) {
        if (a.name) {
          authorList.push({ name: a.name, id: a["@id"] || undefined });
        } else if (a["@id"]) {
          const personEntity = graph.find((e) => e["@id"] === a["@id"]);
          if (personEntity?.name) {
            authorList.push({ name: personEntity.name, id: a["@id"] });
          } else {
            authorList.push({ name: a["@id"], id: a["@id"] });
          }
        }
      } else {
        authorList.push({ name: String(a) });
      }
    }
  } else if (root.creator) {
    const rawCreators = Array.isArray(root.creator)
      ? root.creator
      : [root.creator];
    for (const c of rawCreators) {
      authorList.push({
        name: resolveLink(c, graph),
        id: typeof c === "object" && c !== null ? c["@id"] : undefined,
      });
    }
  }

  const aboutList: DefinedTermEntry[] = [];
  if (root.about) {
    const rawAbout = Array.isArray(root.about) ? root.about : [root.about];
    for (const a of rawAbout) {
      if (typeof a === "object" && a !== null && a["@id"]) {
        const termEntity = graph.find((e) => e["@id"] === a["@id"]);
        if (termEntity?.name) {
          aboutList.push({
            name: termEntity.name,
            id: a["@id"],
            termCode: termEntity.termCode,
          });
        } else {
          aboutList.push({ name: a["@id"], id: a["@id"] });
        }
      }
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

  const KNOWN_SECTION_FIELD_NAMES = new Set([
    "Completeness",
    "Human Subject",
    "Human Subject Data",
    "Prohibited Uses",
    "Intended Use",
    "Intended Uses",
    "Limitations",
    "Maintenance Plan",
    "Ethical Review",
    "Confidentiality Level",
    "IRB",
    "IRB Protocol ID",
    "Human Subject Exemption",
    "FDA Regulated",
    "Deidentified",
    "Human Subjects",
    "Human Subject Research",
    "Data Governance Committee",
    "Addressing Gaps",
    "Data Anomalies",
    "Content Warning",
    "Informed Consent",
    "At Risk Populations",
  ]);

  const additionalCustomProperties: Array<{
    name: string;
    value: string | string[];
  }> = [];

  if (root.additionalProperty && Array.isArray(root.additionalProperty)) {
    root.additionalProperty.forEach((p) => {
      if (p.name && p.value !== undefined && p.value !== null) {
        if (!KNOWN_SECTION_FIELD_NAMES.has(p.name)) {
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
    authors: authorList.length > 0 ? authorList : undefined,
    about: aboutList.length > 0 ? aboutList : undefined,
    publisher: publisher || undefined,
    principal_investigator:
      root.principalInvestigator || (root.PI as any)?.name || undefined,
    contact_email: root.contactPoint?.email || root.contactEmail || undefined,
    license_value: license_value || undefined,
    keywords: keywordsValue,
    citation: root.citation || undefined,
    funding: root.funder
      ? Array.isArray(root.funder)
        ? root.funder.map((f) => (f as any).name || String(f)).join("; ")
        : (root.funder as any).name || String(root.funder)
      : undefined,
    related_publications:
      related_publications.length > 0 ? related_publications : undefined,
    copyright:
      root.copyrightNotice ||
      root.copyrightHolder?.name ||
      (root.copyrightHolder && typeof root.copyrightHolder === "string"
        ? root.copyrightHolder
        : undefined) ||
      undefined,
    kaggleUrl: root.kaggleUrl || undefined,
    notebookUrl: root.notebookUrl || undefined,
    additionalCustomProperties:
      additionalCustomProperties.length > 0
        ? additionalCustomProperties
        : undefined,
  };

  return overviewData;
};

export interface ComplianceEthicsData {
  ethicalReview?: string;
  confidentialityLevel?: string;
  irb?: string;
  irbProtocolId?: string;
  humanSubjectExemption?: string;
  fdaRegulated?: string | boolean;
  deidentified?: string | boolean;
  humanSubjects?: string | boolean;
  humanSubjectResearch?: string | boolean;
  dataGovernanceCommittee?: string;
}

export const processComplianceEthics = (
  metadata: Metadata
): ComplianceEthicsData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);
  if (!root) return {};

  return {
    ethicalReview:
      resolveField(root, "ethicalReview", ["Ethical Review"]) || undefined,
    confidentialityLevel:
      resolveField(root, "confidentialityLevel", ["Confidentiality Level"]) ||
      undefined,
    irb: resolveField(root, "irb", ["IRB"]) || undefined,
    irbProtocolId:
      resolveField(root, "irbProtocolId", ["IRB Protocol ID"]) || undefined,
    humanSubjectExemption:
      resolveField(root, "humanSubjectExemption", [
        "Human Subject Exemption",
      ]) || undefined,
    fdaRegulated:
      resolveField(root, "fdaRegulated", ["FDA Regulated"]) ?? undefined,
    deidentified:
      resolveField(root, "deidentified", ["Deidentified"]) ?? undefined,
    humanSubjects:
      resolveField(root, "humanSubjects", [
        "Human Subjects",
        "Human Subject",
        "Human Subject Data",
      ]) ?? undefined,
    humanSubjectResearch:
      resolveField(root, "humanSubjectResearch", [
        "Human Subject Research",
      ]) ?? undefined,
    dataGovernanceCommittee:
      resolveField(root, "dataGovernanceCommittee", [
        "Data Governance Committee",
      ]) || undefined,
  };
};

export interface AIReadyData {
  dataUseCases?: string;
  dataLimitations?: string;
  dataBiases?: string;
  dataReleaseMaintenancePlan?: string;
  dataCollection?: string;
  dataCollectionType?: string;
  dataCollectionMissingData?: string;
  dataCollectionRawData?: string;
  dataCollectionTimeframe?: string;
  dataImputationProtocol?: string;
  dataManipulationProtocol?: string;
  dataPreprocessingProtocol?: string;
  dataAnnotationProtocol?: string;
  dataAnnotationPlatform?: string;
  dataAnnotationAnalysis?: string;
  personalSensitiveInformation?: string;
  dataSocialImpact?: string;
  annotationsPerItem?: string;
  machineAnnotationTools?: string;
  completeness?: string;
  prohibitedUses?: string;
  addressingGaps?: string;
  dataAnomalies?: string;
  contentWarning?: string;
  informedConsent?: string;
  atRiskPopulations?: string;
}

export const processAIReady = (metadata: Metadata): AIReadyData => {
  const graph = (metadata["@graph"] as RawGraphEntity[]) || [];
  const root = findRootEntity(graph);
  if (!root) return {};

  return {
    dataUseCases:
      resolveField(root, "rai:dataUseCases", [
        "Intended Use",
        "Intended Uses",
      ]) || undefined,
    dataLimitations:
      resolveField(root, "rai:dataLimitations", ["Limitations"]) || undefined,
    dataBiases: root["rai:dataBiases"] || undefined,
    dataReleaseMaintenancePlan:
      resolveField(root, "rai:dataReleaseMaintenancePlan", [
        "Maintenance Plan",
      ]) || undefined,
    dataCollection: root["rai:dataCollection"] || undefined,
    dataCollectionType: root["rai:dataCollectionType"] || undefined,
    dataCollectionMissingData:
      root["rai:dataCollectionMissingData"] || undefined,
    dataCollectionRawData: root["rai:dataCollectionRawData"] || undefined,
    dataCollectionTimeframe: root["rai:dataCollectionTimeframe"] || undefined,
    dataImputationProtocol: root["rai:dataImputationProtocol"] || undefined,
    dataManipulationProtocol:
      root["rai:dataManipulationProtocol"] || undefined,
    dataPreprocessingProtocol:
      root["rai:dataPreprocessingProtocol"] || undefined,
    dataAnnotationProtocol: root["rai:dataAnnotationProtocol"] || undefined,
    dataAnnotationPlatform: root["rai:dataAnnotationPlatform"] || undefined,
    dataAnnotationAnalysis: root["rai:dataAnnotationAnalysis"] || undefined,
    personalSensitiveInformation:
      root["rai:personalSensitiveInformation"] || undefined,
    dataSocialImpact: root["rai:dataSocialImpact"] || undefined,
    annotationsPerItem: root["rai:annotationsPerItem"] || undefined,
    machineAnnotationTools: root["rai:machineAnnotationTools"] || undefined,
    completeness:
      resolveField(root, "completeness", ["Completeness"]) || undefined,
    prohibitedUses:
      resolveField(root, "prohibitedUses", ["Prohibited Uses"]) || undefined,
    addressingGaps:
      resolveField(root, "d4d:addressingGaps", ["Addressing Gaps"]) ||
      undefined,
    dataAnomalies:
      resolveField(root, "d4d:dataAnomalies", ["Data Anomalies"]) || undefined,
    contentWarning:
      resolveField(root, "d4d:contentWarning", ["Content Warning"]) ||
      undefined,
    informedConsent:
      resolveField(root, "d4d:informedConsent", ["Informed Consent"]) ||
      undefined,
    atRiskPopulations:
      resolveField(root, "d4d:atRiskPopulations", ["At Risk Populations"]) ||
      undefined,
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

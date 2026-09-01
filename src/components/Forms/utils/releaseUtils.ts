import {
  ALL_RAI_FIELDS,
  normalizeRaiFieldsForApi,
  normalizeRaiFieldsForForm,
} from "./raiFieldNormalizer";

interface FormData {
  [key: string]: any;
}

interface UploadedFile {
  name: string;
  content: string;
}

interface SubCrate {
  "@id": string;
  "@type": string[];
  name: string;
  description: string;
  version: string;
  keywords?: string;
  "ro-crate-metadata": string;
}

function generateArkId(
  name: string = "release",
  version: string = "1.0",
): string {
  const NAAN = "59853";

  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);

  const safeVersion = version
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `ark:${NAAN}/rocrate-${safeName}-v${safeVersion}`;
}

export function parseRoCrateMetadata(jsonContent: string): FormData {
  try {
    console.log("=== parseRoCrateMetadata ===");
    console.log("Input type:", typeof jsonContent);
    console.log("Input preview:", jsonContent.substring(0, 200));

    const parsed = JSON.parse(jsonContent);
    console.log("Parsed object keys:", Object.keys(parsed));
    console.log("Has @graph:", !!parsed["@graph"]);

    if (
      !parsed["@graph"] ||
      !Array.isArray(parsed["@graph"]) ||
      parsed["@graph"].length < 2
    ) {
      console.error("Invalid RO-Crate structure:", {
        hasGraph: !!parsed["@graph"],
        isArray: Array.isArray(parsed["@graph"]),
        length: parsed["@graph"]?.length,
      });
      throw new Error(
        "Invalid RO-Crate structure: missing @graph or insufficient entries",
      );
    }

    console.log("@graph length:", parsed["@graph"].length);
    console.log("@graph[0] (metadata descriptor):", parsed["@graph"][0]);
    console.log("@graph[1] (root dataset) @id:", parsed["@graph"][1]?.["@id"]);
    console.log("@graph[1] @type:", parsed["@graph"][1]?.["@type"]);

    const rootNode = parsed["@graph"][1];
    const formData: FormData = {};

    formData["@id"] = rootNode["@id"] || "";
    formData.name = rootNode.name || "";
    formData.description = rootNode.description || "";
    formData.version = rootNode.version || "1.0";
    formData.identifier = rootNode.identifier || "";
    formData.datePublished = rootNode.datePublished || "";
    formData.license =
      rootNode.license || "https://creativecommons.org/licenses/by/4.0/";

    if (rootNode.hasPart && Array.isArray(rootNode.hasPart)) {
      formData.hasPart = rootNode.hasPart;

      const subCrates: SubCrate[] = [];
      rootNode.hasPart.forEach((part: any) => {
        const partId = part["@id"];
        const partNode = parsed["@graph"].find(
          (node: any) => node["@id"] === partId,
        );
        if (
          partNode &&
          partNode["@type"] &&
          (partNode["@type"].includes("Dataset") ||
            partNode["@type"].includes("https://w3id.org/EVI#ROCrate"))
        ) {
          subCrates.push({
            "@id": partNode["@id"],
            "@type": partNode["@type"],
            name: partNode.name || "",
            description: partNode.description || "",
            version: partNode.version || "1.0",
            keywords: Array.isArray(partNode.keywords)
              ? partNode.keywords.join(", ")
              : partNode.keywords || "",
            "ro-crate-metadata": partNode["ro-crate-metadata"] || "",
          });
        }
      });
      formData.subCrates = subCrates;
    } else {
      formData.hasPart = [];
      formData.subCrates = [];
    }

    if (rootNode.isPartOf && Array.isArray(rootNode.isPartOf)) {
      const org = rootNode.isPartOf.find((item: any) =>
        item["@id"]?.includes("organization"),
      );
      const proj = rootNode.isPartOf.find((item: any) =>
        item["@id"]?.includes("project"),
      );

      if (org) {
        formData.organizationName = org["@id"];
      }

      if (proj) {
        formData.projectName = proj["@id"];
      }
    }

    formData.author = rootNode.author || "";
    formData.publisher = rootNode.publisher || "";
    formData.principalInvestigator = rootNode.principalInvestigator || "";
    formData.contactEmail = rootNode.contactEmail || "";
    formData.confidentialityLevel = rootNode.confidentialityLevel || "";
    formData.citation = rootNode.citation || "";
    formData.funder = rootNode.funder || "";
    formData.usageInfo = rootNode.usageInfo || "";
    formData.contentSize = rootNode.contentSize || "";
    formData.ethicalReview = rootNode.ethicalReview || "";
    formData.conditionsOfAccess = rootNode.conditionsOfAccess || "";
    formData.copyrightNotice = rootNode.copyrightNotice || "";

    // Preserve existing @id if provided, otherwise generate one
    if (!formData["@id"]) {
      formData["@id"] = generateArkId(formData.name, formData.version);
    }

    if (rootNode.keywords) {
      if (Array.isArray(rootNode.keywords)) {
        formData.keywords = rootNode.keywords.join(", ");
      } else {
        formData.keywords = rootNode.keywords;
      }
    } else {
      formData.keywords = "";
    }

    if (rootNode.associatedPublication) {
      if (Array.isArray(rootNode.associatedPublication)) {
        formData.associatedPublication =
          rootNode.associatedPublication.join("\n");
      } else {
        formData.associatedPublication = rootNode.associatedPublication;
      }
    } else {
      formData.associatedPublication = "";
    }

    // Copy RAI fields from rootNode, then normalize for form display
    ALL_RAI_FIELDS.forEach((field) => {
      formData[field] = rootNode[field] ?? "";
    });
    Object.assign(formData, normalizeRaiFieldsForForm(formData));

    if (
      rootNode.additionalProperty &&
      Array.isArray(rootNode.additionalProperty)
    ) {
      rootNode.additionalProperty.forEach((prop: any) => {
        if (prop["@type"] === "PropertyValue" && prop.name) {
          switch (prop.name) {
            case "Completeness":
              formData.completeness = prop.value || "";
              break;
            case "Human Subject":
              formData.humanSubject = prop.value || "";
              break;
            case "Prohibited Uses":
              formData.prohibitedUses = prop.value || "";
              break;
          }
        }
      });
    }

    formData.completeness = formData.completeness || "";
    formData.humanSubject = formData.humanSubject || "";
    formData.prohibitedUses = formData.prohibitedUses || "";

    console.log("=== Parsed FormData ===");
    console.log("Total fields:", Object.keys(formData).length);
    console.log("Key fields:", {
      "@id": formData["@id"],
      name: formData.name,
      description: formData.description?.substring(0, 100) + "...",
      keywords: formData.keywords,
      version: formData.version,
      author: formData.author,
    });
    console.log(
      "RAI fields present:",
      Object.keys(formData).filter((k) => k.startsWith("rai:")).length,
    );

    return formData;
  } catch (error) {
    console.error("!!! Error parsing RO-Crate metadata:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : String(error),
    );
    throw error;
  }
}

export function generateReleaseJson(formData: FormData): any {
  // Preserve existing @id if provided, otherwise generate one
  const releaseId =
    formData["@id"] || generateArkId(formData.name, formData.version);

  const releaseNode: any = {
    "@id": releaseId,
    "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"],
    name: formData.name || "Untitled Release",
    description: formData.description || "",
    version: formData.version || "1.0",
    license: formData.license || "https://creativecommons.org/licenses/by/4.0/",
    datePublished:
      formData.datePublished || new Date().toISOString().split("T")[0],
  };

  if (formData.keywords) {
    const keywords = formData.keywords
      .split(",")
      .map((k: string) => k.trim())
      .filter(Boolean);
    if (keywords.length > 0) {
      releaseNode.keywords = keywords;
    }
  }

  if (formData.organizationName || formData.projectName) {
    releaseNode.isPartOf = [];
    if (formData.organizationName) {
      releaseNode.isPartOf.push({
        "@id": formData.organizationName,
      });
    }
    if (formData.projectName) {
      releaseNode.isPartOf.push({
        "@id": formData.projectName,
      });
    }
  }

  if (formData.author) {
    releaseNode.author = formData.author;
  }

  if (formData.identifier && formData.identifier !== releaseId) {
    releaseNode.identifier = formData.identifier;
  }

  if (formData.publisher) {
    releaseNode.publisher = formData.publisher;
  }

  if (formData.principalInvestigator) {
    releaseNode.principalInvestigator = formData.principalInvestigator;
  }

  if (formData.contactEmail) {
    releaseNode.contactEmail = formData.contactEmail;
  }

  if (formData.confidentialityLevel) {
    releaseNode.confidentialityLevel = formData.confidentialityLevel;
  }

  if (formData.citation) {
    releaseNode.citation = formData.citation;
  }

  if (formData.funder) {
    releaseNode.funder = formData.funder;
  }

  if (formData.usageInfo) {
    releaseNode.usageInfo = formData.usageInfo;
  }

  if (formData.contentSize) {
    releaseNode.contentSize = formData.contentSize;
  }

  if (formData.ethicalReview) {
    releaseNode.ethicalReview = formData.ethicalReview;
  }

  if (formData.conditionsOfAccess) {
    releaseNode.conditionsOfAccess = formData.conditionsOfAccess;
  }

  if (formData.copyrightNotice) {
    releaseNode.copyrightNotice = formData.copyrightNotice;
  }

  if (formData.associatedPublication) {
    const publications = formData.associatedPublication
      .split("\n")
      .map((p: string) => p.trim())
      .filter(Boolean);
    if (publications.length > 0) {
      releaseNode.associatedPublication = publications;
    }
  }

  // Normalize RAI fields for API (some as strings, some as arrays per schema)
  const normalizedRai = normalizeRaiFieldsForApi(formData);
  ALL_RAI_FIELDS.forEach((field) => {
    if (normalizedRai[field] !== null && normalizedRai[field] !== undefined) {
      releaseNode[field] = normalizedRai[field];
    }
  });

  const additionalProperties: any[] = [];

  if (formData.completeness) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Completeness",
      value: formData.completeness,
    });
  }

  if (formData.humanSubject) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Human Subject",
      value: formData.humanSubject,
    });
  }

  if (formData.prohibitedUses) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Prohibited Uses",
      value: formData.prohibitedUses,
    });
  }

  if (additionalProperties.length > 0) {
    releaseNode.additionalProperty = additionalProperties;
  }

  if (formData.hasPart && Array.isArray(formData.hasPart)) {
    releaseNode.hasPart = formData.hasPart;
  } else {
    releaseNode.hasPart = [];
  }

  if (formData.subCrates && Array.isArray(formData.subCrates)) {
    const existingIds = new Set(releaseNode.hasPart.map((h: any) => h["@id"]));
    formData.subCrates.forEach((subCrate: SubCrate) => {
      if (!existingIds.has(subCrate["@id"])) {
        releaseNode.hasPart.push({ "@id": subCrate["@id"] });
      }
    });
  }

  const graphNodes = [
    {
      "@id": "ro-crate-metadata.json",
      "@type": "CreativeWork",
      conformsTo: {
        "@id": "https://w3id.org/ro/crate/1.2-DRAFT",
      },
      about: {
        "@id": releaseId,
      },
    },
    releaseNode,
  ];

  if (formData.subCrates && Array.isArray(formData.subCrates)) {
    formData.subCrates.forEach((subCrate: SubCrate) => {
      const subCrateNode: any = {
        "@id": subCrate["@id"],
        "@type": subCrate["@type"] || [
          "Dataset",
          "https://w3id.org/EVI#ROCrate",
        ],
        name: subCrate.name,
        description: subCrate.description,
        version: subCrate.version || "1.0",
      };

      if (subCrate.keywords) {
        const keywords = subCrate.keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean);
        if (keywords.length > 0) {
          subCrateNode.keywords = keywords;
        }
      }

      if (subCrate["ro-crate-metadata"]) {
        subCrateNode["ro-crate-metadata"] = subCrate["ro-crate-metadata"];
      }

      graphNodes.push(subCrateNode);
    });
  }

  const roCrate = {
    "@context": {
      "@vocab": "https://schema.org/",
      EVI: "https://w3id.org/EVI#",
    },
    "@graph": graphNodes,
  };

  return roCrate;
}

export function generateSubCrateId(name: string): string {
  const NAAN = "59853";
  const timestamp = Date.now().toString(36).toUpperCase();
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 30);
  return `ark:${NAAN}/rocrate-${safeName}-${timestamp}`;
}

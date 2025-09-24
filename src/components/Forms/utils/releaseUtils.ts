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

export function parseRoCrateMetadata(jsonContent: string): FormData {
  try {
    const parsed = JSON.parse(jsonContent);

    if (
      !parsed["@graph"] ||
      !Array.isArray(parsed["@graph"]) ||
      parsed["@graph"].length < 2
    ) {
      throw new Error(
        "Invalid RO-Crate structure: missing @graph or insufficient entries"
      );
    }

    const rootNode = parsed["@graph"][1];
    const formData: FormData = {};

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
          (node: any) => node["@id"] === partId
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
        item["@id"]?.includes("organization")
      );
      const proj = rootNode.isPartOf.find((item: any) =>
        item["@id"]?.includes("project")
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

    const raiFields = [
      "rai:dataLimitations",
      "rai:dataBiases",
      "rai:dataUseCases",
      "rai:dataReleaseMaintenancePlan",
      "rai:dataCollection",
      "rai:dataCollectionType",
      "rai:dataCollectionMissingData",
      "rai:dataCollectionRawData",
      "rai:dataCollectionTimeframe",
      "rai:dataImputationProtocol",
      "rai:dataManipulationProtocol",
      "rai:dataPreprocessingProtocol",
      "rai:dataAnnotationProtocol",
      "rai:dataAnnotationPlatform",
      "rai:dataAnnotationAnalysis",
      "rai:personalSensitiveInformation",
      "rai:dataSocialImpact",
      "rai:annotationsPerItem",
      "rai:annotatorDemographics",
      "rai:machineAnnotationTools",
    ];

    raiFields.forEach((field) => {
      if (rootNode[field]) {
        formData[field] = rootNode[field];
      } else {
        formData[field] = "";
      }
    });

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

    return formData;
  } catch (error) {
    console.error("Error parsing RO-Crate metadata:", error);
    throw error;
  }
}

export function generateReleaseJson(formData: FormData): any {
  const NAAN = "59853";
  const timestamp = Date.now();
  const safeName = (formData.name || "release")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 50);

  const releaseId =
    formData.identifier || `ark:/${NAAN}/rocrate-${safeName}-${timestamp}`;

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

  const raiFields = [
    "rai:dataLimitations",
    "rai:dataBiases",
    "rai:dataUseCases",
    "rai:dataReleaseMaintenancePlan",
    "rai:dataCollection",
    "rai:dataCollectionType",
    "rai:dataCollectionMissingData",
    "rai:dataCollectionRawData",
    "rai:dataCollectionTimeframe",
    "rai:dataImputationProtocol",
    "rai:dataManipulationProtocol",
    "rai:dataPreprocessingProtocol",
    "rai:dataAnnotationProtocol",
    "rai:dataAnnotationPlatform",
    "rai:dataAnnotationAnalysis",
    "rai:personalSensitiveInformation",
    "rai:dataSocialImpact",
    "rai:annotationsPerItem",
    "rai:annotatorDemographics",
    "rai:machineAnnotationTools",
  ];

  raiFields.forEach((field) => {
    if (formData[field]) {
      releaseNode[field] = formData[field];
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

export async function mockLLMCall(
  documents: UploadedFile[]
): Promise<FormData> {
  console.log(
    "Mock LLM processing documents:",
    documents.map((d) => d.name)
  );

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const suggestedData: FormData = {
    name: "AI-Suggested Dataset Release",
    description:
      "This is a mock AI-generated description based on the uploaded documents. In production, this would analyze your documents and suggest appropriate metadata.",
    keywords: "machine learning, dataset, artificial intelligence, research",
    organizationName: "Research Organization",
    projectName: "AI Research Project",
    author: "Research Team",
    principalInvestigator: "Dr. Example Researcher",
    contactEmail: "research@example.org",
    "rai:dataUseCases":
      "Training machine learning models, academic research, benchmarking",
    "rai:dataLimitations":
      "Limited to specific domain, may not generalize to other contexts",
    "rai:dataBiases": "Sample selection bias may be present",
    "rai:dataReleaseMaintenancePlan": "Quarterly updates planned through 2026",
  };

  return suggestedData;
}

export function generateSubCrateId(name: string): string {
  const NAAN = "59853";
  const timestamp = Date.now().toString(36).toUpperCase();
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 30);
  return `ark:/${NAAN}/rocrate-${safeName}-${timestamp}`;
}

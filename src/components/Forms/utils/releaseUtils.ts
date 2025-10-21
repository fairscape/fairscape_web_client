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
  version: string = "1.0"
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

  return `ark:/${NAAN}/rocrate-${safeName}-v${safeVersion}`;
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

    formData["@id"] = generateArkId(formData.name, formData.version);

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
  const releaseId = generateArkId(formData.name, formData.version);

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
  const API_URL = "http://localhost:5005";

  const formData = new FormData();
  documents.forEach((doc) => {
    formData.append("files", doc.content, doc.name);
  });

  const submitResponse = await fetch(`${API_URL}/submit`, {
    method: "POST",
    body: formData,
  });

  if (!submitResponse.ok) {
    throw new Error("Failed to submit files for processing");
  }

  const { task_id } = await submitResponse.json();

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`${API_URL}/status/${task_id}`);
    if (!statusResponse.ok) {
      throw new Error("Failed to check task status");
    }

    const statusData = await statusResponse.json();

    if (statusData.status === "completed") {
      const resultResponse = await fetch(`${API_URL}/result/${task_id}`);
      if (!resultResponse.ok) {
        throw new Error("Failed to retrieve result");
      }

      const resultData = await resultResponse.json();
      const roCrateJson = JSON.parse(resultData.result);

      const datasetNode = roCrateJson["@graph"][1];

      const parsedFormData: FormData = {
        name: datasetNode.name || "",
        description: datasetNode.description || "",
        version: datasetNode.version || "1.0",
        license: datasetNode.license || "",
        author: datasetNode.author || "",
        keywords: Array.isArray(datasetNode.keywords)
          ? datasetNode.keywords.join(", ")
          : "",
        associatedPublication: Array.isArray(datasetNode.associatedPublication)
          ? datasetNode.associatedPublication.join("\n")
          : datasetNode.associatedPublication || "",
        conditionsOfAccess: datasetNode.conditionsOfAccess || "",
        copyrightNotice: datasetNode.copyrightNotice || "",
        "rai:dataCollection": datasetNode["rai:dataCollection"] || "",
        "rai:dataCollectionType": Array.isArray(
          datasetNode["rai:dataCollectionType"]
        )
          ? datasetNode["rai:dataCollectionType"].join(", ")
          : "",
        "rai:dataCollectionMissingData":
          datasetNode["rai:dataCollectionMissingData"] || "",
        "rai:dataCollectionRawData":
          datasetNode["rai:dataCollectionRawData"] || "",
        "rai:dataCollectionTimeframe": Array.isArray(
          datasetNode["rai:dataCollectionTimeframe"]
        )
          ? datasetNode["rai:dataCollectionTimeframe"].join(", ")
          : "",
        "rai:dataImputationProtocol":
          datasetNode["rai:dataImputationProtocol"] || "",
        "rai:dataManipulationProtocol":
          datasetNode["rai:dataManipulationProtocol"] || "",
        "rai:dataPreprocessingProtocol": Array.isArray(
          datasetNode["rai:dataPreprocessingProtocol"]
        )
          ? datasetNode["rai:dataPreprocessingProtocol"].join(", ")
          : "",
        "rai:dataAnnotationProtocol":
          datasetNode["rai:dataAnnotationProtocol"] || "",
        "rai:dataAnnotationPlatform": Array.isArray(
          datasetNode["rai:dataAnnotationPlatform"]
        )
          ? datasetNode["rai:dataAnnotationPlatform"].join(", ")
          : "",
        "rai:dataAnnotationAnalysis": Array.isArray(
          datasetNode["rai:dataAnnotationAnalysis"]
        )
          ? datasetNode["rai:dataAnnotationAnalysis"].join(", ")
          : "",
        "rai:dataReleaseMaintenancePlan":
          datasetNode["rai:dataReleaseMaintenancePlan"] || "",
        "rai:personalSensitiveInformation": Array.isArray(
          datasetNode["rai:personalSensitiveInformation"]
        )
          ? datasetNode["rai:personalSensitiveInformation"].join(", ")
          : "",
        "rai:dataSocialImpact": datasetNode["rai:dataSocialImpact"] || "",
        "rai:dataBiases": Array.isArray(datasetNode["rai:dataBiases"])
          ? datasetNode["rai:dataBiases"].join(", ")
          : "",
        "rai:dataLimitations": Array.isArray(datasetNode["rai:dataLimitations"])
          ? datasetNode["rai:dataLimitations"].join(", ")
          : "",
        "rai:dataUseCases": Array.isArray(datasetNode["rai:dataUseCases"])
          ? datasetNode["rai:dataUseCases"].join(", ")
          : "",
        "rai:annotationsPerItem": datasetNode["rai:annotationsPerItem"] || "",
        "rai:annotatorDemographics": Array.isArray(
          datasetNode["rai:annotatorDemographics"]
        )
          ? datasetNode["rai:annotatorDemographics"].join(", ")
          : "",
        "rai:machineAnnotationTools": Array.isArray(
          datasetNode["rai:machineAnnotationTools"]
        )
          ? datasetNode["rai:machineAnnotationTools"].join(", ")
          : "",
      };

      return parsedFormData;
    } else if (statusData.status === "failed") {
      throw new Error(`Processing failed: ${statusData.error}`);
    }
  }
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

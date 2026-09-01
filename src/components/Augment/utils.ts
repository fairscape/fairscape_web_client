// src/utils.ts

import {
  UploadedCrateInfo,
  ReleaseFormData,
  CrateEntity,
  AdditionalProperty,
} from "./interfaces";

// Basic GUID generation (client-side, timestamp-based)
export const generateTemporaryGuid = (type: string = "entity"): string => {
  // Replace with a more robust scheme if needed, but this works for session uniqueness
  return `urn:temp:${type.toLowerCase()}:${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
};

// Helper to get a simple type string from @type
export const getSimpleEntityType = (
  typeInfo: string | string[] | undefined,
): string => {
  if (!typeInfo) return "Thing";
  const types = Array.isArray(typeInfo) ? typeInfo : [typeInfo];
  // Prioritize schema.org/EVI types, then others, fallback to first or 'Thing'
  const foundType = types.find((t) => t.includes("/") || t.includes(":"));
  if (foundType) {
    const parts = foundType.split(/[\/#:]/).filter(Boolean);
    return parts.pop() || "Thing";
  }
  return types[0] || "Thing";
};

// Function to parse an uploaded RO-Crate JSON and extract relevant data
export const parseUploadedCrate = (
  fileName: string,
  jsonContent: any,
): UploadedCrateInfo | null => {
  if (!jsonContent || !Array.isArray(jsonContent["@graph"])) {
    console.warn(`Invalid RO-Crate structure in ${fileName}`);
    return null;
  }

  const graph = jsonContent["@graph"];
  const metadataDescriptor = graph.find(
    (node: any) => node["@id"] === "ro-crate-metadata.json",
  );
  const rootNode = graph.find(
    (node: any) =>
      node["@id"] === "./" || // Standard RO-Crate root
      node["@type"]?.includes("Dataset") ||
      node["@type"]?.includes("https://w3id.org/EVI#ROCrate"),
  );

  if (!rootNode) {
    console.warn(
      `Could not find the main root node (./, Dataset, or ROCrate type) in ${fileName}`,
    );
    // Attempt to use the first non-metadata descriptor node as a fallback? Or just skip?
    // Let's skip for now to avoid unexpected behavior.
    return null;
  }

  const entities: CrateEntity[] = graph
    .filter((node: any) => node !== metadataDescriptor && node !== rootNode)
    .map((node: any) => ({
      // Basic mapping for display/linking
      "@id": node["@id"],
      "@type": node["@type"],
      name: node.name,
      description: node.description,
      version: node.version,
      filename: node.contentUrl?.replace("file:///", ""), // Simplify file paths
      fileFormat: node.fileFormat, // For Software
      encodingFormat: node.encodingFormat, // For Dataset
      author: node.author,
      // Store the full node data for later JSON reconstruction
      ...node,
    }));

  return {
    fileName,
    parsedJson: jsonContent,
    rootNodeId: rootNode["@id"],
    rootNode: rootNode,
    entities: entities,
  };
};

// Function to map parsed JSON-LD root node data to ReleaseFormData
export const mapJsonToFormData = (rootNode: any): InitialReleaseFormValues => {
  const formData: InitialReleaseFormValues = {};

  if (!rootNode) return formData;

  formData.name = rootNode.name;
  formData.description = rootNode.description;
  formData.id_value = rootNode["@id"] !== "./" ? rootNode["@id"] : undefined; // Don't pre-fill ./
  formData.version = rootNode.version;
  formData.doi =
    typeof rootNode.identifier === "string"
      ? rootNode.identifier
      : Array.isArray(rootNode.identifier)
        ? rootNode.identifier.find(
            (id: any) =>
              typeof id === "string" &&
              (id.startsWith("10.") || id.includes("doi.org")),
          )
        : undefined;
  formData.release_date = rootNode.datePublished?.split("T")[0]; // Get YYYY-MM-DD
  formData.license_value =
    typeof rootNode.license === "object"
      ? rootNode.license["@id"]
      : rootNode.license;
  formData.keywords = Array.isArray(rootNode.keywords)
    ? rootNode.keywords.join(", ")
    : rootNode.keywords;

  // People/Organizations
  formData.author = Array.isArray(rootNode.author)
    ? rootNode.author
        .map((a: any) => (typeof a === "object" && a.name ? a.name : a))
        .join(", ")
    : typeof rootNode.author === "object" && rootNode.author.name
      ? rootNode.author.name
      : rootNode.author;
  formData.principal_investigator =
    typeof rootNode.principalInvestigator === "object" &&
    rootNode.principalInvestigator.name
      ? rootNode.principalInvestigator.name
      : rootNode.principalInvestigator;
  formData.contact_email =
    typeof rootNode.contactPoint === "object" && rootNode.contactPoint.email
      ? rootNode.contactPoint.email
      : undefined;
  formData.publisher =
    typeof rootNode.publisher === "object" && rootNode.publisher.name
      ? rootNode.publisher.name
      : rootNode.publisher;
  formData.funder =
    typeof rootNode.funder === "object" && rootNode.funder.name
      ? rootNode.funder.name
      : rootNode.funder;
  formData.organizationName = rootNode.organizationName; // Assuming direct mapping if used
  formData.projectName = rootNode.projectName; // Assuming direct mapping if used

  // Access/Citation
  formData.associatedPublication = Array.isArray(rootNode.associatedPublication)
    ? rootNode.associatedPublication
        .map((p: any) =>
          typeof p === "object" && p["@id"]
            ? p["@id"]
            : typeof p === "object" && p.name
              ? p.name
              : p,
        )
        .join(", ")
    : typeof rootNode.associatedPublication === "object" &&
        rootNode.associatedPublication["@id"]
      ? rootNode.associatedPublication["@id"]
      : rootNode.associatedPublication;
  formData.conditionsOfAccess = rootNode.conditionsOfAccess;
  formData.copyrightNotice =
    rootNode.copyrightNotice ||
    (typeof rootNode.copyrightHolder === "object" &&
    rootNode.copyrightHolder.name
      ? rootNode.copyrightHolder.name
      : rootNode.copyrightHolder);
  formData.citation = rootNode.citation;
  formData.usageInfo = rootNode.usageInfo;
  formData.content_size = rootNode.contentSize;
  formData.confidentiality_level = rootNode.confidentialityLevel;
  formData.ethicalReview = rootNode.ethicalReview;

  // additionalProperty mapping (dedicated fields)
  if (Array.isArray(rootNode.additionalProperty)) {
    rootNode.additionalProperty.forEach((prop: any) => {
      if (
        prop["@type"] === "PropertyValue" &&
        prop.name &&
        prop.value !== undefined
      ) {
        switch (prop.name) {
          case "Completeness":
            formData.completeness = prop.value;
            break;
          case "Intended Use":
            formData.intended_uses = prop.value;
            break;
          case "Prohibited Uses":
            formData.prohibited_uses = prop.value;
            break;
          case "Limitations":
            formData.limitations = prop.value;
            break;
          case "Potential Sources of Bias":
            formData.potential_sources_of_bias = prop.value;
            break;
          case "Human Subject":
            formData.human_subject = prop.value;
            break;
          case "Maintenance Plan":
            formData.maintenance_plan = prop.value;
            break;
          // Add other known additionalProperty mappings here if needed
          default:
            // Ignore other additionalProperties here, they will be handled by the dedicated section
            break;
        }
      }
    });
  }
  // Note: Custom/dynamic additional properties and customProperties JSON strings
  // are handled separately in ReleaseBuilderPage/AdditionalPropertiesSection

  return formData;
};

// Function to map parsed JSON-LD root node additional properties to AdditionalProperty[]
export const mapJsonToAdditionalProperties = (
  rootNode: any,
): AdditionalProperty[] => {
  const additionalProps: AdditionalProperty[] = [];
  if (Array.isArray(rootNode?.additionalProperty)) {
    rootNode.additionalProperty.forEach((prop: any) => {
      // Filter out known additionalProperty names already mapped to dedicated fields
      const knownAdditionalPropertyNames = [
        "Completeness",
        "Intended Use",
        "Prohibited Uses",
        "Limitations",
        "Potential Sources of Bias",
        "Human Subject",
        "Maintenance Plan",
      ];
      if (
        prop["@type"] === "PropertyValue" &&
        prop.name &&
        prop.value !== undefined &&
        !knownAdditionalPropertyNames.includes(prop.name)
      ) {
        additionalProps.push({
          id: generateTemporaryGuid("additionalProperty"), // Assign a unique ID for React key
          name: prop.name,
          value: prop.value.toString(), // Ensure value is string
        });
      }
    });
  }
  return additionalProps;
};

// Function to map parsed JSON-LD root node custom properties to string
export const mapJsonToCustomPropertiesJson = (rootNode: any): string => {
  // Find properties in rootNode that are NOT standard schema.org/RO-Crate properties
  const standardProperties = [
    "@id",
    "@type",
    "name",
    "description",
    "version",
    "identifier",
    "datePublished",
    "license",
    "keywords",
    "author",
    "principalInvestigator",
    "contactPoint",
    "publisher",
    "funder",
    "organizationName",
    "projectName",
    "associatedPublication",
    "conditionsOfAccess",
    "copyrightNotice",
    "citation",
    "usageInfo",
    "contentSize",
    "confidentialityLevel",
    "ethicalReview",
    "additionalProperty",
    "hasPart", // hasPart is standard!
  ];

  const customProps: Record<string, any> = {};
  if (rootNode) {
    Object.keys(rootNode).forEach((key) => {
      if (!standardProperties.includes(key) && key !== "copyrightHolder") {
        // Include copyrightHolder here as we map it to copyrightNotice
        customProps[key] = rootNode[key];
      }
    });
  }

  // Attempt to pretty-print the custom properties as JSON string
  return Object.keys(customProps).length > 0
    ? JSON.stringify(customProps, null, 2)
    : "{}";
};

// Function to generate the final RO-Crate JSON-LD based on form state
export const generateReleaseCrateJson = (
  formData: ReleaseFormData,
  additionalProperties: AdditionalProperty[],
  hasPartEntities: CrateEntity[],
): any => {
  // Start with defaults from form data
  const finalData = { ...formData };

  // Ensure critical fields have defaults if STILL empty after initial load/defaults
  if (!finalData.name) finalData.name = "Untitled Data Release";
  if (!finalData.description)
    finalData.description = "No description provided.";
  if (!finalData.id_value || finalData.id_value === "./")
    finalData.id_value = `ark:59852/release-crate-${Date.now()}`; // Auto-generate if empty or './'
  finalData.release_date =
    finalData.release_date || new Date().toISOString().split("T")[0];
  finalData.license_value =
    finalData.license_value || "https://creativecommons.org/licenses/by/4.0/";

  // --- Map form data to JSON-LD structure ---
  const keywordsArray = finalData.keywords
    ? finalData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined; // Use undefined if empty array needed

  const associatedPublicationArray = finalData.associatedPublication
    ? finalData.associatedPublication
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : undefined;

  const authorsArray = finalData.author
    ? finalData.author
        .split(",")
        .map((a) => ({ "@type": "Person", name: a.trim() }))
    : undefined;

  // Combine dedicated additional properties and user-added ones
  const combinedAdditionalProperties: any[] = [];

  if (finalData.completeness)
    combinedAdditionalProperties.push({
      "@type": "PropertyValue",
      name: "Completeness",
      value: finalData.completeness,
    });
  if (finalData.intended_uses)
    combinedAdditionalProperties.push({
      "@type": "PropertyValue",
      name: "Intended Use",
      value: finalData.intended_uses,
    });
  if (finalData.prohibited_uses)
    combinedAdditionalProperties.push({
      "@type": "PropertyValue",
      name: "Prohibited Uses",
      value: finalData.prohibited_uses,
    });
  if (finalData.limitations)
    combinedAdditionalProperties.push({
      "@type": "PropertyValue",
      name: "Limitations",
      value: finalData.limitations,
    });
  if (finalData.potential_sources_of_bias)
    combinedAdditionalProperties.push({
      "@type": "PropertyValue",
      name: "Potential Sources of Bias",
      value: finalData.potential_sources_of_bias,
    });
  if (finalData.human_subject)
    combinedAdditionalProperties.push({
      "@type": "PropertyValue",
      name: "Human Subject",
      value: finalData.human_subject,
    });
  if (finalData.maintenance_plan)
    combinedAdditionalProperties.push({
      "@type": "PropertyValue",
      name: "Maintenance Plan",
      value: finalData.maintenance_plan,
    });

  // Add dynamically added additional properties
  additionalProperties.forEach((prop) => {
    if (prop.name && prop.value !== undefined) {
      combinedAdditionalProperties.push({
        "@type": "PropertyValue",
        name: prop.name,
        value: prop.value,
      });
    }
  });

  // Parse custom properties JSON string
  let customProps = {};
  if (finalData.customPropertiesJson) {
    try {
      const userCustomProps = JSON.parse(finalData.customPropertiesJson);
      if (
        typeof userCustomProps === "object" &&
        userCustomProps !== null &&
        !Array.isArray(userCustomProps)
      )
        customProps = userCustomProps;
      else console.warn("customPropertiesJson is not a valid JSON object.");
    } catch (e) {
      console.warn("Error parsing customPropertiesJson:", e);
    }
  }

  // Construct the main release crate node
  const releaseRootNode: any = {
    "@id": finalData.id_value,
    "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"], // Explicitly add ROCrate type
    name: finalData.name,
    description: finalData.description,
    version: finalData.version,
    datePublished: finalData.release_date,
    license: finalData.license_value
      ? { "@id": finalData.license_value }
      : undefined, // License often an object with @id
    keywords: keywordsArray,
    author: authorsArray,
    principalInvestigator: finalData.principal_investigator
      ? { "@type": "Person", name: finalData.principal_investigator }
      : undefined,
    contactPoint: finalData.contact_email
      ? { "@type": "ContactPoint", email: finalData.contact_email } // Removed contactType as it's not standard schema.org
      : undefined,
    publisher: finalData.publisher
      ? { "@type": "Organization", name: finalData.publisher } // Assuming organization for publisher
      : undefined,
    identifier: finalData.doi ? finalData.doi : undefined, // DOI is often identifier string
    organizationName: finalData.organizationName || undefined, // Keep direct mapping if schema supports
    projectName: finalData.projectName || undefined, // Keep direct mapping if schema supports
    associatedPublication: associatedPublicationArray, // Array of strings/IDs
    conditionsOfAccess: finalData.conditionsOfAccess || undefined,
    copyrightNotice: finalData.copyrightNotice || undefined,
    // copyrightHolder: finalData.copyrightNotice ? { name: finalData.copyrightNotice } : undefined, // Alternative mapping if preferred
    citation: finalData.citation || undefined,
    funder: finalData.funder
      ? { "@type": "Organization", name: finalData.funder } // Assuming organization for funder
      : undefined,
    usageInfo: finalData.usageInfo || undefined,
    contentSize: finalData.content_size || undefined,
    confidentialityLevel: finalData.confidentiality_level || undefined,
    ethicalReview: finalData.ethicalReview || undefined,
    additionalProperty:
      combinedAdditionalProperties.length > 0
        ? combinedAdditionalProperties
        : undefined,
    hasPart: hasPartEntities.map((entity) => ({ "@id": entity["@id"] })), // Link entities via @id
    // Merge custom properties
    ...customProps,
  };

  // Clean up undefined values from the root node
  Object.keys(releaseRootNode).forEach(
    (key) => releaseRootNode[key] === undefined && delete releaseRootNode[key],
  );

  // Construct the final @graph - root node + all hasPart entities
  const graph = [
    {
      "@id": "ro-crate-metadata.json",
      "@type": "CreativeWork",
      conformsTo: { "@id": "https://w3id.org/ro/crate/1.2-DRAFT" }, // Or newer version
      about: { "@id": releaseRootNode["@id"] },
      // Add author, dateModified/Published for metadata file itself if desired
    },
    releaseRootNode,
    ...hasPartEntities, // Add all entities from the hasPartEntities state
  ];

  // Construct the full RO-Crate JSON-LD object
  const roCrateJson = {
    "@context": [
      "https://w3id.org/ro/crate/1.2-DRAFT/context",
      { "@vocab": "http://schema.org/" }, // Include schema.org vocab explicitly
      // Add other contexts if necessary for custom properties (e.g., {"myNs": "http://example.com/mynamespace#"})
    ],
    "@graph": graph,
  };

  return roCrateJson;
};

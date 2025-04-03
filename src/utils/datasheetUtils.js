// src/utils/datasheetUtils.js

const findRootNode = (graph) => {
  let root = graph.find(
    (item) =>
      item["@id"]?.endsWith("ro-crate-metadata.json") && item["about"]?.["@id"]
  )?.about;

  if (root && root["@id"]) {
    const rootId = root["@id"];
    const fullRootNode = graph.find(
      (item) =>
        item["@id"] === rootId &&
        (item["@type"]?.includes("Dataset") ||
          item["@type"]?.includes("https://w3id.org/EVI#ROCrate"))
    );
    if (fullRootNode) return fullRootNode;
  }

  // Fallback strategies
  let potentialRoot = graph.find(
    (item) =>
      item["@type"]?.includes("Dataset") &&
      item["@type"]?.includes("https://w3id.org/EVI#ROCrate")
  );
  if (potentialRoot) return potentialRoot;

  potentialRoot = graph.find(
    (item) => item["@type"] === "Dataset" && item["@id"] === "./"
  );
  if (potentialRoot) return potentialRoot;

  // Last resort: find the first Dataset that isn't the metadata descriptor
  potentialRoot = graph.find(
    (item) =>
      item["@type"]?.includes("Dataset") &&
      !item["@id"]?.endsWith("ro-crate-metadata.json")
  );
  if (potentialRoot) return potentialRoot;

  // Very last resort, often index 1 after the context
  return graph.length > 1 ? graph[1] : graph.length > 0 ? graph[0] : {};
};

const getPropertyValue = (rootNode, propertyName, graph) => {
  if (!rootNode) return "";

  if (rootNode[propertyName]) {
    // Handle simple properties and potentially linked entities
    const value = rootNode[propertyName];
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      // Attempt to join simple arrays, or extract names from linked entities
      return value
        .map((item) => {
          if (typeof item === "string") return item;
          if (
            typeof item === "object" &&
            item !== null &&
            item["@id"] &&
            graph
          ) {
            const linkedNode = graph.find(
              (node) => node["@id"] === item["@id"]
            );
            return linkedNode?.name || item["@id"];
          }
          if (typeof item === "object" && item !== null && item["name"])
            return item["name"];
          return JSON.stringify(item); // Fallback for complex items
        })
        .join(", ");
    }
    if (typeof value === "object" && value !== null && value["@id"] && graph) {
      const linkedNode = graph.find((node) => node["@id"] === value["@id"]);
      return linkedNode?.name || value["@id"];
    }
    if (typeof value === "object" && value !== null && value["name"])
      return value["name"];

    return JSON.stringify(value); // Fallback for objects without name/@id
  }

  // Check additionalProperty
  const additionalProperties = rootNode.additionalProperty || [];
  const prop = additionalProperties.find(
    (p) => p.name === propertyName || p.propertyID === propertyName
  );
  return prop?.value || "";
};

const formatSize = (sizeInBytes) => {
  if (!sizeInBytes || isNaN(sizeInBytes)) return "N/A";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let i = 0;
  let size = parseFloat(sizeInBytes);
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
};

const parseSizeString = (sizeString) => {
  if (!sizeString || typeof sizeString !== "string") return null;
  const match = sizeString.match(/([\d.]+)\s*([KMGTPE]?B)/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const power = units.indexOf(unit);

  if (power === -1) return null;

  return value * Math.pow(1024, power);
};

export const processRootCrate = (metadata) => {
  const graph = metadata["@graph"];
  const root = findRootNode(graph);

  if (!root) {
    console.error("Could not find root node in crate.");
    return { overview: {}, useCases: {}, distribution: {} };
  }

  const overview = {
    title: getPropertyValue(root, "name", graph) || "Untitled RO-Crate",
    id_value: root["@id"] || "",
    doi: getPropertyValue(root, "identifier", graph) || "",
    release_date: getPropertyValue(root, "datePublished", graph) || "",
    content_size: getPropertyValue(root, "contentSize", graph) || "", // Keep original string if present
    description: getPropertyValue(root, "description", graph) || "",
    authors: getPropertyValue(root, "author", graph) || "",
    publisher: getPropertyValue(root, "publisher", graph) || "",
    principal_investigator:
      getPropertyValue(root, "principalInvestigator", graph) || "",
    contact_email: getPropertyValue(root, "contactEmail", graph) || "",
    license_value: getPropertyValue(root, "license", graph) || "",
    confidentiality_level:
      getPropertyValue(root, "confidentialityLevel", graph) || "",
    keywords: getPropertyValue(root, "keywords", graph) || "",
    citation: getPropertyValue(root, "citation", graph) || "",
    human_subject: getPropertyValue(root, "Human Subject", graph) || "",
    funding: getPropertyValue(root, "funder", graph) || "",
    completeness: getPropertyValue(root, "Completeness", graph) || "",
    related_publications: Array.isArray(root.associatedPublication)
      ? root.associatedPublication
      : root.associatedPublication
      ? [root.associatedPublication]
      : [],
    version: getPropertyValue(root, "version", graph) || "",
  };

  // Attempt to format size if it looks like bytes, otherwise keep original
  const sizeBytes = parseSizeString(overview.content_size);
  if (sizeBytes !== null) {
    overview.formatted_size = formatSize(sizeBytes);
  } else {
    overview.formatted_size = overview.content_size || "N/A"; // Use original string or N/A
  }

  const useCases = {
    intended_uses: getPropertyValue(root, "Intended Use", graph) || "",
    limitations: getPropertyValue(root, "Limitations", graph) || "",
    prohibited_uses: getPropertyValue(root, "Prohibited Uses", graph) || "",
    maintenance_plan: getPropertyValue(root, "Maintenance Plan", graph) || "",
  };

  const distribution = {
    publisher: getPropertyValue(root, "publisher", graph) || "",
    host: getPropertyValue(root, "distributionHost", graph) || "", // Assuming 'distributionHost' exists
    license_value: getPropertyValue(root, "license", graph) || "",
    doi: getPropertyValue(root, "identifier", graph) || "",
    release_date: getPropertyValue(root, "datePublished", graph) || "",
    version: getPropertyValue(root, "version", graph) || "",
  };

  return { overview, useCases, distribution };
};

export const findSubCrateRefs = (metadata) => {
  const graph = metadata["@graph"];
  const root = findRootNode(graph);
  const rootId = root ? root["@id"] : null;

  const refs = [];

  // Look in root's hasPart
  if (root && root.hasPart) {
    const parts = Array.isArray(root.hasPart) ? root.hasPart : [root.hasPart];
    parts.forEach((partRef) => {
      if (partRef && partRef["@id"]) {
        const linkedNode = graph.find((node) => node["@id"] === partRef["@id"]);
        if (
          linkedNode &&
          linkedNode["ro-crate-metadata"] &&
          (linkedNode["@type"]?.includes("Dataset") ||
            linkedNode["@type"]?.includes("https://w3id.org/EVI#ROCrate"))
        ) {
          refs.push({
            id: linkedNode["@id"],
            name: linkedNode.name || linkedNode["@id"],
            metadataPath: linkedNode["ro-crate-metadata"],
          });
        }
      }
    });
  }

  // Fallback: Find any Dataset/ROCrate nodes with 'ro-crate-metadata' that aren't the root
  graph.forEach((node) => {
    if (
      node &&
      node["@id"] !== rootId &&
      node["ro-crate-metadata"] &&
      (node["@type"]?.includes("Dataset") ||
        node["@type"]?.includes("https://w3id.org/EVI#ROCrate"))
    ) {
      // Avoid duplicates found via hasPart
      if (!refs.some((ref) => ref.id === node["@id"])) {
        refs.push({
          id: node["@id"],
          name: node.name || node["@id"],
          metadataPath: node["ro-crate-metadata"],
        });
      }
    }
  });

  return refs;
};

const categorizeItems = (graph, rootId) => {
  const items = {
    files: [],
    software: [],
    instruments: [],
    samples: [],
    experiments: [],
    computations: [],
    schemas: [],
    other: [],
  };
  const typeMapping = {
    Dataset: "files",
    "https://w3id.org/EVI#Dataset": "files",
    File: "files", // Include File type
    SoftwareSourceCode: "software",
    SoftwareApplication: "software", // Include SoftwareApplication
    "https://w3id.org/EVI#Software": "software",
    Instrument: "instruments",
    "https://w3id.org/EVI#Instrument": "instruments",
    Sample: "samples",
    "https://w3id.org/EVI#Sample": "samples",
    Experiment: "experiments",
    "https://w3id.org/EVI#Experiment": "experiments",
    Computation: "computations",
    "https://w3id.org/EVI#Computation": "computations",
    Schema: "schemas", // Assuming simple 'Schema' type might be used
    "http://schema.org/CreativeWork": "schemas", // More specific schema type
    "https://w3id.org/EVI#Schema": "schemas",
  };

  graph.forEach((item) => {
    if (
      !item ||
      item["@id"] === rootId ||
      item["@id"]?.endsWith("ro-crate-metadata.json") ||
      item["ro-crate-metadata"]
    ) {
      return; // Skip root, metadata descriptor, and subcrate pointers
    }

    const types = Array.isArray(item["@type"])
      ? item["@type"]
      : [item["@type"]];
    let categorized = false;

    for (const type of types) {
      const category = typeMapping[type];
      if (category) {
        items[category].push(item);
        categorized = true;
        break; // Categorize based on the first recognized type
      }
    }
    // Check additionalType as a fallback
    if (!categorized && item.additionalType) {
      const additionalTypes = Array.isArray(item.additionalType)
        ? item.additionalType
        : [item.additionalType];
      for (const addType of additionalTypes) {
        const category = typeMapping[addType];
        if (category) {
          items[category].push(item);
          categorized = true;
          break;
        }
      }
    }

    if (!categorized && item["@type"]) {
      // Only add to 'other' if it has a type
      items.other.push(item);
    }
  });

  return items;
};

const getFormatsSummary = (itemList) => {
  const counts = {};
  itemList.forEach((item) => {
    const format = item.format || item.encodingFormat || "unknown"; // Fallback check
    counts[format] = (counts[format] || 0) + 1;
  });
  return counts;
};

const getAccessSummary = (itemList) => {
  const counts = { Available: 0, Embargoed: 0, "No link": 0 };
  itemList.forEach((item) => {
    const url = item.contentUrl || item.url || ""; // Check both contentUrl and url
    if (url === "Embargoed") {
      counts.Embargoed++;
    } else if (url) {
      counts.Available++;
    } else {
      counts["No link"]++;
    }
  });
  // Filter out categories with zero count
  return Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .reduce((obj, [key, count]) => {
      obj[key] = count;
      return obj;
    }, {});
};

const extractSimpleId = (id) => {
  if (!id) return "unknown";
  try {
    // Basic URL parsing
    const url = new URL(id);
    return url.pathname.split("/").pop() || url.hostname;
  } catch (e) {
    // Handle ARKs or other non-URL IDs
    return id.split("/").pop() || id;
  }
};

const getDatasetFormat = (datasetId, graph, allSubGraphs = {}) => {
  // Check current graph
  let found = graph.find((item) => item["@id"] === datasetId);
  if (found && (found.format || found.encodingFormat)) {
    return found.format || found.encodingFormat;
  }

  // Check subgraphs (if provided)
  for (const subGraph of Object.values(allSubGraphs)) {
    found = subGraph.find((item) => item["@id"] === datasetId);
    if (found && (found.format || found.encodingFormat)) {
      return found.format || found.encodingFormat;
    }
  }
  return "unknown";
};

const extractComputationPatterns = (
  computations,
  graph,
  rootNodeName = "Current Crate"
) => {
  const patterns = {};
  const externalDatasets = [];

  computations.forEach((comp) => {
    const inputRefs = Array.isArray(comp.usedDataset)
      ? comp.usedDataset
      : comp.usedDataset
      ? [comp.usedDataset]
      : [];
    const outputRefs = Array.isArray(comp.generated)
      ? comp.generated
      : comp.generated
      ? [comp.generated]
      : [];

    const inputFormats = new Set();
    const outputFormats = new Set();

    inputRefs.forEach((ref) => {
      const id = ref["@id"] || (typeof ref === "string" ? ref : null);
      if (!id) return;

      const format = getDatasetFormat(id, graph); // Only check current graph for now
      const node = graph.find((item) => item["@id"] === id);
      const nodeName = node?.name || extractSimpleId(id); // Simple name extraction

      if (format !== "unknown") {
        // Check if node exists in *this* graph. If not, it's external.
        const nodeExistsLocally = graph.some((item) => item["@id"] === id);
        if (nodeExistsLocally) {
          inputFormats.add(format);
        } else {
          // Crude check - assume external if not in graph
          // A better approach would need info about other crates
          const externalSource = "Other Crate"; // Placeholder
          inputFormats.add(`${externalSource} (${format})`);
          externalDatasets.push({
            id: id,
            format: format,
            subcrate: externalSource, // Placeholder name
            name: nodeName,
          });
        }
      }
      // else: Could try fetching external or rely on pre-fetched subcrate data if available
    });

    outputRefs.forEach((ref) => {
      const id = ref["@id"] || (typeof ref === "string" ? ref : null);
      if (!id) return;
      const format = getDatasetFormat(id, graph);
      if (format !== "unknown") {
        outputFormats.add(format);
      }
    });

    if (inputFormats.size > 0 && outputFormats.size > 0) {
      const inputStr = Array.from(inputFormats).sort().join(", ");
      const outputStr = Array.from(outputFormats).sort().join(", ");
      const pattern = `${inputStr} → ${outputStr}`;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
  });

  const externalDatasetsSummary = externalDatasets.reduce((acc, ds) => {
    const key = `${ds.subcrate}, ${ds.format}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    computation_patterns: Object.keys(patterns),
    input_datasets: externalDatasetsSummary,
    input_datasets_count: externalDatasets.length,
  };
};

const extractExperimentPatterns = (experiments, graph) => {
  const patterns = {};
  experiments.forEach((exp) => {
    const inputType = "Sample"; // Assuming experiments primarily use samples
    const outputRefs = Array.isArray(exp.generated)
      ? exp.generated
      : exp.generated
      ? [exp.generated]
      : [];
    const outputFormats = new Set();

    outputRefs.forEach((ref) => {
      const id = ref["@id"] || (typeof ref === "string" ? ref : null);
      if (!id) return;
      const format = getDatasetFormat(id, graph);
      if (format !== "unknown") {
        outputFormats.add(format);
      }
    });

    if (outputFormats.size > 0) {
      const outputStr = Array.from(outputFormats).sort().join(", ");
      const pattern = `${inputType} → ${outputStr}`;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
  });
  return Object.keys(patterns);
};

const extractSampleDetails = (samples, graph) => {
  const cellLines = {};
  const species = {};

  samples.forEach((sample) => {
    let foundCellLineName = null;
    let foundSpeciesName = null;

    // 1. Check linked CellLine entity
    const cellLineRef = sample.cellLineReference || sample.cell_line; // Check common properties
    if (
      cellLineRef &&
      (cellLineRef["@id"] || typeof cellLineRef === "string")
    ) {
      const cellLineId = cellLineRef["@id"] || cellLineRef;
      const cellLineNode = graph.find((n) => n["@id"] === cellLineId);
      if (cellLineNode) {
        foundCellLineName = cellLineNode.name || null;
        // Check organism within cell line
        const organismRef = cellLineNode.organism;
        if (
          organismRef &&
          (organismRef["@id"] || typeof organismRef === "string")
        ) {
          const organismId = organismRef["@id"] || organismRef;
          const organismNode = graph.find((n) => n["@id"] === organismId);
          if (organismNode && organismNode.name) {
            foundSpeciesName = organismNode.name;
          }
        } else if (typeof organismRef === "object" && organismRef?.name) {
          foundSpeciesName = organismRef.name;
        }
      }
    }

    // 2. Check additionalProperty as fallback
    const additionalProps = sample.additionalProperty || [];
    additionalProps.forEach((prop) => {
      if (
        !foundCellLineName &&
        (prop.propertyID === "cell-line" || prop.name === "cell-line") &&
        prop.value &&
        prop.value.toLowerCase() !== "n. a."
      ) {
        foundCellLineName = prop.value;
      }
      if (
        !foundSpeciesName &&
        (prop.propertyID === "scientific_name" || prop.name === "Species") &&
        prop.value &&
        prop.value.toLowerCase() !== "n. a."
      ) {
        foundSpeciesName = prop.value;
      }
    });

    // 3. Direct properties on Sample as last resort
    if (
      !foundCellLineName &&
      sample.name &&
      sample.name.includes("Cell Line")
    ) {
      // Very heuristic
      foundCellLineName = sample.name;
    }
    if (!foundSpeciesName && sample.organism?.name) {
      foundSpeciesName = sample.organism.name;
    }

    if (foundCellLineName) {
      cellLines[foundCellLineName] = (cellLines[foundCellLineName] || 0) + 1;
    }
    if (foundSpeciesName) {
      species[foundSpeciesName] = (species[foundSpeciesName] || 0) + 1;
    } else {
      // Only count 'Unknown' if no species could be found at all for this sample
      if (!foundSpeciesName) {
        species["Unknown"] = (species["Unknown"] || 0) + 1;
      }
    }
  });

  // Remove 'Unknown' if other species were found
  if (Object.keys(species).length > 1 && species["Unknown"]) {
    delete species["Unknown"];
  }

  return { cell_lines: cellLines, species };
};

const extractExperimentTypes = (experiments) => {
  const types = {};
  experiments.forEach((exp) => {
    const type = exp.experimentType || exp.additionalType || "Unknown"; // Check multiple fields
    types[type] = (types[type] || 0) + 1;
  });
  return types;
};

export const processSubCrateSummary = (subMetadata, metadataPath) => {
  const graph = subMetadata["@graph"];
  const root = findRootNode(graph);

  if (!root) {
    console.warn(`Could not find root node in sub-crate: ${metadataPath}`);
    return {
      id: metadataPath,
      name: "Processing Error",
      description: "Could not find root node.",
      // Add default empty fields
      authors: "",
      keywords: [],
      date: "",
      size: "N/A",
      doi: "",
      contact: "",
      license: "",
      confidentiality: "",
      files_count: 0,
      software_count: 0,
      instruments_count: 0,
      samples_count: 0,
      experiments_count: 0,
      computations_count: 0,
      schemas_count: 0,
      other_count: 0,
      file_formats: {},
      file_access: {},
      software_formats: {},
      software_access: {},
      computation_patterns: [],
      input_datasets: {},
      input_datasets_count: 0,
      inputs_count: 0,
      experiment_patterns: [],
      cell_lines: {},
      species: {},
      experiment_types: {},
      related_publications: [],
    };
  }

  const {
    files,
    software,
    instruments,
    samples,
    experiments,
    computations,
    schemas,
    other,
  } = categorizeItems(graph, root["@id"]);

  const { cell_lines, species } = extractSampleDetails(samples, graph);
  const experiment_types = extractExperimentTypes(experiments);
  const computationInfo = extractComputationPatterns(
    computations,
    graph,
    root.name || "Sub-Crate"
  );
  const experimentPatterns = extractExperimentPatterns(experiments, graph);

  // Size: Use value from metadata if present, otherwise calculate (calculation needs server/Node.js usually)
  let sizeStr = root.contentSize || "N/A";
  const sizeBytes = parseSizeString(sizeStr);
  if (sizeBytes !== null) {
    sizeStr = formatSize(sizeBytes);
  } else if (sizeStr === "N/A") {
    // Placeholder: In a browser, we can't easily calculate directory size.
    // This would ideally be pre-calculated or done server-side.
    sizeStr = "Calculation Unavailable";
  } // else keep the original string

  return {
    id: root["@id"] || metadataPath,
    name: getPropertyValue(root, "name", graph) || "Unnamed Sub-Crate",
    description: getPropertyValue(root, "description", graph) || "",
    authors: getPropertyValue(root, "author", graph) || "",
    keywords: getPropertyValue(root, "keywords", graph) || [],
    metadataPath: metadataPath,
    date: getPropertyValue(root, "datePublished", graph) || "",
    size: sizeStr,
    doi: getPropertyValue(root, "identifier", graph) || "",
    contact: getPropertyValue(root, "contactEmail", graph) || "",
    license: getPropertyValue(root, "license", graph) || "",
    confidentiality:
      getPropertyValue(root, "confidentialityLevel", graph) || "",

    files_count: files.length,
    software_count: software.length,
    instruments_count: instruments.length,
    samples_count: samples.length,
    experiments_count: experiments.length,
    computations_count: computations.length,
    schemas_count: schemas.length,
    other_count: other.length,

    file_formats: getFormatsSummary(files),
    file_access: getAccessSummary(files),
    software_formats: getFormatsSummary(software),
    software_access: getAccessSummary(software),

    computation_patterns: computationInfo.computation_patterns,
    input_datasets: computationInfo.input_datasets,
    input_datasets_count: computationInfo.input_datasets_count,
    inputs_count: samples.length + computationInfo.input_datasets_count,

    experiment_patterns: experimentPatterns,
    cell_lines: cell_lines,
    species: species,
    experiment_types: experiment_types,

    related_publications: Array.isArray(root.associatedPublication)
      ? root.associatedPublication
      : root.associatedPublication
      ? [root.associatedPublication]
      : [],
  };
};

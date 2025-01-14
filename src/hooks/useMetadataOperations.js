import axios from "axios";
import jsonld from "jsonld";
import N3 from "n3";
import convertToRdfXml from "../pages/helper";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const buildEvidenceGraph = (data) => {
  // Helper function to clean URLs from IDs
  const cleanId = (id) => {
    if (typeof id === 'string' && id.includes('ark:')) {
      return id.substring(id.indexOf('ark:'));
    }
    return id;
  };

  // Helper function to clean array of IDs
  const cleanIdArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(id => cleanId(id));
  };

  // Create maps for quick lookups
  const idToElement = new Map();
  const usedAsInput = new Set();
  
  // First pass: Create ID to element map with cleaned IDs
  data['@graph'].forEach(element => {
    const elementId = cleanId(element['@id']);
    if (elementId) {
      // Clean any IDs in the element
      const cleanedElement = {...element, '@id': elementId};
      
      // Clean various ID references
      if (cleanedElement.generated) {
        cleanedElement.generated = cleanIdArray(cleanedElement.generated);
      }
      if (cleanedElement.usedDataset) {
        cleanedElement.usedDataset = cleanIdArray(cleanedElement.usedDataset);
      }
      if (cleanedElement.usedSoftware) {
        cleanedElement.usedSoftware = cleanIdArray(cleanedElement.usedSoftware);
      }
      if (cleanedElement.generatedBy) {
        cleanedElement.generatedBy = cleanIdArray(cleanedElement.generatedBy);
      }
      
      idToElement.set(elementId, cleanedElement);
    }
  });

  // Second pass: Process relationships and track used datasets
  data['@graph'].forEach(element => {
    const elementId = cleanId(element['@id']);
    const cleanedElement = idToElement.get(elementId);
    
    // Track datasets used as input
    if (cleanedElement?.usedDataset) {
      cleanedElement.usedDataset.forEach(id => {
        usedAsInput.add(cleanId(id));
      });
    }

    // Set up generatedBy relationships based on computation's generated field
    if (cleanedElement?.['@type']?.includes('Computation') && cleanedElement.generated) {
      cleanedElement.generated.forEach(datasetId => {
        const dataset = idToElement.get(datasetId);
        if (dataset) {
          if (!dataset.generatedBy) {
            dataset.generatedBy = [];
          }
          if (!dataset.generatedBy.includes(elementId)) {
            dataset.generatedBy.push(elementId);
          }
        }
      });
    }
  });

  // Find output datasets (those not used as input)
  const outputDatasets = Array.from(idToElement.values()).filter(element => {
    const elementId = cleanId(element['@id']);
    return element['@type']?.includes('Dataset') && !usedAsInput.has(elementId);
  });

  // Helper function to recursively build the provenance tree
  const buildProvTree = (element, visited = new Set()) => {
    if (!element || visited.has(element['@id'])) {
      return null;
    }

    visited.add(element['@id']);
    const tree = { ...element };

    // Handle generatedBy relationship
    if (element.generatedBy) {
      const computationIds = Array.isArray(element.generatedBy) 
        ? element.generatedBy 
        : [element.generatedBy];
      
      tree.generatedBy = computationIds
        .map(id => {
          const computation = idToElement.get(id);
          if (!computation) return null;
          
          const computationTree = { ...computation };
          
          // Handle usedDataset for computations
          if (computation.usedDataset) {
            computationTree.usedDataset = computation.usedDataset
              .map(datasetId => {
                const dataset = idToElement.get(datasetId);
                if (!dataset) {
                  // For missing datasets, create a placeholder with basic info
                  return {
                    '@id': datasetId,
                    '@type': 'Dataset',
                    'name': `Dataset ${datasetId}`
                  };
                }
                return buildProvTree(dataset, new Set(visited));
              })
              .filter(Boolean);
          }
          
          // Handle usedSoftware for computations
          if (computation.usedSoftware) {
            computationTree.usedSoftware = computation.usedSoftware
              .map(softwareId => {
                const software = idToElement.get(softwareId);
                return software ? buildProvTree(software, new Set(visited)) : null;
              })
              .filter(Boolean);
          }
          
          return computationTree;
        })
        .filter(Boolean);
    }

    return tree;
  };

  // Build evidence graphs for each output dataset
  const evidenceGraphs = outputDatasets.map(dataset => {
    const graphId = `${cleanId(dataset['@id'])}`;
    return {
      '@id': graphId,
      '@type': 'EVI:EvidenceGraph',
      'name': dataset.name || graphId,
      'description': dataset.description || `Evidence graph for ${dataset.name || graphId}`,
      ...buildProvTree(dataset)
    };
  });

  return evidenceGraphs;
};

export const useMetadataOperations = ({
  setMetadata,
  setEvidenceGraph,
  setEvidenceGraphLoading,
  setTurtle,
  setRdfXml,
}) => {
  const typeMap = {
    rocrate: "ROCrate",
    dataset: "Dataset",
    software: "Software",
    schema: "Schema",
    computation: "Computation",
  };

  const mapType = (rawType) => typeMap[rawType.toLowerCase()] || rawType;

  const extractRawType = (type) => {
    if (typeof type === "string") {
      if (type.startsWith("http://") || type.startsWith("https://")) {
        const parts = type.split(/[/#]/);
        return parts[parts.length - 1].toLowerCase();
      }
      if (type.includes(":")) {
        return type.split(":").pop().toLowerCase();
      }
      return type.toLowerCase();
    }
    if (Array.isArray(type) && type.length > 0) {
      return extractRawType(type[0]);
    }
    return null;
  };

  const filterNonProv = (data, keysToKeep) => {
    if (typeof data !== "object" || data === null) return data;
    if (Array.isArray(data))
      return data.map((item) => filterNonProv(item, keysToKeep));
    return Object.fromEntries(
      Object.entries(data)
        .filter(([k]) => keysToKeep.includes(k))
        .map(([k, v]) => [k, filterNonProv(v, keysToKeep)])
    );
  };

  const generateRdfFormats = async (metadataData) => {
    try {
      const nquads = await jsonld.toRDF(metadataData, {
        format: "application/n-quads",
      });
      const parser = new N3.Parser();
      const writer = new N3.Writer({ format: "text/turtle" });

      parser.parse(nquads, (error, quad, prefixes) => {
        if (error) console.error("Error parsing N-Quads:", error);
        if (quad) writer.addQuad(quad);
        else {
          writer.end((error, result) => {
            if (error) console.error("Error generating Turtle:", error);
            else setTurtle(result);
          });
        }
      });

      const rdfXml = await convertToRdfXml(nquads);
      setRdfXml(rdfXml);
    } catch (error) {
      console.error("Error converting RDF:", error);
    }
  };

  const fetchEvidenceGraph = async (metadataData, headers) => {
    try {
      const keysToKeep = [
        "@id",
        "name",
        "description",
        "@type",
        "generatedBy",
        "isPartOf",
        "@graph",
        "usedByComputation",
        "usedSoftware",
        "usedDataset",
        "evidence",
      ];
      let evidenceGraphData;

      if (metadataData.hasEvidenceGraph) {
        const evidenceGraphResponse = await axios.get(
          `${API_URL}/${metadataData.hasEvidenceGraph}`,
          { headers }
        );
        evidenceGraphData = filterNonProv(
          evidenceGraphResponse.data,
          keysToKeep
        );
      } else {
        // Generate evidence graph if it doesn't exist
        const generatedGraphs = buildEvidenceGraph(metadataData);
        if (generatedGraphs && generatedGraphs.length > 0) {
          evidenceGraphData = generatedGraphs[0];  // Use the first generated graph
          // Add generated evidence graph back to metadata
          metadataData.hasEvidenceGraph = evidenceGraphData['@id'];
          setMetadata(metadataData);
        } else {
          // Fallback to filtered metadata if no evidence graphs generated
          evidenceGraphData = filterNonProv(metadataData, keysToKeep);
        }
      }

      setEvidenceGraph(evidenceGraphData);
    } catch (error) {
      console.error("Error fetching evidence graph:", error);
      setEvidenceGraph(filterNonProv(metadataData, keysToKeep));
    } finally {
      setEvidenceGraphLoading(false);
    }
  };

  const fetchMetadata = async (currentArk, currentType, headers) => {
    try {
      const metadataResponse = await axios.get(`${API_URL}/${currentArk}`, {
        headers,
      });
      let metadataData = metadataResponse.data;

      if (!metadataData || typeof metadataData !== "object") {
        throw new Error("Invalid metadata format");
      }

      if (
        currentType.toLowerCase() === "dataset" ||
        currentType.toLowerCase() === "rocrate"
      ) {
        metadataData.download =
          currentType.toLowerCase() === "rocrate"
            ? `${API_URL}/rocrate/download/${currentArk}`
            : `${API_URL}/dataset/download/${currentArk}`;
      }

      setMetadata(metadataData);
      await generateRdfFormats(metadataData);
      await fetchEvidenceGraph(metadataData, headers);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      throw error;
    }
  };

  return {
    fetchMetadata,
    mapType,
    extractRawType,
  };
};
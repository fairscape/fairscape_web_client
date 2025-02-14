import axios from "axios";
import jsonld from "jsonld";
import N3 from "n3";
import convertToRdfXml from "../pages/helper";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

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

      // Helper to estimate node count
      const countNodes = (obj) => {
        if (typeof obj !== "object" || obj === null) return 0;
        if (Array.isArray(obj))
          return obj.reduce((sum, item) => sum + countNodes(item), 0);
        return (
          1 + Object.values(obj).reduce((sum, val) => sum + countNodes(val), 0)
        );
      };

      // Recursive filtering function with node and depth limits
      const filterNonProv = (data, keysToKeep, options = {}) => {
        const { nodeLimit = 50, depthLimit = 10, currentDepth = 0 } = options;
        if (currentDepth > depthLimit) return null;
        if (typeof data !== "object" || data === null || nodeLimit <= 0)
          return data;

        let remainingNodes = nodeLimit;
        const processValue = (value) => {
          if (remainingNodes <= 0) return null;
          const result = filterNonProv(value, keysToKeep, {
            nodeLimit: remainingNodes,
            depthLimit,
            currentDepth: currentDepth + 1,
          });
          remainingNodes -= countNodes(result);
          return result;
        };

        if (Array.isArray(data)) {
          return data
            .slice(0, Math.min(data.length, 5))
            .map(processValue)
            .filter(Boolean);
        }

        const filtered = {};
        for (const [key, value] of Object.entries(data)) {
          if (remainingNodes <= 0) break;
          if (keysToKeep.includes(key)) {
            if (key === "@graph") {
              // Special handling for @graph - preserve structure but limit entries
              filtered[key] = value
                .slice(0, 15) // Keep first 15 graph entries
                .map(processValue)
                .filter(Boolean);
              remainingNodes -= filtered[key].length;
            } else {
              filtered[key] = processValue(value);
            }
          }
        }
        return filtered;
      };

      // Function to trim metadata aggressively
      const trimMetadata = (data) => {
        const trimmed = { ...data };
        // Remove large non-provenance properties
        delete trimmed.hasPart;
        delete trimmed.distribution;
        delete trimmed.keywords;

        // Keep first 15 @graph entries and limit their depth
        if (trimmed["@graph"] && Array.isArray(trimmed["@graph"])) {
          trimmed["@graph"] = trimmed["@graph"].slice(0, 15).map((item) => ({
            "@id": item["@id"],
            "@type": item["@type"],
            name: item.name,
            description: item.description,
            generatedBy: item.generatedBy,
            usedByComputation: item.usedByComputation,
          }));
        }

        return trimmed;
      };

      let evidenceGraphData;
      if (metadataData.hasEvidenceGraph) {
        console.log("Route: Using hasEvidenceGraph");
        const graphUrl =
          typeof metadataData.hasEvidenceGraph === "string"
            ? metadataData.hasEvidenceGraph
            : metadataData.hasEvidenceGraph["@id"];

        console.log("Fetching from:", graphUrl);
        const evidenceGraphResponse = await axios.get(
          `${API_URL}/${graphUrl}`,
          {
            headers,
          }
        );
        const graphData = evidenceGraphResponse.data["@graph"]
          ? evidenceGraphResponse.data["@graph"]
          : evidenceGraphResponse.data;

        // Apply filtering with limits
        evidenceGraphData = filterNonProv(trimMetadata(graphData), keysToKeep, {
          nodeLimit: 100,
          depthLimit: 10,
        });
        console.log("Evidence graph data after processing:", evidenceGraphData);
      } else {
        console.log("Route: Using direct metadata");
        evidenceGraphData = filterNonProv(
          trimMetadata(metadataData),
          keysToKeep,
          {
            nodeLimit: 100,
            depthLimit: 10,
          }
        );
        console.log("Evidence graph data after processing:", evidenceGraphData);
      }

      setEvidenceGraph(evidenceGraphData);
    } catch (error) {
      console.error("Error fetching evidence graph:", error);
      console.log("Route: Error fallback");
      const fallbackData = filterNonProv(
        trimMetadata(metadataData),
        keysToKeep,
        {
          nodeLimit: 100,
          depthLimit: 10,
        }
      );
      console.log("Fallback evidence graph data:", fallbackData);
      setEvidenceGraph(fallbackData);
    } finally {
      setEvidenceGraphLoading(false);
    }
  };

  const fetchMetadata = async (currentArk, currentType, headers) => {
    try {
      currentArk = currentArk.endsWith("/")
        ? currentArk.slice(0, -1)
        : currentArk;
      const metadataResponse = await axios.get(`${API_URL}/${currentArk}`, {
        headers,
      });
      let metadataData = metadataResponse.data;

      if (!metadataData || typeof metadataData !== "object") {
        throw new Error("Invalid metadata format");
      }

      // If there's a nested metadata object, spread its properties to the top level
      if (metadataData.metadata && typeof metadataData.metadata === "object") {
        metadataData = {
          ...metadataData,
          ...metadataData.metadata,
          metadata: undefined,
        };
      }

      if (
        currentType.toLowerCase() === "dataset" ||
        currentType.toLowerCase() === "rocrate"
      ) {
        if (metadataData.distribution) {
          metadataData.download =
            currentType.toLowerCase() === "rocrate"
              ? `${API_URL}/rocrate/download/${currentArk}`
              : `${API_URL}/dataset/download/${currentArk}`;
        } else {
          try {
            metadataData.download = metadataData.contentUrl;
          } catch (error) {
            console.error("Error fetching metadata:", error);
            metadataData.download = null;
          }
        }

        // Check if it's a ROCrate with empty @graph
        if (
          currentType.toLowerCase() === "rocrate" &&
          (!metadataData["@graph"] || metadataData["@graph"].length <= 2)
        ) {
          const graphResponse = await axios.get(
            `${API_URL}/rocrate/${currentArk}`,
            {
              headers,
            }
          );
          if (graphResponse.data?.metadata?.["@graph"]) {
            metadataData["@graph"] = [
              ...(metadataData["@graph"] || []).slice(0, 2),
              ...graphResponse.data.metadata["@graph"].slice(2),
            ];
          }
        }
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

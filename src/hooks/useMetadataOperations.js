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

      const trimMetadata = (data) => {
        console.log("Before trimming:", {
          hasHasPart: !!data.hasPart,
          graphLength: data["@graph"]?.length || 0,
          keys: Object.keys(data),
        });

        const trimmed = { ...data };
        delete trimmed.hasPart;
        if (
          trimmed["@graph"] &&
          Array.isArray(trimmed["@graph"]) &&
          trimmed["@graph"].length > 10
        ) {
          trimmed["@graph"] = trimmed["@graph"].slice(0, 10);
        }

        console.log("After trimming:", {
          hasHasPart: !!trimmed.hasPart,
          graphLength: trimmed["@graph"]?.length || 0,
          keys: Object.keys(trimmed),
        });

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
          { headers }
        );
        const graphData = evidenceGraphResponse.data["@graph"]
          ? evidenceGraphResponse.data["@graph"]
          : evidenceGraphResponse.data;

        evidenceGraphData = filterNonProv(trimMetadata(graphData), keysToKeep);
        console.log("Evidence graph data after processing:", evidenceGraphData);
      } else {
        console.log("Route: Using direct metadata");
        evidenceGraphData = filterNonProv(
          trimMetadata(metadataData),
          keysToKeep
        );
        console.log("Evidence graph data after processing:", evidenceGraphData);
      }

      setEvidenceGraph(evidenceGraphData);
    } catch (error) {
      console.error("Error fetching evidence graph:", error);
      console.log("Route: Error fallback");
      const fallbackData = filterNonProv(
        trimMetadata(metadataData),
        keysToKeep
      );
      console.log("Fallback evidence graph data:", fallbackData);
      setEvidenceGraph(fallbackData);
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

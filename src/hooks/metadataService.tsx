import axios from "axios";
import { Metadata, RawGraphData } from "../types";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

export interface MetadataResult {
  metadata: Metadata | null;
  evidenceGraph: RawGraphData | null;
  type: string;
  error: string | null;
  hasEvidenceGraph: boolean;
}

export const metadataService = () => {
  // Function to fetch evidence graph
  const fetchEvidenceGraph = async (graphId: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const evidenceResponse = await axios.get(`${API_URL}/${graphId}`, {
        headers,
      });
      return evidenceResponse.data;
    } catch (error) {
      console.error("Error fetching evidence graph:", error);
      return null;
    }
  };

  // Function to initiate evidence graph build
  const initiateEvidenceGraphBuild = async (arkId: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await axios.post(
        `${API_URL}/evidencegraph/build/${arkId}`,
        {},
        { headers }
      );

      // Wait for 0.5 seconds
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if metadata now has evidence graph
      const metadataResponse = await axios.get(`${API_URL}/${arkId}`, {
        headers,
      });
      const updatedMetadata =
        metadataResponse.data.metadata || metadataResponse.data;

      if (updatedMetadata.hasEvidenceGraph) {
        const graphId =
          typeof updatedMetadata.hasEvidenceGraph === "string"
            ? updatedMetadata.hasEvidenceGraph
            : updatedMetadata.hasEvidenceGraph["@id"];

        const graph = await fetchEvidenceGraph(graphId);

        return {
          metadata: updatedMetadata,
          evidenceGraph: graph,
          hasEvidenceGraph: true,
        };
      }

      return {
        metadata: updatedMetadata,
        evidenceGraph: null,
        hasEvidenceGraph: false,
      };
    } catch (error) {
      console.error("Error initiating evidence graph build:", error);
      return {
        metadata: null,
        evidenceGraph: null,
        hasEvidenceGraph: false,
      };
    }
  };

  const fetchMetadata = async (arkId: string): Promise<MetadataResult> => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // Main metadata request
      const response = await axios.get(`${API_URL}/${arkId}`, { headers });

      // Extract metadata from response
      let metadata = response.data.metadata || response.data;

      // Determine the content type
      let type = "unknown";
      if (metadata["@type"]) {
        const typeValue = Array.isArray(metadata["@type"])
          ? metadata["@type"][1]
          : metadata["@type"];

        if (typeof typeValue === "string") {
          // Extract the last part after # or /
          const typeParts = typeValue.split(/[/#]/);
          type = typeParts[typeParts.length - 1].toLowerCase();
        }
      }
      console.log("Metadata type:", type);
      // For RO-Crate, make an additional request
      if (type === "rocrate") {
        try {
          const rocrateResponse = await axios.get(
            `${API_URL}/rocrate/${arkId}`,
            { headers }
          );
          if (rocrateResponse.data.metadata) {
            metadata = rocrateResponse.data.metadata;
          }
        } catch (err) {
          console.log("RO-Crate endpoint not available, trying alternatives");
        }
      }

      // Check for evidence graph
      let evidenceGraph = null;
      let hasEvidenceGraph = false;

      if (metadata.hasEvidenceGraph) {
        hasEvidenceGraph = true;
        const graphId =
          typeof metadata.hasEvidenceGraph === "string"
            ? metadata.hasEvidenceGraph
            : metadata.hasEvidenceGraph["@id"];

        evidenceGraph = await fetchEvidenceGraph(graphId);
      } else if (type !== "release" && type !== "rocrate" && token) {
        // Try to generate evidence graph for non-release/rocrate types
        const result = await initiateEvidenceGraphBuild(arkId);
        if (result.hasEvidenceGraph) {
          metadata = result.metadata || metadata;
          evidenceGraph = result.evidenceGraph;
          hasEvidenceGraph = true;
        }
      }

      return {
        metadata,
        evidenceGraph,
        type,
        error: null,
        hasEvidenceGraph,
      };
    } catch (err: any) {
      console.error("Error fetching metadata:", err);
      return {
        metadata: null,
        evidenceGraph: null,
        type: "unknown",
        error: err.message || "Failed to fetch metadata",
        hasEvidenceGraph: false,
      };
    }
  };

  const fetchLocalData = async (
    dataFile: string = "release.json"
  ): Promise<MetadataResult> => {
    try {
      // Load local JSON data file
      const response = await axios.get<Metadata>(`/data/${dataFile}`);
      const metadata = response.data;

      // Try to load evidence graph
      let evidenceGraph: RawGraphData | null = null;
      let hasEvidenceGraph = false;

      try {
        const graphResponse = await axios.get<RawGraphData>(
          "/data/evidence-graph.json"
        );
        evidenceGraph = graphResponse.data;
        hasEvidenceGraph = true;
      } catch (err) {
        console.log("Local evidence graph not available");
      }

      // Determine type
      let type = "unknown";
      if (metadata["@type"]) {
        const typeValue = Array.isArray(metadata["@type"])
          ? metadata["@type"][0]
          : metadata["@type"];

        if (typeof typeValue === "string") {
          const typeParts = typeValue.split(/[/#]/);
          type = typeParts[typeParts.length - 1].toLowerCase();
        }
      }

      return {
        metadata,
        evidenceGraph,
        type,
        error: null,
        hasEvidenceGraph,
      };
    } catch (err: any) {
      console.error("Error fetching local data:", err);
      return {
        metadata: null,
        evidenceGraph: null,
        type: "unknown",
        error: err.message || "Failed to fetch local data",
        hasEvidenceGraph: false,
      };
    }
  };

  return {
    fetchMetadata,
    fetchLocalData,
  };
};

export default metadataService;

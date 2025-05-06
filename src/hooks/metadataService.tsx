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

      await new Promise((resolve) => setTimeout(resolve, 500));

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
      const cleanArkId = arkId.replace(/^\/|\/$/g, "");
      const url = `${API_URL}/${cleanArkId}`;
      console.log("Requesting URL:", url);
      const response = await axios.get(url, {
        headers,
        timeout: 10000,
        maxRedirects: 5,
        withCredentials: true,
      });

      let metadata = response.data.metadata || response.data;

      let type = "unknown";
      if (metadata && (metadata as any)["@type"]) {
        const typeValue = Array.isArray((metadata as any)["@type"])
          ? (metadata as any)["@type"][1] // Assuming the second type might be more specific
          : (metadata as any)["@type"];

        if (typeof typeValue === "string") {
          const typeParts = typeValue.split(/[/#]/);
          type = typeParts[typeParts.length - 1].toLowerCase();
        }
      }
      console.log("Initial metadata type:", type);

      if (type === "rocrate") {
        try {
          const rocrateResponse = await axios.get(
            `${API_URL}/rocrate/${cleanArkId}`,
            {
              headers,
              timeout: 10000,
              maxRedirects: 5,
              withCredentials: true,
            }
          );
          const rocrateResponseData = rocrateResponse.data;

          if (rocrateResponseData && rocrateResponseData.metadata) {
            const fetchedRocrateMetadata = rocrateResponseData.metadata;
            metadata = fetchedRocrateMetadata; // Update the main metadata object with the full RO-Crate content

            // Now, analyze the fetched RO-Crate metadata to refine the type
            if (
              fetchedRocrateMetadata &&
              Array.isArray((fetchedRocrateMetadata as any)["@graph"])
            ) {
              const graphElements = (fetchedRocrateMetadata as any)["@graph"];
              let rocrateDatasetCount = 0;

              for (const element of graphElements) {
                if (
                  element &&
                  typeof element === "object" &&
                  (element as any)["@type"]
                ) {
                  const elementTypes = Array.isArray((element as any)["@type"])
                    ? (element as any)["@type"]
                    : [(element as any)["@type"]];

                  const isDataset = elementTypes.some(
                    (t: any) =>
                      typeof t === "string" &&
                      (t.toLowerCase().endsWith("/dataset") ||
                        t.toLowerCase() === "dataset")
                  );
                  const isROCrate = elementTypes.some(
                    (t: any) =>
                      typeof t === "string" &&
                      (t === "https://w3id.org/EVI#ROCrate" ||
                        t.toLowerCase().endsWith("/rocrate"))
                  );

                  if (isDataset && isROCrate) {
                    rocrateDatasetCount++;
                  }
                }
              }

              console.log(
                "RO-Crate Dataset count in @graph:",
                rocrateDatasetCount
              );

              if (rocrateDatasetCount > 1) {
                type = "release"; // It's a release containing multiple RO-Crate datasets
              }
              // If count is 0 or 1, type remains 'rocrate' as initially determined.
            } else {
              console.log(
                "RO-Crate endpoint returned metadata but no @graph array."
              );
              // Metadata updated, type remains 'rocrate'
            }
          } else {
            console.log(
              "RO-Crate endpoint did not return expected metadata structure (no .metadata)."
            );
            // Keep original metadata and type ('rocrate')
          }
        } catch (err) {
          console.log(
            "RO-Crate endpoint not available or failed, keeping original metadata/type",
            err
          );
          // If the /rocrate call fails, keep the initial metadata and type ('rocrate')
        }
      }

      console.log("Final metadata type:", type);

      let evidenceGraph = null;
      let hasEvidenceGraph = false;

      if (metadata && (metadata as any).hasEvidenceGraph) {
        hasEvidenceGraph = true;
        const graphId =
          typeof (metadata as any).hasEvidenceGraph === "string"
            ? (metadata as any).hasEvidenceGraph
            : (metadata as any).hasEvidenceGraph["@id"];

        evidenceGraph = await fetchEvidenceGraph(graphId);
      } else if (type !== "release" && type !== "rocrate" && token) {
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
      const response = await axios.get<Metadata>(`/data/${dataFile}`);
      const metadata = response.data;

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

      let type = "unknown";
      if (metadata && (metadata as any)["@type"]) {
        const typeValue = Array.isArray((metadata as any)["@type"])
          ? (metadata as any)["@type"][0]
          : (metadata as any)["@type"];

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

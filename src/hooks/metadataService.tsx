// src/hooks/metadataService.ts
import axios from "axios";
import { Metadata, RawGraphData, RawGraphEntity } from "../types";

const API_URL =
  window.API_URL;

export interface InitialMetadataResult {
  metadata: Metadata | null;
  type: string;
  error: string | null;
  hasEvidenceGraph: boolean;
  evidenceGraphId: string | null; // ID of the evidence graph if it exists
}

export interface EvidenceGraphBuildResult {
  updatedMetadata: Metadata | null;
  hasEvidenceGraph: boolean;
  evidenceGraphId: string | null;
  error: string | null;
}

export const metadataService = () => {
  const getTokenHeaders = () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetches only the evidence graph data, given its ID
  const fetchEvidenceGraphDataById = async (
    graphId: string
  ): Promise<RawGraphData | null> => {
    console.log(
      `[metadataService - fetchEvidenceGraphDataById] Fetching evidence graph for ID: ${graphId}`
    );
    try {
      const evidenceResponse = await axios.get(
        `${API_URL}/${graphId.replace(/^\/|\/$/g, "")}`,
        {
          headers: getTokenHeaders(),
          timeout: 60000, // Longer timeout for potentially very large graphs
        }
      );
      console.log(
        `[metadataService - fetchEvidenceGraphDataById] Successfully fetched evidence graph for ID: ${graphId}`
      );
      return evidenceResponse.data as RawGraphData;
    } catch (error) {
      console.error(
        `[metadataService - fetchEvidenceGraphDataById] Error fetching evidence graph for ID ${graphId}:`,
        error
      );
      return null;
    }
  };

  // Initiates the build process and checks if the graph becomes available by re-fetching metadata
  const triggerEvidenceGraphBuild = async (
    arkId: string
  ): Promise<EvidenceGraphBuildResult> => {
    const cleanArkId = arkId.replace(/^\/|\/$/g, "");
    console.log(
      `[metadataService - triggerEvidenceGraphBuild] Initiating build for ARK ID: ${cleanArkId}`
    );
    try {
      const headers = getTokenHeaders();
      if (!headers["Authorization"]) {
        console.warn(
          "[metadataService - triggerEvidenceGraphBuild] No token, cannot initiate build."
        );
        return {
          updatedMetadata: null,
          hasEvidenceGraph: false,
          evidenceGraphId: null,
          error: "User not logged in",
        };
      }

      await axios.post(
        `${API_URL}/evidencegraph/build/${cleanArkId}`,
        {},
        { headers }
      );
      console.log(
        `[metadataService - triggerEvidenceGraphBuild] Build request sent for ${cleanArkId}. Waiting for potential completion (5s)...`
      );

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for backend

      // Re-fetch the primary metadata to check for hasEvidenceGraph
      const metadataResponse = await axios.get(`${API_URL}/${cleanArkId}`, {
        headers,
      });
      const updatedMetadataObject = (metadataResponse.data.metadata ||
        metadataResponse.data) as Metadata;

      if (
        updatedMetadataObject &&
        (updatedMetadataObject as any).hasEvidenceGraph
      ) {
        const graphIdValue = (updatedMetadataObject as any).hasEvidenceGraph;
        const finalGraphId =
          typeof graphIdValue === "string" ? graphIdValue : graphIdValue["@id"];
        console.log(
          `[metadataService - triggerEvidenceGraphBuild] Build successful or graph link found, evidence graph ID: ${finalGraphId}`
        );
        return {
          updatedMetadata: updatedMetadataObject,
          hasEvidenceGraph: true,
          evidenceGraphId: finalGraphId,
          error: null,
        };
      }
      console.log(
        `[metadataService - triggerEvidenceGraphBuild] Build initiated, but hasEvidenceGraph not found in updated metadata for ${cleanArkId}.`
      );
      return {
        updatedMetadata: updatedMetadataObject,
        hasEvidenceGraph: false,
        evidenceGraphId: null,
        error: null,
      };
    } catch (error: any) {
      console.error(
        `[metadataService - triggerEvidenceGraphBuild] Error during evidence graph build for ${cleanArkId}:`,
        error
      );
      return {
        updatedMetadata: null,
        hasEvidenceGraph: false,
        evidenceGraphId: null,
        error:
          error.message || "Failed to initiate or confirm evidence graph build",
      };
    }
  };

  // Fetches only the primary metadata and determines type and if an evidence graph *link* exists
  const fetchInitialMetadata = async (
    arkId: string
  ): Promise<InitialMetadataResult> => {
    const cleanArkId = arkId.replace(/^\/|\/$/g, "");
    const url = `${API_URL}/${cleanArkId}`;
    console.log(
      `[metadataService - fetchInitialMetadata] Requesting initial metadata: ${url}`
    );

    try {
      const response = await axios.get(url, {
        headers: getTokenHeaders(),
        timeout: 15000, // Standard timeout for primary metadata
        maxRedirects: 5,
        withCredentials: true,
      });

      let metadataObject = (response.data.metadata ||
        response.data) as Metadata;
      let determinedType = "unknown";

      if (metadataObject && (metadataObject as any)["@type"]) {
        const typeValue = Array.isArray((metadataObject as any)["@type"])
          ? (metadataObject as any)["@type"][1] ||
            (metadataObject as any)["@type"][0]
          : (metadataObject as any)["@type"];
        if (typeof typeValue === "string") {
          const typeParts = typeValue.split(/[/#]/);
          determinedType = typeParts[typeParts.length - 1].toLowerCase();
        }
      }
      console.log(
        `[metadataService - fetchInitialMetadata] Initial metadata type for ${cleanArkId}: ${determinedType}`
      );

      if (determinedType === "rocrate") {
        try {
          console.log(
            `[metadataService - fetchInitialMetadata] Type is rocrate, attempting to fetch full rocrate data for ${cleanArkId}`
          );
          const rocrateResponse = await axios.get(
            `${API_URL}/rocrate/${cleanArkId}`,
            {
              headers: getTokenHeaders(),
              timeout: 15000,
              maxRedirects: 5,
              withCredentials: true,
            }
          );
          const rocrateData = rocrateResponse.data;
          if (rocrateData && rocrateData.metadata) {
            metadataObject = rocrateData.metadata as Metadata; // Update with full RO-Crate
            console.log(
              `[metadataService - fetchInitialMetadata] Successfully fetched full RO-Crate for ${cleanArkId}.`
            );
            if (Array.isArray((metadataObject as any)["@graph"])) {
              const graphElements = (metadataObject as any)[
                "@graph"
              ] as RawGraphEntity[];
              let rocrateDatasetCount = 0;
              for (const element of graphElements) {
                if (
                  element &&
                  typeof element === "object" &&
                  element["@type"]
                ) {
                  const elTypes = Array.isArray(element["@type"])
                    ? element["@type"]
                    : [element["@type"]];
                  const isDs = elTypes.some(
                    (t: string) =>
                      typeof t === "string" &&
                      (t.toLowerCase().endsWith("/dataset") ||
                        t.toLowerCase() === "dataset")
                  );
                  const isRc = elTypes.some(
                    (t: string) =>
                      typeof t === "string" &&
                      (t === "https://w3id.org/EVI#ROCrate" ||
                        t.toLowerCase().endsWith("/rocrate"))
                  );
                  if (isDs && isRc) rocrateDatasetCount++;
                }
              }
              if (rocrateDatasetCount > 1) {
                determinedType = "release";
                console.log(
                  `[metadataService - fetchInitialMetadata] RO-Crate for ${cleanArkId} determined to be a 'release' (count: ${rocrateDatasetCount}).`
                );
              } else {
                console.log(
                  `[metadataService - fetchInitialMetadata] RO-Crate for ${cleanArkId} is a single RO-Crate dataset (count: ${rocrateDatasetCount}).`
                );
              }
            }
          } else {
            console.warn(
              `[metadataService - fetchInitialMetadata] RO-Crate endpoint for ${cleanArkId} did not return .metadata field.`
            );
          }
        } catch (err) {
          console.warn(
            `[metadataService - fetchInitialMetadata] RO-Crate specific fetch for ${cleanArkId} failed. Keeping type as 'rocrate'.`,
            err
          );
        }
      }
      console.log(
        `[metadataService - fetchInitialMetadata] Final metadata type for ${cleanArkId}: ${determinedType}`
      );

      let currentHasEvidenceGraph = false;
      let currentEvidenceGraphId: string | null = null;

      if (metadataObject && (metadataObject as any).hasEvidenceGraph) {
        currentHasEvidenceGraph = true;
        const graphIdValue = (metadataObject as any).hasEvidenceGraph;
        currentEvidenceGraphId =
          typeof graphIdValue === "string" ? graphIdValue : graphIdValue["@id"];
        console.log(
          `[metadataService - fetchInitialMetadata] Evidence graph link found for ${cleanArkId}: ${currentEvidenceGraphId}`
        );
      } else {
        console.log(
          `[metadataService - fetchInitialMetadata] No direct evidence graph link in metadata for ${cleanArkId}.`
        );
      }

      return {
        metadata: metadataObject,
        type: determinedType,
        error: null,
        hasEvidenceGraph: currentHasEvidenceGraph,
        evidenceGraphId: currentEvidenceGraphId,
      };
    } catch (err: any) {
      console.error(
        `[metadataService - fetchInitialMetadata] Error fetching initial metadata for ${cleanArkId}:`,
        err
      );
      return {
        metadata: null,
        type: "unknown",
        error: err.message || "Failed to fetch initial metadata",
        hasEvidenceGraph: false,
        evidenceGraphId: null,
      };
    }
  };

  const fetchLocalData = async (
    dataFile: string = "release.json"
  ): Promise<
    InitialMetadataResult & { evidenceGraphData: RawGraphData | null }
  > => {
    // This function is for local dev, can load graph data directly if needed
    try {
      const response = await axios.get<Metadata>(`/data/${dataFile}`);
      const metadata = response.data;
      let localEvidenceGraphData: RawGraphData | null = null;
      let localHasEvidenceGraph = false;
      let localEvidenceGraphId: string | null = null;

      try {
        const graphResponse = await axios.get<RawGraphData>(
          "/data/evidence-graph.json"
        );
        localEvidenceGraphData = graphResponse.data;
        localHasEvidenceGraph = true;
        if (localEvidenceGraphData && localEvidenceGraphData["@id"]) {
          localEvidenceGraphId = localEvidenceGraphData["@id"];
        }
      } catch (err) {
        console.log("Local evidence graph not available for local data");
      }
      // Determine type (simplified for local)
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
        type,
        error: null,
        hasEvidenceGraph: localHasEvidenceGraph,
        evidenceGraphId: localEvidenceGraphId,
        evidenceGraphData: localEvidenceGraphData,
      };
    } catch (err: any) {
      return {
        metadata: null,
        type: "unknown",
        error: err.message,
        hasEvidenceGraph: false,
        evidenceGraphId: null,
        evidenceGraphData: null,
      };
    }
  };

  return {
    fetchInitialMetadata,
    fetchEvidenceGraphDataById,
    triggerEvidenceGraphBuild,
    fetchLocalData,
  };
};

export default metadataService;

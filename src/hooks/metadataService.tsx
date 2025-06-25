// src/hooks/metadataService.ts
import axios from "axios";
import { Metadata, RawGraphData, RawGraphEntity } from "../types";

const API_URL = window.API_URL;

export interface InitialMetadataResult {
  metadata: Metadata | null;
  type: string;
  error: string | null;
  hasEvidenceGraph: boolean;
  evidenceGraphId: string | null;
}

export interface EvidenceGraphBuildInitiateResult {
  taskId: string | null;
  statusEndpoint: string | null;
  error: string | null;
  message?: string;
}

export interface EvidenceGraphTaskStatus {
  guid: string;
  task_type: string;
  owner_email: string;
  naan: string;
  postfix: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILURE";
  time_created: string;
  time_started?: string;
  time_finished?: string;
  result?: {
    evidence_graph_id?: string;
    [key: string]: any;
  };
  error?: {
    message?: string;
    details?: any;
    [key: string]: any;
  };
}

export interface PolledEvidenceGraphBuildResult {
  updatedMetadata: Metadata | null;
  hasEvidenceGraph: boolean;
  evidenceGraphId: string | null;
  error: string | null;
  finalTaskStatus?: EvidenceGraphTaskStatus;
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
          timeout: 60000,
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

  const initiateEvidenceGraphBuild = async (
    arkId: string
  ): Promise<EvidenceGraphBuildInitiateResult> => {
    const cleanArkId = arkId.replace(/^\/|\/$/g, "");
    console.log(
      `[metadataService - initiateEvidenceGraphBuild] Initiating build for ARK ID: ${cleanArkId}`
    );
    try {
      const headers = getTokenHeaders();
      if (!headers["Authorization"]) {
        console.warn(
          "[metadataService - initiateEvidenceGraphBuild] No token, cannot initiate build."
        );
        return {
          taskId: null,
          statusEndpoint: null,
          error: "User not logged in",
        };
      }

      const response = await axios.post(
        `${API_URL}/evidencegraph/build/${cleanArkId}`,
        {},
        { headers }
      );
      console.log(
        `[metadataService - initiateEvidenceGraphBuild] Build request sent for ${cleanArkId}. Task ID: ${response.data.task_id}`
      );
      return {
        taskId: response.data.task_id,
        statusEndpoint: response.data.status_endpoint,
        error: null,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error(
        `[metadataService - initiateEvidenceGraphBuild] Error initiating evidence graph build for ${cleanArkId}:`,
        error
      );
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to initiate evidence graph build";
      return {
        taskId: null,
        statusEndpoint: null,
        error: errorMessage,
      };
    }
  };

  const pollEvidenceGraphTaskStatus = async (
    taskId: string,
    arkIdToRefresh?: string,
    pollingInterval: number = 5000,
    maxAttempts: number = 24 // e.g., 2 minutes with 5s interval
  ): Promise<PolledEvidenceGraphBuildResult> => {
    console.log(
      `[metadataService - pollEvidenceGraphTaskStatus] Polling for task ID: ${taskId}`
    );
    let attempts = 0;

    const checkStatus = async (): Promise<PolledEvidenceGraphBuildResult> => {
      attempts++;
      try {
        const response = await axios.get<EvidenceGraphTaskStatus>(
          `${API_URL}/evidencegraph/build/status/${taskId}`,
          { headers: getTokenHeaders() }
        );
        const taskData = response.data;

        if (taskData.status === "SUCCESS") {
          console.log(
            `[metadataService - pollEvidenceGraphTaskStatus] Task ${taskId} succeeded. Evidence Graph ID: ${taskData.result?.evidence_graph_id}`
          );
          let refreshedMetadata: Metadata | null = null;
          if (arkIdToRefresh) {
            try {
              const metadataResponse = await axios.get(
                `${API_URL}/${arkIdToRefresh.replace(/^\/|\/$/g, "")}`,
                {
                  headers: getTokenHeaders(),
                }
              );
              refreshedMetadata = (metadataResponse.data.metadata ||
                metadataResponse.data) as Metadata;
            } catch (metaError) {
              console.warn(
                `[metadataService - pollEvidenceGraphTaskStatus] Failed to refresh primary metadata for ${arkIdToRefresh}`,
                metaError
              );
            }
          }
          return {
            updatedMetadata: refreshedMetadata,
            hasEvidenceGraph: true,
            evidenceGraphId: taskData.result?.evidence_graph_id || null,
            error: null,
            finalTaskStatus: taskData,
          };
        } else if (taskData.status === "FAILURE") {
          console.error(
            `[metadataService - pollEvidenceGraphTaskStatus] Task ${taskId} failed. Error: ${taskData.error?.message}`
          );
          return {
            updatedMetadata: null,
            hasEvidenceGraph: false,
            evidenceGraphId: null,
            error: taskData.error?.message || "Evidence graph build failed",
            finalTaskStatus: taskData,
          };
        } else if (
          taskData.status === "PENDING" ||
          taskData.status === "PROCESSING"
        ) {
          if (attempts >= maxAttempts) {
            console.warn(
              `[metadataService - pollEvidenceGraphTaskStatus] Task ${taskId} timed out after ${attempts} attempts.`
            );
            return {
              updatedMetadata: null,
              hasEvidenceGraph: false,
              evidenceGraphId: null,
              error:
                "Polling timed out, evidence graph build is still in progress or failed silently.",
              finalTaskStatus: taskData,
            };
          }
          console.log(
            `[metadataService - pollEvidenceGraphTaskStatus] Task ${taskId} status: ${taskData.status}. Attempt ${attempts}/${maxAttempts}. Waiting...`
          );
          await new Promise((resolve) => setTimeout(resolve, pollingInterval));
          return checkStatus();
        } else {
          console.error(
            `[metadataService - pollEvidenceGraphTaskStatus] Task ${taskId} has unknown status: ${taskData.status}`
          );
          return {
            updatedMetadata: null,
            hasEvidenceGraph: false,
            evidenceGraphId: null,
            error: `Unknown task status: ${taskData.status}`,
            finalTaskStatus: taskData,
          };
        }
      } catch (error: any) {
        console.error(
          `[metadataService - pollEvidenceGraphTaskStatus] Error polling status for task ${taskId}:`,
          error
        );
        if (attempts >= maxAttempts) {
          return {
            updatedMetadata: null,
            hasEvidenceGraph: false,
            evidenceGraphId: null,
            error: "Polling failed after maximum attempts.",
            finalTaskStatus: undefined,
          };
        }
        await new Promise((resolve) => setTimeout(resolve, pollingInterval));
        return checkStatus();
      }
    };
    return checkStatus();
  };

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
        timeout: 15000,
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
            metadataObject = rocrateData.metadata as Metadata;
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
    initiateEvidenceGraphBuild,
    pollEvidenceGraphTaskStatus,
    fetchLocalData,
  };
};

export default metadataService;

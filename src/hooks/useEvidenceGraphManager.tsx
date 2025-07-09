import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import metadataService, {
  EvidenceGraphBuildInitiateResult,
  PolledEvidenceGraphBuildResult,
} from "./metadataService";
import { RawGraphData, Metadata } from "../types";

export type GraphBuildStatus =
  | "IDLE"
  | "INITIATING"
  | "POLLING"
  | "SUCCESS"
  | "FAILED"
  | "TIMED_OUT";

interface UseEvidenceGraphManagerProps {
  arkId: string | null;
  initialHasLink: boolean;
  initialGraphId: string | null;
  initialMetadata: Metadata | null;
  isLoggedIn: boolean;
  itemType: string | null;
  extractSupportData: (graphData: RawGraphData | null) => any;
}

export const useEvidenceGraphManager = ({
  arkId,
  initialHasLink,
  initialGraphId,
  initialMetadata,
  isLoggedIn,
  itemType,
  extractSupportData,
}: UseEvidenceGraphManagerProps) => {
  const [hasEvidenceGraphLink, setHasEvidenceGraphLink] =
    useState(initialHasLink);
  const [currentEvidenceGraphId, setCurrentEvidenceGraphId] = useState<
    string | null
  >(initialGraphId);
  const [evidenceGraphData, setEvidenceGraphData] =
    useState<RawGraphData | null>(null);
  const [supportData, setSupportData] = useState<any>(null);
  const [graphBuildStatus, setGraphBuildStatus] =
    useState<GraphBuildStatus>("IDLE");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [evidenceGraphError, setEvidenceGraphError] = useState<string | null>(
    null
  );
  const [updatedMetadata, setUpdatedMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const metadataServiceInstance = useMemo(() => metadataService(), []);
  const hasAttemptedBuild = useRef(false);

  const resetState = useCallback(() => {
    setEvidenceGraphData(null);
    setSupportData(null);
    setEvidenceGraphError(null);
    setCurrentTaskId(null);
    setGraphBuildStatus("IDLE");
    setIsLoading(false);
    hasAttemptedBuild.current = false;
  }, []);

  const fetchEvidenceGraphData = useCallback(
    async (graphId: string) => {
      if (!graphId) return;

      setIsLoading(true);
      setEvidenceGraphError(null);

      try {
        const graphData =
          await metadataServiceInstance.fetchEvidenceGraphDataById(graphId);
        if (graphData) {
          setEvidenceGraphData(graphData);
          const extracted = extractSupportData(graphData);
          setSupportData(extracted);
          setEvidenceGraphError(null);
          setHasEvidenceGraphLink(true);
          setCurrentEvidenceGraphId(graphId);
        } else {
          setEvidenceGraphError("Failed to fetch evidence graph data");
        }
      } catch (error: any) {
        setEvidenceGraphError(error.message || "Error fetching evidence graph");
      } finally {
        setIsLoading(false);
      }
    },
    [metadataServiceInstance, extractSupportData]
  );

  const initiateBuildProcess = useCallback(async () => {
    if (!arkId) return;

    const token = localStorage.getItem("token");
    const userIsLoggedIn = isLoggedIn || !!token;

    if (!userIsLoggedIn) return;

    if (itemType && ["release", "rocrate"].includes(itemType)) {
      setEvidenceGraphError(
        "Evidence graphs are not supported for this item type"
      );
      return;
    }

    if (hasAttemptedBuild.current) return;

    hasAttemptedBuild.current = true;
    setGraphBuildStatus("INITIATING");
    setEvidenceGraphError(null);
    setIsLoading(true);

    try {
      const buildResult: EvidenceGraphBuildInitiateResult =
        await metadataServiceInstance.initiateEvidenceGraphBuild(arkId);

      if (buildResult.error) {
        setEvidenceGraphError(buildResult.error);
        setGraphBuildStatus("FAILED");
        return;
      }

      if (buildResult.taskId && buildResult.statusEndpoint) {
        setCurrentTaskId(buildResult.taskId);
        setGraphBuildStatus("POLLING");

        const pollResult: PolledEvidenceGraphBuildResult =
          await metadataServiceInstance.pollEvidenceGraphTaskStatus(
            buildResult.taskId,
            arkId
          );

        if (pollResult.error) {
          setEvidenceGraphError(pollResult.error);
          setGraphBuildStatus(
            pollResult.error.includes("timed out") ? "TIMED_OUT" : "FAILED"
          );
        } else if (pollResult.hasEvidenceGraph && pollResult.evidenceGraphId) {
          setHasEvidenceGraphLink(true);
          setCurrentEvidenceGraphId(pollResult.evidenceGraphId);
          setGraphBuildStatus("SUCCESS");

          if (pollResult.updatedMetadata) {
            setUpdatedMetadata(pollResult.updatedMetadata);
          }

          await fetchEvidenceGraphData(pollResult.evidenceGraphId);
        } else {
          setEvidenceGraphError(
            "Build completed but no evidence graph was created"
          );
          setGraphBuildStatus("FAILED");
        }
      } else {
        setEvidenceGraphError("Failed to initiate build - no task ID received");
        setGraphBuildStatus("FAILED");
      }
    } catch (error: any) {
      setEvidenceGraphError(
        error.message || "Failed to initiate evidence graph build"
      );
      setGraphBuildStatus("FAILED");
    } finally {
      setIsLoading(false);
    }
  }, [
    arkId,
    isLoggedIn,
    itemType,
    metadataServiceInstance,
    fetchEvidenceGraphData,
  ]);

  useEffect(() => {
    if (!arkId || !itemType) {
      resetState();
      return;
    }

    if (initialHasLink && initialGraphId) {
      if (evidenceGraphData?.["@id"] !== initialGraphId) {
        fetchEvidenceGraphData(initialGraphId);
      }
      return;
    }

    const token = localStorage.getItem("token");
    const userIsLoggedIn = isLoggedIn || !!token;

    if (userIsLoggedIn && !["release", "rocrate"].includes(itemType)) {
      initiateBuildProcess();
    }
  }, [
    arkId,
    itemType,
    initialHasLink,
    initialGraphId,
    isLoggedIn,
    fetchEvidenceGraphData,
    initiateBuildProcess,
    resetState,
  ]);

  return {
    hasEvidenceGraphLink,
    currentEvidenceGraphId,
    evidenceGraphData,
    supportData,
    graphBuildStatus,
    currentTaskId,
    evidenceGraphError,
    updatedMetadata,
    isLoading,
  };
};

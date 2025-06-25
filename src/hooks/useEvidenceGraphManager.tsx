import { useState, useEffect, useMemo } from "react";
import metadataService, { EvidenceGraphTaskStatus } from "./metadataService";
import { RawGraphData, Metadata } from "../types";
import { SupportData } from "../components/EvidenceGraph/SupportingElementsComponent";
import { extractSupportData as defaultExtractSupportData } from "../pages/MetadataDisplayPage";

type GraphBuildStatusType =
  | "IDLE"
  | "INITIATING"
  | "POLLING"
  | "SUCCESS"
  | "FAILURE"
  | "TIMED_OUT";

interface UseEvidenceGraphManagerProps {
  arkId: string | null;
  initialHasLink: boolean;
  initialGraphId: string | null;
  initialMetadata: Metadata | null;
  isLoggedIn: boolean;
  itemType: string | null;
  extractSupportData?: (graphData: RawGraphData | null) => SupportData | null;
}

export const useEvidenceGraphManager = ({
  arkId,
  initialHasLink,
  initialGraphId,
  initialMetadata,
  isLoggedIn,
  itemType,
  extractSupportData = defaultExtractSupportData,
}: UseEvidenceGraphManagerProps) => {
  const [hasEvidenceGraphLink, setHasEvidenceGraphLink] =
    useState<boolean>(initialHasLink);
  const [currentEvidenceGraphId, setCurrentEvidenceGraphId] = useState<
    string | null
  >(initialGraphId);
  const [evidenceGraphData, setEvidenceGraphData] =
    useState<RawGraphData | null>(null);
  const [supportData, setSupportData] = useState<SupportData | null>(null);
  const [graphBuildStatus, setGraphBuildStatus] =
    useState<GraphBuildStatusType>("IDLE");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [evidenceGraphError, setEvidenceGraphError] = useState<string | null>(
    null
  );
  const [updatedMetadata, setUpdatedMetadata] = useState<Metadata | null>(
    initialMetadata
  );

  const metadataServiceInstance = useMemo(() => metadataService(), []);

  useEffect(() => {
    setHasEvidenceGraphLink(initialHasLink);
    setCurrentEvidenceGraphId(initialGraphId);
    setUpdatedMetadata(initialMetadata);
    setEvidenceGraphData(null);
    setSupportData(null);
    setGraphBuildStatus("IDLE");
    setCurrentTaskId(null);
    setEvidenceGraphError(null);
  }, [arkId, initialHasLink, initialGraphId, initialMetadata]);

  useEffect(() => {
    const manageGraph = async () => {
      if (!arkId) return;

      if (hasEvidenceGraphLink && currentEvidenceGraphId) {
        if (
          evidenceGraphData &&
          evidenceGraphData["@id"] === currentEvidenceGraphId
        )
          return;

        setGraphBuildStatus("POLLING"); // Or "FETCHING_EXISTING"
        setEvidenceGraphError(null);
        try {
          const graphDataResult =
            await metadataServiceInstance.fetchEvidenceGraphDataById(
              currentEvidenceGraphId
            );
          if (graphDataResult) {
            setEvidenceGraphData(graphDataResult);
            setSupportData(extractSupportData(graphDataResult));
            setGraphBuildStatus("SUCCESS");
          } else {
            throw new Error("Evidence graph data not found or fetch failed.");
          }
        } catch (err: any) {
          setEvidenceGraphError(
            err.message || "Failed to load evidence graph."
          );
          setGraphBuildStatus("FAILURE");
        }
        return;
      }

      const shouldAttemptBuild =
        isLoggedIn &&
        itemType &&
        !["release", "rocrate"].includes(itemType) &&
        !hasEvidenceGraphLink;

      if (shouldAttemptBuild && graphBuildStatus === "IDLE") {
        setGraphBuildStatus("INITIATING");
        setEvidenceGraphError(null);
        try {
          const initiationResult =
            await metadataServiceInstance.initiateEvidenceGraphBuild(arkId);

          if (initiationResult.error || !initiationResult.taskId) {
            throw new Error(
              initiationResult.error || "Failed to initiate build task."
            );
          }
          setCurrentTaskId(initiationResult.taskId);
          setGraphBuildStatus("POLLING");

          const pollResult =
            await metadataServiceInstance.pollEvidenceGraphTaskStatus(
              initiationResult.taskId,
              arkId
            );

          if (pollResult.finalTaskStatus?.status === "SUCCESS") {
            if (pollResult.updatedMetadata) {
              setUpdatedMetadata(pollResult.updatedMetadata);
            }
            setHasEvidenceGraphLink(true);
            const newGraphId =
              pollResult.finalTaskStatus.result?.evidence_graph_id || null;
            setCurrentEvidenceGraphId(newGraphId);
            if (newGraphId) {
              const graphDataResult =
                await metadataServiceInstance.fetchEvidenceGraphDataById(
                  newGraphId
                );
              if (graphDataResult) {
                setEvidenceGraphData(graphDataResult);
                setSupportData(extractSupportData(graphDataResult));
              } else {
                console.warn(
                  "Graph data not found immediately after successful build & fetch for",
                  newGraphId
                );
              }
            }
            setGraphBuildStatus("SUCCESS");
          } else {
            const taskErrorMsg =
              pollResult.finalTaskStatus?.error?.message ||
              pollResult.error ||
              "Polling failed or task error.";
            throw new Error(taskErrorMsg);
          }
        } catch (err: any) {
          setEvidenceGraphError(
            err.message || "Failed to build or retrieve evidence graph."
          );
          if (
            err.message?.toLowerCase().includes("timed out") ||
            err.message?.toLowerCase().includes("still in progress")
          ) {
            setGraphBuildStatus("TIMED_OUT");
          } else {
            setGraphBuildStatus("FAILURE");
          }
        }
      }
    };

    manageGraph();
  }, [
    arkId,
    hasEvidenceGraphLink,
    currentEvidenceGraphId,
    evidenceGraphData,
    isLoggedIn,
    itemType,
    metadataServiceInstance,
    graphBuildStatus, // Key dependency to re-trigger if status changes externally or needs retry
    extractSupportData,
  ]);

  return {
    hasEvidenceGraphLink,
    currentEvidenceGraphId,
    evidenceGraphData,
    supportData,
    graphBuildStatus,
    currentTaskId,
    evidenceGraphError,
    updatedMetadata, // The metadata potentially updated by the build process
    isLoading:
      graphBuildStatus === "INITIATING" ||
      graphBuildStatus === "POLLING" ||
      (graphBuildStatus === "SUCCESS" &&
        !evidenceGraphData &&
        !!currentEvidenceGraphId),
  };
};

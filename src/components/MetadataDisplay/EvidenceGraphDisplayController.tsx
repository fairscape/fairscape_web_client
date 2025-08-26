import React from "react";
import EvidenceGraphViewer from "../EvidenceGraph/EvidenceGraphViewer";
import LoadingSpinner from "../common/LoadingSpinner";
import Alert from "../common/Alert";
import { RawGraphData } from "../../types";
import { SupportData } from "../EvidenceGraph/SupportingElementsComponent";
import styled from "styled-components";

const CenteredMessageWithSpinner: React.FC<{ message: string }> = styled(
  ({ message, className }) => (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <LoadingSpinner />
      <p style={{ marginTop: "10px", color: "#666", textAlign: "center" }}>
        {message}
      </p>
    </div>
  )
)``;

interface EvidenceGraphDisplayControllerProps {
  isGraphManagerLoading: boolean;
  graphBuildStatus:
    | "IDLE"
    | "INITIATING"
    | "POLLING"
    | "SUCCESS"
    | "FAILURE"
    | "TIMED_OUT";
  currentTaskId: string | null;
  evidenceGraphData: RawGraphData | null;
  currentEvidenceGraphId: string | null;
  evidenceGraphError: string | null;
  supportData: SupportData | null;
  isLoggedIn: boolean;
  determinedType: string | null;
  hasEvidenceGraphLink: boolean;
}

const EvidenceGraphDisplayController: React.FC<
  EvidenceGraphDisplayControllerProps
> = ({
  isGraphManagerLoading,
  graphBuildStatus,
  currentTaskId,
  evidenceGraphData,
  currentEvidenceGraphId,
  evidenceGraphError,
  supportData,
  isLoggedIn,
  determinedType,
  hasEvidenceGraphLink,
}) => {
  if (isGraphManagerLoading) {
    let message = "Loading Evidence Graph data...";
    if (graphBuildStatus === "INITIATING") {
      message = "Initiating Evidence Graph build...";
    } else if (graphBuildStatus === "POLLING") {
      message = `Fetching Evidence Graph (Task: ${
        currentTaskId || "..."
      }). Please wait...`;
    } else if (
      graphBuildStatus === "SUCCESS" &&
      !evidenceGraphData &&
      currentEvidenceGraphId
    ) {
      message = "Evidence graph built. Loading data...";
    }
    return <CenteredMessageWithSpinner message={message} />;
  }

  if (graphBuildStatus === "FAILURE" && evidenceGraphError) {
    return (
      <Alert
        type="error"
        title="Evidence Graph Error"
        message={evidenceGraphError}
      />
    );
  }
  if (graphBuildStatus === "TIMED_OUT") {
    return (
      <Alert
        type="warning"
        title="Evidence Graph Build In Progress"
        message={
          evidenceGraphError ||
          "The evidence graph build is taking longer than expected. Please check back later or refresh."
        }
      />
    );
  }

  if (evidenceGraphData) {
    return (
      <EvidenceGraphViewer
        evidenceGraphData={evidenceGraphData}
        supportData={supportData}
      />
    );
  }

  const canAttemptBuild =
    isLoggedIn && determinedType && !["release"].includes(determinedType);

  if (graphBuildStatus === "IDLE") {
    if (!hasEvidenceGraphLink && canAttemptBuild) {
      return (
        <CenteredMessageWithSpinner message="Evidence graph will be prepared if you are logged in and this item type supports it." />
      );
    }
    if (!hasEvidenceGraphLink && !canAttemptBuild) {
      return (
        <Alert
          type="info"
          title="No Evidence Graph"
          message="No evidence graph is associated with this item, or it cannot be built for this item type or your login status."
        />
      );
    }
  }

  return (
    <Alert
      type="info"
      title="Evidence Graph Status"
      message="The evidence graph is either being prepared or is not available for this item."
    />
  );
};

export default EvidenceGraphDisplayController;

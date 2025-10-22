import React from "react";
import AIReadyScorePanel from "../../../AIReadyScore/AIReadyScorePanel";
import LoadingSpinner from "../../../common/LoadingSpinner";
import Alert from "../../../common/Alert";
import { useAIReadyScore } from "../../../AIReadyScore/hooks/useAIReadyScore";
import styled from "styled-components";

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
`;

const LoadingMessage = styled.p`
  margin-top: 16px;
  color: #666;
  font-size: 14px;
`;

interface AIReadyScoreViewProps {
  arkId: string;
}

export default function AIReadyScoreView({ arkId }: AIReadyScoreViewProps) {
  const { criteriaData, name, loading, error, inProgress, progressStatus } =
    useAIReadyScore(arkId);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingMessage>Loading AI readiness score…</LoadingMessage>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error Loading AI Readiness Score"
        message={error}
      />
    );
  }

  if (inProgress) {
    return (
      <>
        <Alert
          type="info"
          title="Scoring in progress"
          message={
            <>
              We've initiated AI-Ready scoring for this RO-Crate. Current
              status: <strong>{progressStatus || "PENDING"}</strong>. This page
              will auto-update once the score is available.
            </>
          }
        />
        <LoadingContainer style={{ marginTop: 16 }}>
          <LoadingSpinner />
          <LoadingMessage>Waiting for score generation…</LoadingMessage>
        </LoadingContainer>
      </>
    );
  }

  if (!criteriaData) {
    return (
      <Alert
        type="info"
        title="No AI Readiness Score"
        message="No AI readiness score data is available for this dataset yet."
      />
    );
  }

  return <AIReadyScorePanel criteriaData={criteriaData} datasetTitle={name} />;
}

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import AIReadyScorePanel from "../components/AIReadyScore/AIReadyScorePanel";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import { useAIReadyScore } from "../components/AIReadyScore/hooks/useAIReadyScore";
import {
  Container,
  Title,
  LoadingContainer,
  LoadingMessage,
} from "../components/AIReadyScore/AIReadyScore.styles";

export default function AIReadyScorePage() {
  const params = useParams<{ arkId?: string }>();
  const arkId =
    params?.arkId ??
    (window.location.pathname.includes("/ai-ready-score/")
      ? window.location.pathname.split("/ai-ready-score/")[1]
      : "");

  const { criteriaData, name, loading, error, inProgress, progressStatus } =
    useAIReadyScore(arkId);

  useEffect(() => {
    document.title = `AI Readiness Score - ${name || "Dataset"} - FAIRSCAPE`;
  }, [name]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingMessage>Loading AI readiness score…</LoadingMessage>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert
          type="error"
          title="Error Loading AI Readiness Score"
          message={error}
        />
      </Container>
    );
  }

  if (inProgress) {
    return (
      <Container>
        <Title>{name || arkId} — AI Readiness Assessment</Title>
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
      </Container>
    );
  }

  if (!criteriaData) {
    return (
      <Container>
        <Alert
          type="info"
          title="No AI Readiness Score"
          message="No AI readiness score data is available for this dataset yet."
        />
      </Container>
    );
  }

  return (
    <Container>
      <Title>{name} — AI Readiness Assessment</Title>
      <AIReadyScorePanel criteriaData={criteriaData} datasetTitle={name} />
    </Container>
  );
}

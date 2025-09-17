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

  const { criteriaData, name, loading, error } = useAIReadyScore(arkId);

  useEffect(() => {
    document.title = `AI Readiness Score - ${name || "Dataset"} - FAIRSCAPE`;
  }, [name]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingMessage>Loading AI readiness score...</LoadingMessage>
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

  if (!criteriaData) {
    return (
      <Container>
        <Alert
          type="info"
          title="No AI Readiness Score"
          message="No AI readiness score data available for this dataset."
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

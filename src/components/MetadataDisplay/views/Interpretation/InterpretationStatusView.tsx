import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  useInterpretationApi,
  InterpretationStatus,
} from "../../api/interpretationApi";

const POLL_INTERVAL = 5000;

function extractErrorMessage(err: unknown): string {
  if (!err) return "Interpretation failed";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.details === "string") return obj.details;
    try { return JSON.stringify(err); } catch { /* fall through */ }
  }
  return String(err);
}

interface InterpretationStatusViewProps {
  arkId: string;
  hasExisting: boolean;
  onSuccess: (annotatedEvidenceGraphId?: string) => void;
  onViewExisting: () => void;
}

export default function InterpretationStatusView({
  arkId,
  hasExisting,
  onSuccess,
  onViewExisting,
}: InterpretationStatusViewProps) {
  const api = useInterpretationApi();
  const [status, setStatus] = useState<InterpretationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"prompt" | "triggering" | "polling">(
    hasExisting ? "prompt" : "triggering"
  );
  const intervalRef = useRef<number | null>(null);
  // Prevent StrictMode double-mount from creating a second task + interval.
  const triggeredArkRef = useRef<string | null>(null);

  // Auto-trigger if no existing interpretation
  useEffect(() => {
    if (!hasExisting && triggeredArkRef.current !== arkId) {
      triggeredArkRef.current = arkId;
      triggerRun(true);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [arkId]);

  async function triggerRun(force: boolean) {
    setPhase("triggering");
    setError(null);
    try {
      const { task_id } = await api.triggerInterpretation(arkId, force);
      setPhase("polling");
      startPolling(task_id);
    } catch (e: any) {
      setError(e?.message || "Failed to start interpretation");
      setPhase("polling"); // show error state
    }
  }

  function startPolling(taskId: string) {
    // Always clear any prior interval — otherwise re-runs and StrictMode
    // double-mounts leave old intervals polling stale task_ids, which makes
    // the UI flicker between different tasks' states.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    poll(taskId);
    intervalRef.current = window.setInterval(() => poll(taskId), POLL_INTERVAL);
  }

  async function poll(taskId: string) {
    try {
      const s = await api.pollStatus(taskId);
      setStatus(s);

      if (s.status === "SUCCESS") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onSuccess(s.annotated_evidence_graph_id);
      } else if (s.status === "FAILURE") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setError(extractErrorMessage(s.error));
      }
    } catch (e: any) {
      // Don't stop polling on transient errors
      console.error("Poll error:", e);
    }
  }

  if (phase === "prompt") {
    return (
      <Container>
        <Title>Interpretation</Title>
        <PromptText>
          An annotated evidence graph already exists for this RO-Crate.
        </PromptText>
        <ButtonRow>
          <PromptButton onClick={onViewExisting}>
            View Existing
          </PromptButton>
          <PromptButton $primary onClick={() => triggerRun(true)}>
            Re-run Interpretation
          </PromptButton>
        </ButtonRow>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Interpretation</Title>
        <ErrorBox>{error}</ErrorBox>
      </Container>
    );
  }

  if (phase === "triggering") {
    return (
      <Container>
        <Title>Interpretation</Title>
        <StatusRow>
          <Spinner />
          <span>Starting interpretation...</span>
        </StatusRow>
      </Container>
    );
  }

  const completed = status?.completed_computations ?? 0;
  const total = status?.total_computations ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Container>
      <Title>Interpretation</Title>

      <StatusRow>
        <Spinner />
        <StatusText>
          <strong>Status:</strong> {status?.status ?? "PENDING"}
          {status?.current_step && (
            <span> &mdash; {status.current_step}</span>
          )}
        </StatusText>
      </StatusRow>

      {total > 0 && (
        <ProgressSection>
          <ProgressLabel>
            Computations: {completed} / {total} ({pct}%)
          </ProgressLabel>
          <ProgressBarTrack>
            <ProgressBarFill style={{ width: `${pct}%` }} />
          </ProgressBarTrack>
        </ProgressSection>
      )}

      {status?.computation_details && status.computation_details.length > 0 && (
        <ComputationList>
          {status.computation_details.map((comp) => (
            <ComputationRow key={comp.computation_id}>
              <ComputationIcon $status={comp.status}>
                {comp.status === "done" && "\u2713"}
                {comp.status === "error" && "\u2717"}
                {comp.status === "processing" && "\u2026"}
                {comp.status === "pending" && "\u25CB"}
              </ComputationIcon>
              <span>{comp.name || comp.computation_id}</span>
            </ComputationRow>
          ))}
        </ComputationList>
      )}
    </Container>
  );
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  padding: 30px;
`;

const Title = styled.h2`
  font-size: 20px;
  color: #005f73;
  margin-bottom: 24px;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #005f73;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  animation: ${spin} 1s linear infinite;
`;

const StatusText = styled.div`
  font-size: 15px;
  color: #212529;
`;

const ProgressSection = styled.div`
  margin-bottom: 24px;
`;

const ProgressLabel = styled.div`
  font-size: 14px;
  color: #495057;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: #005f73;
  border-radius: 6px;
  transition: width 0.4s ease;
`;

const ComputationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ComputationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #212529;
  padding: 6px 0;
`;

const ComputationIcon = styled.span<{
  $status: "done" | "error" | "processing" | "pending";
}>`
  width: 22px;
  text-align: center;
  font-weight: 700;
  flex-shrink: 0;
  color: ${({ $status }) =>
    $status === "done"
      ? "#28a745"
      : $status === "error"
      ? "#dc3545"
      : $status === "processing"
      ? "#005f73"
      : "#adb5bd"};
`;

const ErrorBox = styled.div`
  padding: 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-size: 14px;
`;

const PromptText = styled.p`
  font-size: 15px;
  color: #495057;
  margin-bottom: 20px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const PromptButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #005f73;
  background: ${({ $primary }) => ($primary ? "#005f73" : "white")};
  color: ${({ $primary }) => ($primary ? "white" : "#005f73")};

  &:hover {
    background: ${({ $primary }) => ($primary ? "#004050" : "#f8f9fa")};
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

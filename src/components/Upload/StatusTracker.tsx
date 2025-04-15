import React, { useState, useRef, useCallback, useEffect } from "react";
import styled from "styled-components";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5173";

interface UploadError {
  status: string;
  message: string;
}

interface StatusDetails {
  status: string;
  success: boolean;
  completed: boolean;
  error?: string;
  result?: string;
}

interface StatusTrackerProps {
  submissionUUID: string | null;
  uploadError: UploadError | null;
  isUploading: boolean;
}

const TrackerContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TrackerTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressBarContainer = styled.div`
  position: relative;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressBarFill = styled.div<{ failed: boolean }>`
  height: 100%;
  background-color: ${({ theme, failed }) =>
    failed ? theme.colors.error : theme.colors.success};
  transition: width 0.5s ease;
`;

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Step = styled.div<{ active: boolean }>`
  flex: 1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.textSecondary};
  border-bottom: 2px solid
    ${({ theme, active }) => (active ? theme.colors.primary : "transparent")};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  background-color: #fff0f0;
  border-radius: ${({ theme }) => theme.borderRadius};
  border-left: 4px solid ${({ theme }) => theme.colors.error};
`;

const StatusDetailsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const ResultLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StatusTracker: React.FC<StatusTrackerProps> = ({
  submissionUUID,
  uploadError,
  isUploading,
}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<StatusDetails | null>(null);
  const [success, setSuccess] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const isActive = useRef(false);

  const checkUploadStatus = useCallback(async () => {
    if (!submissionUUID || !isActive.current) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/rocrate/upload/status/${submissionUUID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (isActive.current) {
        setStatus(data.status);
        setDetails(data);
        setSuccess(data.success);
        setCompleted(data.completed);

        if (data.error) {
          setError(data.error);
          clearInterval(intervalRef.current as unknown as number);
          isActive.current = false;
        }

        if (data.completed || data.error) {
          clearInterval(intervalRef.current as unknown as number);
          isActive.current = false;
        }
      }
    } catch (error) {
      if (isActive.current) {
        setError(`Failed to check upload status: ${(error as Error).message}`);
        setStatus("Failed");
        setSuccess(false);
        setCompleted(true);
        clearInterval(intervalRef.current as unknown as number);
        isActive.current = false;
      }
    }
  }, [submissionUUID]);

  useEffect(() => {
    if (uploadError) {
      setStatus("Failed");
      setError(
        `Upload Failed: Status ${uploadError.status} - ${uploadError.message}`
      );
      setSuccess(false);
      setCompleted(true);
      isActive.current = false;
    } else if (isUploading && submissionUUID) {
      setStatus("In Queue");
      setError(null);
      setSuccess(false);
      setCompleted(false);
      isActive.current = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
      }

      checkUploadStatus();
      intervalRef.current = window.setInterval(
        checkUploadStatus,
        1000
      ) as unknown as number;
    } else {
      setStatus(null);
      setError(null);
      setSuccess(false);
      setCompleted(false);
      isActive.current = false;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
      }
      isActive.current = false;
    };
  }, [submissionUUID, uploadError, isUploading, checkUploadStatus]);

  const steps = ["In Queue", "Uploading Files", "Processing", "Complete"];
  let currentStep;
  let progress;

  switch (status) {
    case "In Queue":
      currentStep = 0;
      progress = 25;
      break;
    case "in progress":
      currentStep = 1;
      progress = 50;
      break;
    case "processing":
      currentStep = 2;
      progress = 75;
      break;
    case "finished":
    case "Finished":
      currentStep = success ? 3 : -1;
      progress = 100;
      break;
    case "Failed":
      currentStep = -1;
      progress = 100;
      break;
    default:
      currentStep = -1;
      progress = 0;
  }

  const isFailed =
    status === "Failed" || Boolean(error) || (completed && !success);

  if (!status) return null;

  return (
    <TrackerContainer>
      <TrackerTitle>Upload Progress</TrackerTitle>
      <ProgressBarContainer>
        <ProgressBarFill failed={isFailed} style={{ width: `${progress}%` }} />
      </ProgressBarContainer>
      <StepContainer>
        {steps.map((step, index) => (
          <Step key={index} active={index <= (currentStep ?? -1)}>
            {index + 1}. {step}
          </Step>
        ))}
      </StepContainer>

      {isFailed && <ErrorMessage>{error || "Upload failed"}</ErrorMessage>}

      {details && (
        <StatusDetailsContainer>
          <p>Status: {status}</p>
          <p>Success: {success ? "Yes" : "No"}</p>
          {details.result && (
            <p>
              View Result:{" "}
              <ResultLink
                href={`${BASE_URL}/${details.result}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </ResultLink>
            </p>
          )}
        </StatusDetailsContainer>
      )}
    </TrackerContainer>
  );
};

export default StatusTracker;

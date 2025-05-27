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
  status: string; // Expecting this from API, can be empty/null
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

      const data: StatusDetails = await response.json();
      // console.log("Upload status data:", data);

      if (isActive.current) {
        let determinedApiStatus: string | null = null;

        if (
          data.status &&
          typeof data.status === "string" &&
          data.status.trim() !== ""
        ) {
          determinedApiStatus = data.status;
        } else if (data.completed) {
          // If API status is missing/invalid but it's completed, infer from success.
          determinedApiStatus = data.success ? "Finished" : "Failed";
        }

        // Only update component status if we have a new, valid status from API or inference.
        // This prevents setting status to null if API temporarily returns no status for an ongoing job.
        if (determinedApiStatus) {
          setStatus(determinedApiStatus);
        }

        setDetails(data);
        setSuccess(data.success);
        setCompleted(data.completed);

        if (data.error) {
          setError(data.error);
          // If API reports an error, ensure status reflects failure, overriding any other status.
          setStatus("Failed");
          if (intervalRef.current)
            clearInterval(intervalRef.current as unknown as number);
          intervalRef.current = null;
          isActive.current = false;
        } else if (data.completed) {
          // Job is completed and no API-reported error
          if (intervalRef.current)
            clearInterval(intervalRef.current as unknown as number);
          intervalRef.current = null;
          isActive.current = false;
        }
      }
    } catch (err) {
      if (isActive.current) {
        setError(`Failed to check upload status: ${(err as Error).message}`);
        setStatus("Failed");
        setSuccess(false);
        setCompleted(true); // Mark as completed due to fetch error
        if (intervalRef.current)
          clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    } else if (isUploading && submissionUUID) {
      setStatus("In Queue");
      setError(null);
      setSuccess(false);
      setCompleted(false);
      isActive.current = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
      }
      checkUploadStatus(); // Initial check
      intervalRef.current = window.setInterval(
        checkUploadStatus,
        1000
      ) as unknown as number;
    } else {
      // Reset or initial state before any upload starts for this component instance
      setStatus(null);
      setError(null);
      setSuccess(false);
      setCompleted(false);
      isActive.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
      isActive.current = false;
    };
  }, [submissionUUID, uploadError, isUploading, checkUploadStatus]);

  const steps = ["In Queue", "Uploading Files", "Processing", "Complete"];
  let currentStepIndex; // Use index for clarity with steps array
  let progress;

  switch (status) {
    case "In Queue":
      currentStepIndex = 0;
      progress = 25;
      break;
    case "in progress": // Assuming API might send this
      currentStepIndex = 1;
      progress = 50;
      break;
    case "processing": // Assuming API might send this
      currentStepIndex = 2;
      progress = 75;
      break;
    case "finished": // Legacy or alternative success status from API
    case "Finished": // Status set by client-side logic on success
      currentStepIndex = success ? 3 : -1; // If "Finished" but not success, it's an error display
      progress = 100;
      break;
    case "Failed": // Status set by client-side logic on any failure
      currentStepIndex = -1; // Indicates failure, no active step
      progress = 100; // Progress bar full, but red
      break;
    default:
      currentStepIndex = -1; // Default for unknown or null status after initial render
      progress = status ? 0 : 0; // If status is truthy but not matched, show 0 progress.
      break;
  }

  const isFailed =
    status === "Failed" || Boolean(error) || (completed && !success);

  if (!status && !uploadError && !(isUploading && submissionUUID)) {
    // Only return null if there's truly nothing to show and not in an active upload attempt
    return null;
  }
  // If status is null but we are expecting one (isUploading && submissionUUID),
  // the component will render its shell, useEffect will set "In Queue"
  // The check `if (!status) return null;` below handles if it's truly not ready.
  if (!status) return null;

  return (
    <TrackerContainer>
      <TrackerTitle>Upload Progress</TrackerTitle>
      <ProgressBarContainer>
        <ProgressBarFill failed={isFailed} style={{ width: `${progress}%` }} />
      </ProgressBarContainer>
      <StepContainer>
        {steps.map((step, index) => (
          <Step
            key={index}
            active={
              index === currentStepIndex ||
              (currentStepIndex === 3 && index < 3 && success)
            }
          >
            {index + 1}. {step}
          </Step>
        ))}
      </StepContainer>

      {isFailed && (
        <ErrorMessage>
          {error || details?.error || "Upload failed"}
        </ErrorMessage>
      )}

      {details &&
        (completed || status === "Finished" || status === "Failed") && (
          <StatusDetailsContainer>
            <p>Final Status: {status}</p>
            <p>Success: {success ? "Yes" : "No"}</p>
            {details.result && success && (
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

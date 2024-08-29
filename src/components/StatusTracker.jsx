import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";

const StatusContainer = styled.div`
  margin-top: 20px;
  background-color: #3e3e3e;
  border-radius: 10px;
  padding: 20px;
  color: #ffffff;
`;

const StatusTitle = styled.h3`
  margin-bottom: 15px;
`;

const ProgressBarContainer = styled.div`
  background-color: #282828;
  border-radius: 25px;
  height: 50px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: ${(props) =>
    props.failed ? "#dc3545" : "linear-gradient(to right, #007bff, #28a745)"};
  width: ${(props) => props.progress}%;
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
`;

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${(props) => (props.active ? "#ffffff" : "#aaaaaa")};
  z-index: 2;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  font-weight: bold;
`;

const StatusDetails = styled.div`
  margin-top: 15px;
`;

const StatusTracker = ({ submissionUUID }) => {
  const [status, setStatus] = useState("in progress");
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [success, setSuccess] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (submissionUUID) {
      checkUploadStatus();
      intervalRef.current = setInterval(checkUploadStatus, 2000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [submissionUUID]);

  const checkUploadStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://fairscape.net/api/rocrate/upload/status/${submissionUUID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Status response:", response.data);
      setStatus(response.data.status);
      setDetails(response.data);
      setSuccess(response.data.success);
      if (response.data.error) {
        setError(response.data.error);
      }
      if (
        response.data.completed ||
        response.data.error ||
        !response.data.success
      ) {
        clearInterval(intervalRef.current);
      }
    } catch (error) {
      console.error("Status check error:", error);
      setError("Failed to check upload status");
      setStatus("failed");
      setSuccess(false);
      clearInterval(intervalRef.current);
    }
  };

  const steps = ["In Queue", "Uploading Files", "Minting IDs", "Complete"];
  let currentStep;
  let progress;

  switch (status) {
    case "in progress":
      currentStep = 1;
      progress = 33;
      break;
    case "minting identifiers":
      currentStep = 2;
      progress = 66;
      break;
    case "Finished":
      currentStep = success ? 3 : -1;
      progress = 100;
      break;
    case "failed":
      currentStep = -1;
      progress = 100;
      break;
    default:
      currentStep = 0;
      progress = 0;
  }

  const isFailed = status === "Failed" || error || !success;

  return (
    <StatusContainer>
      <StatusTitle>RO-Crate Upload Progress</StatusTitle>
      <ProgressBarContainer>
        <ProgressBar progress={progress} failed={isFailed} />
        <StepContainer>
          {steps.map((step, index) => (
            <Step key={index} active={index <= currentStep}>
              {index + 1}. {step}
            </Step>
          ))}
        </StepContainer>
      </ProgressBarContainer>
      {isFailed && <ErrorMessage>{error || "Upload failed"}</ErrorMessage>}
      {details && !isFailed && (
        <StatusDetails>
          <p>Status: {status}</p>
          <p>Completed: {details.completed ? "Yes" : "No"}</p>
          <p>Identifiers Minted: {details.identifiersMinted.length}</p>
          <p>Files Processed: {details.processedFiles.length}</p>
        </StatusDetails>
      )}
    </StatusContainer>
  );
};

export default StatusTracker;

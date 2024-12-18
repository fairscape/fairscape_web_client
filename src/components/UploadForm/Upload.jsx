import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Upload.css";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5173";

const StatusTracker = ({ submissionUUID, uploadError, isUploading }) => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [success, setSuccess] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const isActive = useRef(false);

  const checkUploadStatus = React.useCallback(async () => {
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
          clearInterval(intervalRef.current);
          isActive.current = false;
        }

        if (data.completed || data.error) {
          clearInterval(intervalRef.current);
          isActive.current = false;
        }
      }
    } catch (error) {
      if (isActive.current) {
        setError(`Failed to check upload status: ${error.message}`);
        setStatus("Failed");
        setSuccess(false);
        setCompleted(true);
        clearInterval(intervalRef.current);
        isActive.current = false;
      }
    }
  }, [submissionUUID]);

  React.useEffect(() => {
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
        clearInterval(intervalRef.current);
      }

      checkUploadStatus();
      intervalRef.current = setInterval(checkUploadStatus, 1000);
    } else {
      setStatus(null);
      setError(null);
      setSuccess(false);
      setCompleted(false);
      isActive.current = false;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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

  const isFailed = status === "Failed" || error || (completed && !success);

  if (!status) return null;

  return (
    <div className="status-tracker">
      <h3 className="status-title">Upload Progress</h3>
      <div className="progress-bar-container">
        <div
          className={`progress-bar-fill ${isFailed ? "failed" : ""}`}
          style={{ width: `${progress}%` }}
        />
        <div className="step-container">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index <= currentStep ? "active" : ""}`}
            >
              {index + 1}. {step}
            </div>
          ))}
        </div>
      </div>
      {isFailed && (
        <div className="error-message">{error || "Upload failed"}</div>
      )}
      {details && (
        <div className="status-details">
          <p>Status: {status}</p>
          <p>Success: {success ? "Yes" : "No"}</p>
          {details.result && (
            <p>
              View Result:{" "}
              <a
                href={`${BASE_URL}/${details.result}`}
                target="_blank"
                rel="noopener noreferrer"
                className="result-link"
              >
                Open
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Upload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submissionUUID, setSubmissionUUID] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/zip") {
      setFile(selectedFile);
      setError("");
      setSubmissionUUID(null);
      setUploadError(null);
      setIsUploading(false);
    } else {
      setError("Please select a valid ZIP file");
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in before uploading");
      return;
    }

    setError("");
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("crate", file);

    try {
      const response = await fetch(`${API_URL}/rocrate/upload-async`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissionUUID(data.transactionFolder);
      } else {
        setUploadError({
          status: response.status,
          message: data.message || "Upload failed",
        });
        setIsUploading(false);
      }
    } catch (error) {
      setUploadError({
        status: "Error",
        message: "An error occurred during upload",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file">Select ZIP File:</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept=".zip"
            disabled={isUploading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          className="upload-button"
          disabled={!file || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>

        <StatusTracker
          submissionUUID={submissionUUID}
          uploadError={uploadError}
          isUploading={isUploading}
        />
      </form>
    </div>
  );
};

export default Upload;

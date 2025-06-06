import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StatusTracker from "./StatusTracker";

const API_URL =
  window.API_URL;

interface UploadError {
  status: string;
  message: string;
}

const UploadContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const FileInput = styled.input`
  display: block;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 0.9rem;
`;

const UploadButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.successLight};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 600;
  text-align: center;
`;

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submissionUUID, setSubmissionUUID] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState(false);
  const [jsonError, setJsonError] = useState<UploadError | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/zip" ||
        selectedFile.type === "application/json")
    ) {
      setFile(selectedFile);
      setError("");
      setSubmissionUUID(null); // Reset submission specific states
      setUploadError(null);
      setIsUploading(false); // Ensure not in uploading state for new file
      setJsonSuccess(false);
      setJsonError(null);
    } else {
      setError("Please select a valid ZIP or JSON file");
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in before uploading");
      // Potentially navigate to login: navigate("/login");
      return;
    }

    setError("");
    setIsUploading(true); // Set for both types initially
    setUploadError(null);
    setJsonSuccess(false);
    setJsonError(null);
    // setSubmissionUUID(null); // Already reset in handleFileChange, but good to be sure if flow changes

    try {
      if (file.type === "application/zip") {
        const formData = new FormData();
        formData.append("crate", file);

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
          // isUploading remains true for ZIP, StatusTracker will handle setting it false
        } else {
          setUploadError({
            status: response.status.toString(),
            message: data.message || "Upload failed",
          });
          setIsUploading(false); // Explicitly set false on initial upload error for ZIP
        }
      } else if (file.type === "application/json") {
        const fileContent = await file.text();
        // Basic JSON validation, though server should handle robustly
        let jsonData;
        try {
          jsonData = JSON.parse(fileContent);
        } catch (parseError) {
          setJsonError({
            status: "Client Error",
            message: "Invalid JSON format.",
          });
          setIsUploading(false);
          return;
        }

        const response = await fetch(`${API_URL}/rocrate/metadata`, {
          method: "POST",
          body: JSON.stringify(jsonData),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setJsonSuccess(true);
        } else {
          const data = await response.json();
          setJsonError({
            status: response.status.toString(),
            message: data.message || "Metadata upload failed",
          });
        }
        setIsUploading(false); // JSON upload is synchronous, set false after attempt
      }
    } catch (err) {
      // This catch is for network errors or unhandled issues in the try block
      if (file.type === "application/zip") {
        setUploadError({
          status: "Network Error",
          message:
            (err as Error).message || "An error occurred during ZIP upload",
        });
      } else {
        setJsonError({
          status: "Network Error",
          message:
            (err as Error).message || "An error occurred during JSON upload",
        });
      }
      setIsUploading(false); // Ensure uploading is false on any catch-all error
    }
    // No finally block needed for setIsUploading(false) for ZIP, as StatusTracker manages that.
    // For JSON, it's handled within its specific path.
  };

  return (
    <UploadContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="file">Select ZIP or JSON File:</Label>
          <FileInput
            type="file"
            id="file"
            onChange={handleFileChange}
            accept=".zip,.json"
            disabled={isUploading && file?.type === "application/zip"} // Only disable for ZIP during its async phase
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>

        <UploadButton
          type="submit"
          disabled={!file || (isUploading && file?.type === "application/zip")}
        >
          {isUploading && file?.type === "application/zip"
            ? "Uploading..."
            : "Upload"}
        </UploadButton>

        {file?.type === "application/zip" && (
          <StatusTracker
            submissionUUID={submissionUUID}
            uploadError={uploadError}
            isUploading={isUploading && !!submissionUUID} // Pass true only if actively tracking a submission
          />
        )}

        {file?.type === "application/json" && jsonSuccess && (
          <SuccessMessage>Metadata uploaded successfully!</SuccessMessage>
        )}

        {file?.type === "application/json" && jsonError && (
          <ErrorMessage>
            Error {jsonError.status}: {jsonError.message}
          </ErrorMessage>
        )}
      </form>
    </UploadContainer>
  );
};

export default Upload;

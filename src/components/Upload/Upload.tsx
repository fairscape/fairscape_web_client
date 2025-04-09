import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StatusTracker from "./StatusTracker";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

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

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submissionUUID, setSubmissionUUID] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
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

  const handleSubmit = async (e: React.FormEvent) => {
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
          status: response.status.toString(),
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
    <UploadContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="file">Select ZIP File:</Label>
          <FileInput
            type="file"
            id="file"
            onChange={handleFileChange}
            accept=".zip"
            disabled={isUploading}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>

        <UploadButton type="submit" disabled={!file || isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </UploadButton>

        <StatusTracker
          submissionUUID={submissionUUID}
          uploadError={uploadError}
          isUploading={isUploading}
        />
      </form>
    </UploadContainer>
  );
};

export default Upload;

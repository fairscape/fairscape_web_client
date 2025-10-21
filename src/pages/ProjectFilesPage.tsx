import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FiUpload,
  FiFile,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

const ALLOWED_PROJECTS = ["cm4ai", "chorus", "voice", "ai-readi"];
const API_URL = "http://localhost:5005";

const ProjectFilesPage = () => {
  const [selectedProject, setSelectedProject] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    }
  }, [selectedProject]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/list/${selectedProject}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setStatusMessage(`Error loading files: ${error.message}`);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedProject) {
      setStatusMessage("Please select a project first");
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
      return;
    }

    if (selectedFiles.length === 0) {
      setStatusMessage("Please select files to upload");
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
      return;
    }

    setUploadStatus("uploading");
    setStatusMessage("Uploading files...");

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`${API_URL}/add/${selectedProject}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setStatusMessage(
        `Successfully uploaded ${data.added_files.length} file(s)`
      );
      setUploadStatus("success");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchFiles();

      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setStatusMessage(`Upload failed: ${error.message}`);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Project Files Management</Title>
        <Subtitle>Manage PDF files for Bride2AI projects</Subtitle>
      </PageHeader>

      <ProjectSelector>
        <SelectorLabel>Select Project:</SelectorLabel>
        <Select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">-- Choose a project --</option>
          {ALLOWED_PROJECTS.map((project) => (
            <option key={project} value={project}>
              {project.toUpperCase()}
            </option>
          ))}
        </Select>
      </ProjectSelector>

      {selectedProject && (
        <>
          <Section>
            <SectionHeader>
              <SectionTitle>Upload Files</SectionTitle>
            </SectionHeader>

            <UploadArea>
              <FileInputWrapper>
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                />
                <UploadButton onClick={() => fileInputRef.current?.click()}>
                  <FiUpload size={20} />
                  Select PDF Files
                </UploadButton>
              </FileInputWrapper>

              {selectedFiles.length > 0 && (
                <SelectedFilesList>
                  <ListHeader>
                    Selected Files ({selectedFiles.length})
                  </ListHeader>
                  {selectedFiles.map((file, idx) => (
                    <FileItem key={idx}>
                      <FiFile />
                      <FileName>{file.name}</FileName>
                      <FileSize>{(file.size / 1024).toFixed(2)} KB</FileSize>
                    </FileItem>
                  ))}
                  <ButtonGroup>
                    <ActionButton
                      onClick={handleUpload}
                      disabled={uploadStatus === "uploading"}
                    >
                      {uploadStatus === "uploading"
                        ? "Uploading..."
                        : "Upload to Project"}
                    </ActionButton>
                    <ClearButton onClick={handleClearSelection}>
                      Clear Selection
                    </ClearButton>
                  </ButtonGroup>
                </SelectedFilesList>
              )}

              {uploadStatus !== "idle" && (
                <StatusMessage status={uploadStatus}>
                  {uploadStatus === "success" && <FiCheck size={20} />}
                  {uploadStatus === "error" && <FiAlertCircle size={20} />}
                  <span>{statusMessage}</span>
                </StatusMessage>
              )}
            </UploadArea>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Project Files</SectionTitle>
              <RefreshButton onClick={fetchFiles} disabled={loading}>
                <FiRefreshCw size={18} />
                Refresh
              </RefreshButton>
            </SectionHeader>

            {loading ? (
              <LoadingContainer>
                <Spinner />
                <LoadingText>Loading files...</LoadingText>
              </LoadingContainer>
            ) : files.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FiFile size={48} />
                </EmptyIcon>
                <EmptyText>No files in this project yet</EmptyText>
                <EmptySubtext>
                  Upload some PDF files to get started
                </EmptySubtext>
              </EmptyState>
            ) : (
              <FilesList>
                {files.map((file, idx) => (
                  <FileListItem key={idx}>
                    <FileIcon>
                      <FiFile />
                    </FileIcon>
                    <FileListName>{file}</FileListName>
                  </FileListItem>
                ))}
              </FilesList>
            )}
          </Section>
        </>
      )}

      {!selectedProject && (
        <WelcomeMessage>
          <WelcomeIcon>📁</WelcomeIcon>
          <WelcomeText>
            Select a project to view and manage its files
          </WelcomeText>
        </WelcomeMessage>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #3e7aa8;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
`;

const ProjectSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SelectorLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const Select = styled.select`
  flex: 1;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #3e7aa8;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2c5f8d;
    box-shadow: 0 0 0 3px rgba(62, 122, 168, 0.1);
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #3e7aa8;
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #5a6268;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UploadArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FileInputWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2c5f8d;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const SelectedFilesList = styled.div`
  background: #f8f9fa;
  border: 2px dashed #3e7aa8;
  border-radius: 8px;
  padding: 20px;
`;

const ListHeader = styled.div`
  font-weight: 600;
  color: #3e7aa8;
  margin-bottom: 15px;
  font-size: 1.1rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;
  color: #333;

  svg {
    color: #3e7aa8;
    flex-shrink: 0;
  }
`;

const FileName = styled.span`
  flex: 1;
  font-weight: 500;
`;

const FileSize = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 6px;
  font-weight: 600;

  ${(props) =>
    props.status === "success" &&
    `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `}

  ${(props) =>
    props.status === "error" &&
    `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
  
  ${(props) =>
    props.status === "uploading" &&
    `
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3e7aa8;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: #ccc;
  margin-bottom: 20px;
`;

const EmptyText = styled.div`
  font-size: 1.3rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 10px;
`;

const EmptySubtext = styled.div`
  font-size: 1rem;
  color: #999;
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FileListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #3e7aa8;
    transform: translateX(5px);
  }
`;

const FileIcon = styled.div`
  color: #3e7aa8;
  display: flex;
  align-items: center;
`;

const FileListName = styled.div`
  flex: 1;
  font-weight: 500;
  color: #333;
`;

const WelcomeMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
`;

const WelcomeIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
`;

const WelcomeText = styled.div`
  font-size: 1.5rem;
  color: #666;
  font-weight: 500;
`;

export default ProjectFilesPage;

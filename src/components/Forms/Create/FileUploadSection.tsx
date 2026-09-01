import React, { useRef, useState } from "react";
import styled from "styled-components";
import { FiUpload, FiX, FiFile, FiInfo } from "react-icons/fi";
import { extractFileMetadata } from "../utils/createUtils";

interface FileUploadSectionProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileUpload,
  uploadedFile,
  onRemoveFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <Header>
        <Title>Upload File (Optional)</Title>
      </Header>

      {!uploadedFile ? (
        <DropZone
          isDragging={isDragging}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <FiUpload size={32} />
          <DropText>Drop file here or click to browse</DropText>
          <DropSubtext>
            Upload a data or software file to auto-populate metadata
          </DropSubtext>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </DropZone>
      ) : (
        <FileInfo>
          <FileIcon>
            <FiFile size={24} />
          </FileIcon>
          <FileDetails>
            <FileName>{uploadedFile.name}</FileName>
            <FileSize>{(uploadedFile.size / 1024).toFixed(2)} KB</FileSize>
          </FileDetails>
          <RemoveButton onClick={onRemoveFile} title="Remove file">
            <FiX />
          </RemoveButton>
        </FileInfo>
      )}

      <InfoBox>
        <FiInfo />
        <InfoText>
          Uploading a file will auto-populate:
          <ul>
            <li>Name (from filename)</li>
            <li>Format (from MIME type)</li>
            <li>Description (basic file info)</li>
          </ul>
        </InfoText>
      </InfoBox>
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border: 1px solid #e2e8ea;
  border-radius: 2px;
  padding: 24px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #18242a;
  margin: 0;
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${(e) => (e.isDragging ? "#005F73" : "#C3CED2")};
  border-radius: 2px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(e) => (e.isDragging ? "#EBF2F4" : "#F7F9F9")};

  &:hover {
    border-color: #005f73;
    background-color: #ebf2f4;
  }

  svg {
    color: ${(e) => (e.isDragging ? "#005F73" : "#84939A")};
    margin-bottom: 12px;
  }
`;

const DropText = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #18242a;
  margin-bottom: 4px;
`;

const DropSubtext = styled.div`
  font-size: 0.75rem;
  color: #51626b;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f7f9f9;
  border: 1px solid #e2e8ea;
  border-radius: 2px;
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #ebf2f4;
  border-radius: 2px;
  color: #005f73;
  flex-shrink: 0;
`;

const FileDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #18242a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: #51626b;
  margin-top: 2px;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 2px;
  border: 1px solid #fecaca;
  background-color: #fef2f2;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: #fee2e2;
  }

  svg {
    font-size: 1.25rem;
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #ebf2f4;
  border: 1px solid #c3ced2;
  border-radius: 2px;
  margin-top: 16px;
  align-items: flex-start;

  svg {
    flex-shrink: 0;
    color: #005f73;
    font-size: 1rem;
    margin-top: 2px;
  }
`;

const InfoText = styled.div`
  font-size: 0.75rem;
  color: #1e40af;
  line-height: 1.5;

  ul {
    margin: 4px 0 0 0;
    padding-left: 20px;
  }

  li {
    margin: 2px 0;
  }
`;

export default FileUploadSection;

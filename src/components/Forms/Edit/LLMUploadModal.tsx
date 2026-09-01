import React, { useState } from "react";
import styled from "styled-components";
import { LLMProcessingState } from "../types/reviewTypes";

interface LLMUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (file: File) => Promise<void>;
  currentFormData: any;
  config: any;
}

const LLMUploadModal: React.FC<LLMUploadModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  currentFormData,
  config,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<LLMProcessingState>({
    isProcessing: false,
    error: null,
    progress: 0,
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setProcessingState({ isProcessing: false, error: null, progress: 0 });
  };

  const handleGenerate = async () => {
    if (!file) return;

    setProcessingState({ isProcessing: true, error: null, progress: 0 });

    try {
      await onGenerate(file);
      setProcessingState({ isProcessing: false, error: null, progress: 100 });
      setTimeout(() => {
        onClose();
        setFile(null);
      }, 1000);
    } catch (err: any) {
      setProcessingState({
        isProcessing: false,
        error: err.message || "Failed to generate metadata",
        progress: 0,
      });
    }
  };

  const handleClose = () => {
    if (!processingState.isProcessing) {
      setFile(null);
      setProcessingState({ isProcessing: false, error: null, progress: 0 });
      onClose();
    }
  };

  return (
    <Overlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Generate Metadata from Paper</Title>
          <CloseButton
            onClick={handleClose}
            disabled={processingState.isProcessing}
          >
            ×
          </CloseButton>
        </Header>

        <Content>
          <Description>
            Upload a paper to automatically extract metadata. Only empty fields
            will be populated and will be marked for review.
          </Description>

          <FileUploadSection>
            <FileInput
              type="file"
              id="paper-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              disabled={processingState.isProcessing}
            />
            <FileLabel
              htmlFor="paper-upload"
              disabled={processingState.isProcessing}
            >
              {file ? file.name : "Choose a file"}
            </FileLabel>
            {file && (
              <FileInfo>{(file.size / 1024 / 1024).toFixed(2)} MB</FileInfo>
            )}
          </FileUploadSection>

          {processingState.error && (
            <ErrorMessage>{processingState.error}</ErrorMessage>
          )}

          {processingState.isProcessing && (
            <ProcessingIndicator>
              <Spinner />
              <ProcessingText>
                Analyzing paper and generating metadata...
              </ProcessingText>
            </ProcessingIndicator>
          )}
        </Content>

        <Footer>
          <CancelButton
            onClick={handleClose}
            disabled={processingState.isProcessing}
          >
            Cancel
          </CancelButton>
          <GenerateButton
            onClick={handleGenerate}
            disabled={!file || processingState.isProcessing}
          >
            {processingState.isProcessing
              ? "Generating..."
              : "Generate Metadata"}
          </GenerateButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 2px;
  width: 90%;
  max-width: 500px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8ea;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #18242a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #51626b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #f7f9f9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #51626b;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const FileUploadSection = styled.div`
  margin-bottom: 20px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label<{ disabled: boolean }>`
  display: block;
  padding: 12px 16px;
  background-color: #f7f9f9;
  border: 2px dashed #c3ced2;
  border-radius: 2px;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  color: #18242a;
  font-size: 0.875rem;

  &:hover:not([disabled]) {
    background-color: #e2e8ea;
    border-color: #84939a;
  }

  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const FileInfo = styled.div`
  margin-top: 8px;
  font-size: 0.75rem;
  color: #51626b;
  text-align: center;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 2px;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 16px;
`;

const ProcessingIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
`;

const Spinner = styled.div`
  border: 3px solid #e2e8ea;
  border-top: 3px solid #005f73;
  border-radius: 50%;
  width: 40px;
  height: 40px;
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

const ProcessingText = styled.div`
  font-size: 0.875rem;
  color: #51626b;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8ea;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #18242a;
  border: 1px solid #c3ced2;

  &:hover:not(:disabled) {
    background-color: #f7f9f9;
  }
`;

const GenerateButton = styled(Button)`
  background-color: #005f73;
  color: white;

  &:hover:not(:disabled) {
    background-color: #003844;
  }
`;

export default LLMUploadModal;

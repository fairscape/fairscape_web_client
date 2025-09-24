import React, { useRef } from "react";
import styled from "styled-components";
import { FiUpload, FiFile, FiSave } from "react-icons/fi";
import { Card, StyledButton } from "../ReleaseComponents";

interface UploadedFile {
  name: string;
  content: string;
}

interface DocumentUploaderProps {
  supportingDocs: UploadedFile[];
  onDocsChange: (docs: UploadedFile[]) => void;
  onLLMAssist: (docs: UploadedFile[]) => void;
  onSkipToManual: () => void;
  onSave?: () => void;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  isLoading: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  supportingDocs,
  onDocsChange,
  onLLMAssist,
  onSkipToManual,
  onSave,
  saveStatus = "idle",
  isLoading,
}) => {
  const docsInputRef = useRef<HTMLInputElement>(null);

  const handleSupportingDocsUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const newDocs: UploadedFile[] = [];

    for (const file of files) {
      const content = await file.text();
      newDocs.push({ name: file.name, content });
    }

    onDocsChange([...supportingDocs, ...newDocs]);
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved!";
      case "error":
        return "Save Failed";
      default:
        return "Save Progress";
    }
  };

  return (
    <Card>
      <SectionTitle>
        Optional: Add Supporting Documents for AI Assistance
      </SectionTitle>
      <Description>
        Upload documents that describe your dataset to get AI-suggested
        metadata. After generation, you'll need to review and acknowledge each
        section.
      </Description>

      {supportingDocs.length > 0 && (
        <>
          <DocumentList>
            {supportingDocs.map((doc, idx) => (
              <DocumentItem key={idx}>
                <FiFile /> {doc.name}
              </DocumentItem>
            ))}
          </DocumentList>
          <ButtonGroup>
            <StyledButton
              onClick={() => onLLMAssist(supportingDocs)}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : "Generate Suggestions (Review Required)"}
            </StyledButton>
            <StyledButton variant="secondary" onClick={() => onDocsChange([])}>
              Clear Documents
            </StyledButton>
            {onSave && (
              <StyledButton
                onClick={onSave}
                variant="secondary"
                disabled={saveStatus === "saving"}
              >
                <FiSave />
                {getSaveButtonText()}
              </StyledButton>
            )}
          </ButtonGroup>
        </>
      )}

      {supportingDocs.length === 0 && (
        <ButtonGroup>
          <StyledButton onClick={() => docsInputRef.current?.click()}>
            <FiUpload /> Add Documents
          </StyledButton>
          <StyledButton variant="secondary" onClick={onSkipToManual}>
            Skip to Manual Entry
          </StyledButton>
        </ButtonGroup>
      )}

      <input
        ref={docsInputRef}
        type="file"
        multiple
        accept=".txt,.md,.pdf,.json"
        onChange={handleSupportingDocsUpload}
        style={{ display: "none" }}
      />
    </Card>
  );
};

const SectionTitle = styled.h3`
  color: #3e7aa8;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const Description = styled.p`
  margin-bottom: 20px;
  color: #666;
  background: #fff3cd;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ffeeba;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const DocumentList = styled.div`
  margin: 20px 0;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #666;
`;

export default DocumentUploader;

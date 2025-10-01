import React, { useRef, useState } from "react";
import styled from "styled-components";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import { Card, StyledButton } from "../ReleaseComponents";
import SavedCrateSelector from "./SavedCrateSelector";

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
  onSavedCrateSelect: (data: { formData: any; reviewState?: any }) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  supportingDocs,
  onDocsChange,
  onLLMAssist,
  onSkipToManual,
  isLoading,
  onSavedCrateSelect,
}) => {
  const docsInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"new" | "continue">("new");

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

  const removeDoc = (index: number) => {
    onDocsChange(supportingDocs.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <TabContainer>
        <Tab active={activeTab === "new"} onClick={() => setActiveTab("new")}>
          Start New
        </Tab>
        <Tab
          active={activeTab === "continue"}
          onClick={() => setActiveTab("continue")}
        >
          Continue from Saved
        </Tab>
      </TabContainer>

      {activeTab === "new" ? (
        <Card>
          <SectionTitle>
            Optional: Add Supporting Documents for AI Assistance
          </SectionTitle>
          <Description>
            Upload documents that describe your dataset to get AI-suggested
            metadata. After generation, you'll need to review and acknowledge
            each section.
          </Description>

          {supportingDocs.length > 0 && (
            <>
              <DocumentList>
                {supportingDocs.map((doc, idx) => (
                  <DocumentItem key={idx}>
                    <DocInfo>
                      <FiFile /> {doc.name}
                    </DocInfo>
                    <RemoveButton onClick={() => removeDoc(idx)}>
                      <FiX />
                    </RemoveButton>
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
                <StyledButton
                  variant="secondary"
                  onClick={() => onDocsChange([])}
                >
                  Clear Documents
                </StyledButton>
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
      ) : (
        <SavedCrateSelector
          onCrateSelect={onSavedCrateSelect}
          hideBackButton={true}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  background: #f0f0f0;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: ${(props) => (props.active ? "white" : "transparent")};
  color: ${(props) => (props.active ? "#3e7aa8" : "#666")};
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "white" : "#e0e0e0")};
  }
`;

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
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #666;
`;

const DocInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.7;
  }
`;

export default DocumentUploader;

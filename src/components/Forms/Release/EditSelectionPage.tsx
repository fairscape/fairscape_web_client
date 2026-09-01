import React, { useRef } from "react";
import styled from "styled-components";
import { FiUpload, FiArrowLeft } from "react-icons/fi";
import { Card } from "../ReleaseComponents";
import SavedCrateSelector from "./SavedCrateSelector";

interface EditSelectionPageProps {
  onCrateUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSavedCrateSelect: (data: { formData: any; reviewState?: any }) => void;
  onBack: () => void;
  title?: string;
  description?: string;
}

const EditSelectionPage: React.FC<EditSelectionPageProps> = ({
  onCrateUpload,
  onSavedCrateSelect,
  onBack,
  title = "Edit Existing RO-Crate",
  description = "Upload an existing ro-crate-metadata.json file to edit its contents. No review will be required in edit mode.",
}) => {
  const crateInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <EditContent>
        <UploadSection>
          <Card>
            <SectionTitle>Upload RO-Crate File</SectionTitle>
            <Description>{description}</Description>
            <UploadButton onClick={() => crateInputRef.current?.click()}>
              <FiUpload /> Select File
            </UploadButton>
          </Card>
        </UploadSection>

        <SavedSection>
          <SavedCrateSelector
            onCrateSelect={onSavedCrateSelect}
            hideBackButton={true}
          />
        </SavedSection>
      </EditContent>

      <input
        ref={crateInputRef}
        type="file"
        accept=".json"
        onChange={onCrateUpload}
        style={{ display: "none" }}
      />
    </>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const BackButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2d5f7f;
  }
`;

const Title = styled.h2`
  color: #3e7aa8;
  font-size: 24px;
  margin: 0;
`;

const EditContent = styled.div`
  display: flex;
  gap: 10px;
`;

const UploadSection = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SavedSection = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  background: #f7f9f9;
  border-radius: 2px 8px 0 0;
  overflow: hidden;
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
  border-radius: 2px;
  border: 1px solid #ffeeba;
`;

const UploadButton = styled.button`
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

export default EditSelectionPage;

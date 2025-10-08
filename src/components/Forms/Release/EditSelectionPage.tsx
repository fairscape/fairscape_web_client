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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }
`;

const Title = styled.h2`
  color: #3e7aa8;
  font-size: 24px;
  margin: 0;
`;

const EditContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
`;

const UploadSection = styled.div``;

const SavedSection = styled.div``;

const SectionTitle = styled.h3`
  color: #3e7aa8;
  font-size: 18px;
  margin-bottom: 15px;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;

  &:hover {
    background: #2c5f8d;
  }
`;

export default EditSelectionPage;

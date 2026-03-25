import React from "react";
import styled from "styled-components";
import { FiSave, FiX, FiInfo, FiDownload } from "react-icons/fi";

interface CreateActionSidebarProps {
  onSave: () => void;
  onDownload: () => void;
  onCancel: () => void;
  saveStatus: "idle" | "saving" | "success" | "error";
  hasValidForm: boolean;
  entityType: string;
  parentArkId: string | null;
  errorMessage?: string | null;
}

const CreateActionSidebar: React.FC<CreateActionSidebarProps> = ({
  onSave,
  onDownload,
  onCancel,
  saveStatus,
  hasValidForm,
  entityType,
  parentArkId,
  errorMessage,
}) => {
  const isDataset = entityType.toLowerCase() === "dataset";
  const uploadSupported = isDataset;

  const getStatusMessage = () => {
    switch (saveStatus) {
      case "saving":
        return "Uploading...";
      case "success":
        return "Dataset created successfully!";
      case "error":
        return errorMessage || "Upload failed";
      default:
        return null;
    }
  };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <SidebarContainer>
      <SidebarContent>
        <Section>
          <SectionTitle>Actions</SectionTitle>

          <ActionButton
            onClick={onSave}
            disabled={!uploadSupported || !hasValidForm || saveStatus === "saving"}
            primary
          >
            <FiSave />
            <span>
              {!uploadSupported
                ? "Upload (Coming Soon)"
                : saveStatus === "saving"
                  ? "Uploading..."
                  : "Upload"}
            </span>
          </ActionButton>

          <ActionButton
            onClick={onDownload}
            disabled={!hasValidForm || saveStatus === "saving"}
          >
            <FiDownload />
            <span>Download JSON-LD</span>
          </ActionButton>

          <ActionButton onClick={onCancel}>
            <FiX />
            <span>Cancel</span>
          </ActionButton>
        </Section>

        {getStatusMessage() && (
          <StatusMessage status={saveStatus}>
            {getStatusMessage()}
          </StatusMessage>
        )}

        <Divider />

        <Section>
          <SectionTitle>Entity Info</SectionTitle>
          <InfoRow>
            <InfoLabel>Type:</InfoLabel>
            <InfoValue>{capitalize(entityType)}</InfoValue>
          </InfoRow>
          {parentArkId && (
            <InfoRow>
              <InfoLabel>Parent:</InfoLabel>
              <InfoValue>{parentArkId}</InfoValue>
            </InfoRow>
          )}
        </Section>

        <Divider />

        <Section>
          <NoticeBox>
            <FiInfo />
            <NoticeText>
              {uploadSupported
                ? "This will upload the dataset metadata and file to the Fairscape server."
                : "Upload is only available for Datasets. Other entity types are coming soon."}
            </NoticeText>
          </NoticeBox>
        </Section>
      </SidebarContent>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  height: fit-content;
`;

const SidebarContent = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${(props) => (props.primary ? "#3b82f6" : "#d1d5db")};
  background-color: ${(props) => (props.primary ? "#3b82f6" : "white")};
  color: ${(props) => (props.primary ? "white" : "#374151")};

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.primary ? "#2563eb" : "#f9fafb")};
    border-color: ${(props) => (props.primary ? "#2563eb" : "#9ca3af")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 1rem;
  }
`;

const StatusMessage = styled.div<{ status: string }>`
  padding: 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${(props) => {
    switch (props.status) {
      case "success":
        return "#f0fdf4";
      case "error":
        return "#fef2f2";
      case "saving":
        return "#eff6ff";
      default:
        return "#f9fafb";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "success":
        return "#166534";
      case "error":
        return "#991b1b";
      case "saving":
        return "#1e40af";
      default:
        return "#374151";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.status) {
        case "success":
          return "#bbf7d0";
        case "error":
          return "#fecaca";
        case "saving":
          return "#bfdbfe";
        default:
          return "#e5e7eb";
      }
    }};
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 0.875rem;
  color: #111827;
  word-break: break-all;
`;

const NoticeBox = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  align-items: flex-start;

  svg {
    flex-shrink: 0;
    color: #3b82f6;
    font-size: 1rem;
    margin-top: 2px;
  }
`;

const NoticeText = styled.div`
  font-size: 0.75rem;
  color: #1e40af;
  line-height: 1.5;
`;

export default CreateActionSidebar;

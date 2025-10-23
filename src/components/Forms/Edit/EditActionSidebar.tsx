import React from "react";
import styled from "styled-components";
import { FiSave, FiX, FiExternalLink, FiCpu } from "react-icons/fi";
import { BsCircle, BsCircleFill } from "react-icons/bs";

type Visibility = "minimal" | "ai-ready" | "all";

interface EditActionSidebarProps {
  // View management
  visibility: Visibility;
  onVisibilityChange: (visibility: Visibility) => void;

  // Actions
  onUpdate: () => void;
  onCancel: () => void;
  onGenerateWithAI: () => void;

  // State & Info
  arkId: string;
  updateStatus: "idle" | "updating" | "success" | "error";
  hasChanges: boolean;
}

const EditActionSidebar: React.FC<EditActionSidebarProps> = ({
  visibility,
  onVisibilityChange,
  onUpdate,
  onCancel,
  onGenerateWithAI,
  arkId,
  updateStatus,
  hasChanges,
}) => {
  const getStatusMessage = () => {
    switch (updateStatus) {
      case "updating":
        return "Saving...";
      case "success":
        return "Saved Successfully!";
      case "error":
        return "Save Failed";
      default:
        return null;
    }
  };

  return (
    <SidebarContainer>
      <SidebarContent>
        <Section>
          <SectionTitle>Metadata Detail</SectionTitle>
          <ViewButton
            active={visibility === "minimal"}
            onClick={() => onVisibilityChange("minimal")}
          >
            {visibility === "minimal" ? <BsCircleFill /> : <BsCircle />}
            <span>Minimal</span>
          </ViewButton>
          <ViewButton
            active={visibility === "ai-ready"}
            onClick={() => onVisibilityChange("ai-ready")}
          >
            {visibility === "ai-ready" ? <BsCircleFill /> : <BsCircle />}
            <span>AI-Ready</span>
          </ViewButton>
          <ViewButton
            active={visibility === "all"}
            onClick={() => onVisibilityChange("all")}
          >
            {visibility === "all" ? <BsCircleFill /> : <BsCircle />}
            <span>All Fields</span>
          </ViewButton>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Actions</SectionTitle>

          <ActionButton onClick={onGenerateWithAI}>
            <FiCpu />
            <span>Generate with AI</span>
          </ActionButton>

          <ActionButton
            onClick={onUpdate}
            disabled={!hasChanges || updateStatus === "updating"}
          >
            <FiSave />
            <span>{updateStatus === "updating" ? "Saving..." : "Save"}</span>
          </ActionButton>

          <ActionButton onClick={onCancel}>
            <FiX />
            <span>Cancel</span>
          </ActionButton>
        </Section>

        <Divider />

        <ViewLink
          href={`/view/${arkId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiExternalLink />
          <span>View Metadata Page</span>
        </ViewLink>

        {getStatusMessage() && (
          <StatusMessage status={updateStatus}>
            {getStatusMessage()}
          </StatusMessage>
        )}
      </SidebarContent>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  position: sticky;
  top: 20px;
  width: 250px;
  height: fit-content;
`;

const SidebarContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
`;

const Section = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  color: #005f73;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #dee2e6;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ViewButton = styled.button<{ active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  background: ${({ active }) => (active ? "#005f73" : "transparent")};
  color: ${({ active }) => (active ? "white" : "#212529")};

  &:hover {
    background: ${({ active }) => (active ? "#005f73" : "#f8f9fa")};
    transform: translateX(2px);
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    font-size: 14px;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #005f73;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: white;
  color: #005f73;

  &:hover:not(:disabled) {
    background: #005f73;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    background: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    font-size: 14px;
  }
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid #dee2e6;
`;

const ViewLink = styled.a`
  width: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #6c757d;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: white;
  color: #6c757d;

  &:hover {
    background: #6c757d;
    color: white;
  }
`;

const StatusMessage = styled.div<{ status: string }>`
  margin-top: 12px;
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  font-weight: 600;
  background-color: ${({ status }) =>
    status === "success"
      ? "#d4edda"
      : status === "error"
      ? "#f8d7da"
      : "#e2e3e5"};
  color: ${({ status }) =>
    status === "success"
      ? "#155724"
      : status === "error"
      ? "#721c24"
      : "#383d41"};
`;

export default EditActionSidebar;

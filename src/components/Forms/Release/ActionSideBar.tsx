import React from "react";
import styled from "styled-components";

interface ActionSidebarProps {
  onDownload: () => void;
  onSave: () => void;
  onStartOver: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isAllSectionsReviewed: boolean;
  isReviewRequired: boolean;
  reviewProgress?: { reviewed: number; total: number };
  visibility: "minimal" | "ai-ready" | "all";
  onVisibilityChange: (visibility: "minimal" | "ai-ready" | "all") => void;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  onDownload,
  onSave,
  onStartOver,
  saveStatus,
  isAllSectionsReviewed,
  isReviewRequired,
  reviewProgress,
  visibility,
  onVisibilityChange,
}) => {
  return (
    <Sidebar>
      <SidebarSection>
        <SectionTitle>Metadata Detail</SectionTitle>
        <VisibilityToggle>
          <VisibilityButton
            active={visibility === "minimal"}
            onClick={() => onVisibilityChange("minimal")}
          >
            Minimal
          </VisibilityButton>
          <VisibilityButton
            active={visibility === "ai-ready"}
            onClick={() => onVisibilityChange("ai-ready")}
          >
            AI-Ready
          </VisibilityButton>
          <VisibilityButton
            active={visibility === "all"}
            onClick={() => onVisibilityChange("all")}
          >
            All Fields
          </VisibilityButton>
        </VisibilityToggle>
        <VisibilityDescription>
          {visibility === "minimal" && "Showing only required fields"}
          {visibility === "ai-ready" && "Showing required and AI-ready fields"}
          {visibility === "all" && "Showing all available fields"}
        </VisibilityDescription>
      </SidebarSection>

      {isReviewRequired && reviewProgress && (
        <SidebarSection>
          <SectionTitle>Review Progress</SectionTitle>
          <ProgressText>
            {reviewProgress.reviewed} of {reviewProgress.total} sections
            reviewed
          </ProgressText>
          <ProgressBar>
            <ProgressFill
              width={(reviewProgress.reviewed / reviewProgress.total) * 100}
            />
          </ProgressBar>
        </SidebarSection>
      )}

      <SidebarSection>
        <ActionButton onClick={onSave} disabled={saveStatus === "saving"}>
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "✓ Saved"}
          {saveStatus === "error" && "Error - Retry"}
          {saveStatus === "idle" && "Save Progress"}
        </ActionButton>

        <ActionButton
          onClick={onDownload}
          disabled={!isAllSectionsReviewed}
          primary
        >
          Download RO-Crate
        </ActionButton>

        <ActionButton onClick={onStartOver} variant="secondary">
          Start Over
        </ActionButton>
      </SidebarSection>
    </Sidebar>
  );
};

const Sidebar = styled.div`
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 20px;
`;

const SidebarSection = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
`;

const VisibilityToggle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const VisibilityButton = styled.button<{ active: boolean }>`
  padding: 10px 16px;
  border: 2px solid ${(props) => (props.active ? "#3e7aa8" : "#e0e0e0")};
  background: ${(props) => (props.active ? "#e8f4f8" : "white")};
  color: ${(props) => (props.active ? "#3e7aa8" : "#666")};
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3e7aa8;
    background: ${(props) => (props.active ? "#e8f4f8" : "#f5f5f5")};
  }
`;

const VisibilityDescription = styled.p`
  margin-top: 10px;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
`;

const ProgressText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  width: ${(props) => props.width}%;
  height: 100%;
  background: #3e7aa8;
  transition: width 0.3s;
`;

const ActionButton = styled.button<{
  primary?: boolean;
  variant?: string;
  disabled?: boolean;
}>`
  width: 100%;
  padding: 12px 20px;
  margin-bottom: 10px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  background: ${(props) => {
    if (props.disabled) return "#e0e0e0";
    if (props.primary) return "#3e7aa8";
    if (props.variant === "secondary") return "white";
    return "#5a9bc4";
  }};

  color: ${(props) => {
    if (props.disabled) return "#999";
    if (props.variant === "secondary") return "#666";
    return "white";
  }};

  border: ${(props) =>
    props.variant === "secondary" ? "2px solid #e0e0e0" : "none"};

  &:hover {
    ${(props) =>
      !props.disabled &&
      `
      background: ${
        props.primary
          ? "#2d5f7f"
          : props.variant === "secondary"
          ? "#f5f5f5"
          : "#4a8aad"
      };
      transform: translateY(-1px);
    `}
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export default ActionSidebar;

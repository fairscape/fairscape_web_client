import React from "react";
import styled from "styled-components";

interface ProvenanceState {
  inputArk: string;
  computationArk: string;
  outputArk: string;
  sourceFlow: "manual" | "direct" | "chatbot";
  requiresGithubPush: boolean;
  yamlUrl?: string;
}

interface ActionSidebarProps {
  onDownload: () => void;
  onFinalize: () => Promise<void>;
  onSave: () => void;
  onStartOver: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isAllSectionsReviewed: boolean;
  isReviewRequired: boolean;
  reviewProgress?: { reviewed: number; total: number };
  visibility: "minimal" | "ai-ready" | "all";
  onVisibilityChange: (visibility: "minimal" | "ai-ready" | "all") => void;
  provenance?: ProvenanceState | null;
  finalArk?: string | null;
  isUploading?: boolean;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  onDownload,
  onFinalize,
  onSave,
  onStartOver,
  saveStatus,
  isAllSectionsReviewed,
  isReviewRequired,
  reviewProgress,
  visibility,
  onVisibilityChange,
  provenance,
  finalArk,
  isUploading = false,
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
            Croissant + AI-Ready
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

        <ButtonGroup>
          <ActionButton
            onClick={onDownload}
            disabled={!isAllSectionsReviewed}
            primary
          >
            Download Local Copy
          </ActionButton>

          <ActionButton
            onClick={onFinalize}
            disabled={
              !isAllSectionsReviewed || isUploading || finalArk !== null
            }
            primary
          >
            {isUploading ? "Uploading..." : "Upload to Fairscape"}
          </ActionButton>
        </ButtonGroup>

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

  @media (max-width: 1024px) {
    position: static;
    width: 100%;
  }
`;

const SidebarSection = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
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
  border: 2px solid ${(e) => (e.active ? "#3e7aa8" : "#e0e0e0")};
  background: ${(e) => (e.active ? "#e8f4f8" : "white")};
  color: ${(e) => (e.active ? "#3e7aa8" : "#666")};
  border-radius: 2px;
  font-size: 0.9rem;
  font-weight: ${(e) => (e.active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3e7aa8;
    background: ${(e) => (e.active ? "#e8f4f8" : "#f5f5f5")};
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
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  width: ${(e) => e.width}%;
  height: 100%;
  background: #3e7aa8;
  transition: width 0.3s;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
`;

const ProvenanceItem = styled.div`
  padding: 8px 12px;
  background: #f8f9fa;
  border-left: 3px solid #3e7aa8;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #333;
  word-break: break-all;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProvenanceNote = styled.p`
  padding: 12px;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  font-size: 0.85rem;
  color: #92400e;
  line-height: 1.5;
  margin: 0;
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
  border-radius: 2px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${(e) => (e.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  background: ${(e) => (e.disabled ? "#e0e0e0" : e.primary ? "#3e7aa8" : e.variant === "secondary" ? "white" : "#5a9bc4")};

  color: ${(e) => (e.disabled ? "#999" : e.variant === "secondary" ? "#666" : "white")};

  border: ${(e) => (e.variant === "secondary" ? "2px solid #e0e0e0" : "none")};

  &:hover {
    ${(e) =>
      !e.disabled &&
      `
      background: ${e.primary ? "#2d5f7f" : e.variant === "secondary" ? "#f5f5f5" : "#4a8aad"};
    `}
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export default ActionSidebar;

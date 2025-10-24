import React from "react";
import styled from "styled-components";
import { FiSave, FiX, FiExternalLink, FiCpu } from "react-icons/fi";
import { BsCircle, BsCircleFill } from "react-icons/bs";
import { ReviewStates, ReviewStatus } from "../types/reviewTypes";
import { getReviewProgress } from "../utils/llmUtils";

type Visibility = "minimal" | "ai-ready" | "all";

interface EditActionSidebarProps {
  visibility: Visibility;
  onVisibilityChange: (visibility: Visibility) => void;
  onUpdate: () => void;
  onCancel: () => void;
  onGenerateWithAI: () => void;
  arkId: string;
  updateStatus: "idle" | "updating" | "success" | "error";
  hasChanges: boolean;
  reviewStates?: ReviewStates;
  onReviewAction?: (fieldName: string, action: "approve" | "reject") => void;
  onScrollToField?: (fieldName: string) => void;
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
  reviewStates = {},
  onReviewAction,
  onScrollToField,
}) => {
  const { reviewed, total } = getReviewProgress(reviewStates);
  const allReviewed = total > 0 ? reviewed === total : true;
  const percentage = total > 0 ? (reviewed / total) * 100 : 0;

  const sortedFields = Object.values(reviewStates).sort((a, b) => {
    if (a.status === ReviewStatus.Pending && b.status !== ReviewStatus.Pending)
      return -1;
    if (a.status !== ReviewStatus.Pending && b.status === ReviewStatus.Pending)
      return 1;
    return 0;
  });

  const formatFieldName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string")
      return value.substring(0, 50) + (value.length > 50 ? "..." : "");
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === "object")
      return JSON.stringify(value).substring(0, 50) + "...";
    return String(value);
  };

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
            disabled={
              !hasChanges || updateStatus === "updating" || !allReviewed
            }
          >
            <FiSave />
            <span>{updateStatus === "updating" ? "Saving..." : "Save"}</span>
          </ActionButton>

          {!allReviewed && hasChanges && (
            <SaveWarning>Complete all reviews before saving</SaveWarning>
          )}

          <ActionButton onClick={onCancel}>
            <FiX />
            <span>Cancel</span>
          </ActionButton>
        </Section>
        {total > 0 && (
          <>
            <Section>
              <SectionTitle>Review Progress</SectionTitle>
              <ProgressBar>
                <ProgressFill percentage={percentage} />
              </ProgressBar>
              <ProgressText>
                {reviewed} of {total} reviewed
              </ProgressText>

              <FieldsList>
                {sortedFields.map((field) => (
                  <FieldItem key={field.fieldName} status={field.status}>
                    <FieldHeader
                      onClick={() => onScrollToField?.(field.fieldName)}
                      clickable={!!onScrollToField}
                    >
                      <FieldName>{formatFieldName(field.fieldName)}</FieldName>
                      <StatusIndicator status={field.status}>
                        {field.status === ReviewStatus.Pending && "⏳"}
                        {field.status === ReviewStatus.Approved && "✓"}
                        {field.status === ReviewStatus.Rejected && "✗"}
                      </StatusIndicator>
                    </FieldHeader>

                    {field.status === ReviewStatus.Pending && (
                      <>
                        <ValuePreview>
                          {formatValue(field.llmValue)}
                        </ValuePreview>
                        <Actions>
                          <ActionButtonSmall
                            onClick={() =>
                              onReviewAction?.(field.fieldName, "approve")
                            }
                            variant="approve"
                          >
                            Approve
                          </ActionButtonSmall>
                          <ActionButtonSmall
                            onClick={() =>
                              onReviewAction?.(field.fieldName, "reject")
                            }
                            variant="reject"
                          >
                            Reject
                          </ActionButtonSmall>
                        </Actions>
                      </>
                    )}
                  </FieldItem>
                ))}
              </FieldsList>
            </Section>

            <Divider />
          </>
        )}

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

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => percentage}%;
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 16px;
`;

const FieldsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const FieldItem = styled.div<{ status: ReviewStatus }>`
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid
    ${({ status }) =>
      status === ReviewStatus.Pending
        ? "#f59e0b"
        : status === ReviewStatus.Approved
        ? "#10b981"
        : "#ef4444"};
  background-color: ${({ status }) =>
    status === ReviewStatus.Pending
      ? "#fffbeb"
      : status === ReviewStatus.Approved
      ? "#f0fdf4"
      : "#fef2f2"};
`;

const FieldHeader = styled.div<{ clickable: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};

  &:hover {
    opacity: ${({ clickable }) => (clickable ? 0.7 : 1)};
  }
`;

const FieldName = styled.span`
  font-weight: 600;
  font-size: 0.75rem;
  color: #111827;
`;

const StatusIndicator = styled.span<{ status: ReviewStatus }>`
  font-size: 0.875rem;
  color: ${({ status }) =>
    status === ReviewStatus.Pending
      ? "#f59e0b"
      : status === ReviewStatus.Approved
      ? "#10b981"
      : "#ef4444"};
`;

const ValuePreview = styled.div`
  font-size: 0.7rem;
  color: #6b7280;
  margin-bottom: 6px;
  font-style: italic;
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButtonSmall = styled.button<{ variant: "approve" | "reject" }>`
  flex: 1;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background-color: ${({ variant }) =>
    variant === "approve" ? "#10b981" : "#ef4444"};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const SaveWarning = styled.div`
  font-size: 0.7rem;
  color: #f59e0b;
  text-align: center;
  margin-top: -4px;
  margin-bottom: 8px;
  font-weight: 600;
`;

export default EditActionSidebar;

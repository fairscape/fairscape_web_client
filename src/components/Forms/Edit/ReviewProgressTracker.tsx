import React from "react";
import styled from "styled-components";
import { ReviewStatus, ReviewStates } from "../types/reviewTypes";
import { getReviewProgress } from "../utils/llmUtils";

interface ReviewProgressTrackerProps {
  reviewStates: ReviewStates;
  onApprove: (fieldName: string) => void;
  onReject: (fieldName: string) => void;
  onScrollToField?: (fieldName: string) => void;
}

const ReviewProgressTracker: React.FC<ReviewProgressTrackerProps> = ({
  reviewStates,
  onApprove,
  onReject,
  onScrollToField,
}) => {
  const { reviewed, total } = getReviewProgress(reviewStates);

  if (total === 0) {
    return null;
  }

  const percentage = total > 0 ? (reviewed / total) * 100 : 0;

  const sortedFields = Object.values(reviewStates).sort((a, b) => {
    if (a.status === ReviewStatus.Pending && b.status !== ReviewStatus.Pending)
      return -1;
    if (a.status !== ReviewStatus.Pending && b.status === ReviewStatus.Pending)
      return 1;
    return 0;
  });

  return (
    <Container>
      <Header>Review Progress</Header>
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
                <ValuePreview>{formatValue(field.llmValue)}</ValuePreview>
                <Actions>
                  <ActionButton
                    onClick={() => onApprove(field.fieldName)}
                    variant="approve"
                  >
                    Approve
                  </ActionButton>
                  <ActionButton
                    onClick={() => onReject(field.fieldName)}
                    variant="reject"
                  >
                    Reject
                  </ActionButton>
                </Actions>
              </>
            )}
          </FieldItem>
        ))}
      </FieldsList>
    </Container>
  );
};

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

const Container = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const Header = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
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
  max-height: 400px;
  overflow-y: auto;
`;

const FieldItem = styled.div<{ status: ReviewStatus }>`
  padding: 12px;
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
  margin-bottom: 8px;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};

  &:hover {
    opacity: ${({ clickable }) => (clickable ? 0.7 : 1)};
  }
`;

const FieldName = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
`;

const StatusIndicator = styled.span<{ status: ReviewStatus }>`
  font-size: 1rem;
  color: ${({ status }) =>
    status === ReviewStatus.Pending
      ? "#f59e0b"
      : status === ReviewStatus.Approved
      ? "#10b981"
      : "#ef4444"};
`;

const ValuePreview = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 8px;
  font-style: italic;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant: "approve" | "reject" }>`
  flex: 1;
  padding: 6px 12px;
  font-size: 0.75rem;
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

export default ReviewProgressTracker;

import React from "react";
import styled from "styled-components";
import {
  FiDownload,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

interface ActionSidebarProps {
  onDownload: () => void;
  onSave: () => void;
  onStartOver: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isAllSectionsReviewed: boolean;
  isReviewRequired: boolean;
  reviewProgress?: {
    reviewed: number;
    total: number;
  };
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  onDownload,
  onSave,
  onStartOver,
  saveStatus,
  isAllSectionsReviewed,
  isReviewRequired,
  reviewProgress,
}) => {
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
    <SidebarContainer>
      <SidebarContent>
        <Title>Actions</Title>

        {isReviewRequired && reviewProgress && (
          <ReviewStatusCard complete={isAllSectionsReviewed}>
            <StatusIcon>
              {isAllSectionsReviewed ? <FiCheckCircle /> : <FiAlertCircle />}
            </StatusIcon>
            <StatusText>
              {isAllSectionsReviewed ? "Review Complete" : "Review Required"}
            </StatusText>
            <ProgressText>
              {reviewProgress.reviewed} of {reviewProgress.total} sections
              reviewed
            </ProgressText>
          </ReviewStatusCard>
        )}

        <ActionButton
          onClick={onDownload}
          variant="primary"
          disabled={isReviewRequired && !isAllSectionsReviewed}
        >
          <FiDownload />
          <ButtonText>
            {isReviewRequired ? "Download Reviewed" : "Download Release"}
          </ButtonText>
          {isReviewRequired && !isAllSectionsReviewed && (
            <DisabledText>Complete review first</DisabledText>
          )}
        </ActionButton>

        <ActionButton
          onClick={onSave}
          variant="secondary"
          disabled={saveStatus === "saving"}
        >
          <FiSave />
          <ButtonText>{getSaveButtonText()}</ButtonText>
        </ActionButton>

        <Divider />

        <ActionButton onClick={onStartOver} variant="danger">
          <FiRefreshCw />
          <ButtonText>Start Over</ButtonText>
        </ActionButton>
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
  border: 1px solid #e0e0e0;
`;

const Title = styled.h3`
  font-size: 18px;
  color: #3e7aa8;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const ReviewStatusCard = styled.div<{ complete: boolean }>`
  background: ${(props) => (props.complete ? "#d4edda" : "#fff3cd")};
  border: 1px solid ${(props) => (props.complete ? "#c3e6cb" : "#ffeeba")};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  text-align: center;
`;

const StatusIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  color: ${(props) =>
    props.children?.props?.children === FiCheckCircle ? "#28a745" : "#ffc107"};
`;

const StatusText = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #666;
`;

const ActionButton = styled.button<{ variant: string }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px;
  margin-bottom: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  ${({ variant }) => {
    switch (variant) {
      case "primary":
        return `
          background: #3e7aa8;
          color: white;
          &:hover:not(:disabled) {
            background: #2c5f8d;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        `;
      case "secondary":
        return `
          background: #6c757d;
          color: white;
          &:hover:not(:disabled) {
            background: #5a6268;
            transform: translateY(-2px);
          }
        `;
      case "danger":
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
            transform: translateY(-2px);
          }
        `;
      default:
        return "";
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    font-size: 20px;
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
`;

const DisabledText = styled.span`
  font-size: 11px;
  opacity: 0.8;
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
`;

export default ActionSidebar;

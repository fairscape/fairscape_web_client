import React from "react";
import styled from "styled-components";
import { ReviewStatus } from "../types/reviewTypes";

interface FieldReviewBadgeProps {
  status: ReviewStatus;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const FieldReviewBadge: React.FC<FieldReviewBadgeProps> = ({
  status,
  onApprove,
  onReject,
  showActions = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case ReviewStatus.Pending:
        return { text: "Needs Review", color: "#f59e0b" };
      case ReviewStatus.Approved:
        return { text: "Reviewed ✓", color: "#10b981" };
      case ReviewStatus.Rejected:
        return { text: "Rejected", color: "#ef4444" };
      default:
        return { text: "", color: "#6b7280" };
    }
  };

  const config = getStatusConfig();

  return (
    <Container>
      <Badge color={config.color}>{config.text}</Badge>
      {showActions && status === ReviewStatus.Pending && (
        <Actions>
          <ActionButton onClick={onApprove} color="#10b981">
            ✓
          </ActionButton>
          <ActionButton onClick={onReject} color="#ef4444">
            ✗
          </ActionButton>
        </Actions>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
`;

const Badge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background-color: ${({ color }) => color};
  border-radius: 4px;
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button<{ color: string }>`
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  background-color: ${({ color }) => color};
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export default FieldReviewBadge;

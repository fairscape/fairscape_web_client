import React from "react";
import styled from "styled-components";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface ReviewManagerProps {
  reviewState: any;
  totalSections: number;
  isAllReviewed: boolean;
}

const ReviewManager: React.FC<ReviewManagerProps> = ({
  reviewState,
  totalSections,
  isAllReviewed,
}) => {
  const reviewedCount = Object.values(reviewState).filter(
    (state: any) => state.reviewed,
  ).length;
  const progress = (reviewedCount / totalSections) * 100;

  return (
    <ReviewContainer>
      <ReviewHeader>
        {isAllReviewed ? (
          <>
            <FiCheckCircle size={20} /> All Sections Reviewed
          </>
        ) : (
          <>
            <FiAlertCircle size={20} /> Review Required
          </>
        )}
      </ReviewHeader>
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>
      <ProgressText>
        {reviewedCount} of {totalSections} sections reviewed
      </ProgressText>
    </ReviewContainer>
  );
};

const ReviewContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ReviewHeader = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 18px;
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.3);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: white;
  height: 100%;
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

export default ReviewManager;

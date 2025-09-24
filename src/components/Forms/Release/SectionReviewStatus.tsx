import React, { useState } from "react";
import styled from "styled-components";
import { FiCheck, FiAlertCircle } from "react-icons/fi";

interface SectionReviewStatusProps {
  sectionId: string;
  sectionName: string;
  isReviewed: boolean;
  isReviewMode: boolean;
  onReview: (reviewData: any) => void;
}

const SectionReviewStatus: React.FC<SectionReviewStatusProps> = ({
  sectionId,
  sectionName,
  isReviewed,
  isReviewMode,
  onReview,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [comments, setComments] = useState("");

  const handleReview = () => {
    if (!acknowledged) {
      alert("Please acknowledge that you have reviewed the section.");
      return;
    }

    onReview({
      reviewed: true,
      comments,
    });

    setShowReviewModal(false);
    setAcknowledged(false);
    setComments("");
  };

  if (isReviewed) {
    return (
      <ReviewedContainer>
        <FiCheck /> This section has been reviewed and acknowledged
      </ReviewedContainer>
    );
  }

  return (
    <>
      <PendingContainer>
        <WarningMessage>
          <FiAlertCircle /> This section requires review
          {isReviewMode && " before editing"}
        </WarningMessage>
        <ReviewButton onClick={() => setShowReviewModal(true)}>
          Review & Acknowledge
        </ReviewButton>
      </PendingContainer>

      {showReviewModal && (
        <Modal>
          <ModalOverlay onClick={() => setShowReviewModal(false)} />
          <ModalContent>
            <ModalHeader>Review Section: {sectionName}</ModalHeader>
            <ModalBody>
              <ReviewInstructions>
                Please carefully review all information in this section. By
                acknowledging, you confirm that the information is accurate and
                complete.
              </ReviewInstructions>

              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  id={`ack-${sectionId}`}
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                <CheckboxLabel htmlFor={`ack-${sectionId}`}>
                  I have reviewed this section and confirm the information is
                  accurate
                </CheckboxLabel>
              </CheckboxContainer>

              <CommentsField>
                <CommentsLabel>Optional Comments:</CommentsLabel>
                <CommentsTextarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any notes or comments about this section..."
                  rows={3}
                />
              </CommentsField>
            </ModalBody>
            <ModalFooter>
              <ConfirmButton onClick={handleReview} disabled={!acknowledged}>
                Confirm Review
              </ConfirmButton>
              <CancelButton onClick={() => setShowReviewModal(false)}>
                Cancel
              </CancelButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

const ReviewedContainer = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

const PendingContainer = styled.div`
  background: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WarningMessage = styled.div`
  color: #856404;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

const ReviewButton = styled.button`
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e0a800;
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  z-index: 1001;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 20px;
  font-weight: 600;
  color: #3e7aa8;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ReviewInstructions = styled.p`
  margin-bottom: 20px;
  color: #666;
  line-height: 1.5;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
`;

const Checkbox = styled.input`
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  flex: 1;
  cursor: pointer;
  font-weight: 500;
`;

const CommentsField = styled.div`
  margin-top: 20px;
`;

const CommentsLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const CommentsTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ConfirmButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #5a6268;
  }
`;

export default SectionReviewStatus;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FiClock,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { Card } from "../ReleaseComponents";
import {
  getSavedCratesList,
  deleteSavedCrate,
  loadCrate,
} from "../utils/storageUtils";

interface SavedCrate {
  formData: any;
  reviewState?: any;
  metadata: {
    id: string;
    name: string;
    savedAt: string;
    reviewProgress?: {
      reviewed: number;
      total: number;
    };
    lastModified: string;
  };
}

interface SavedCrateSelectorProps {
  onCrateSelect: (data: { formData: any; reviewState?: any }) => void;
  onBack?: () => void;
  hideBackButton?: boolean;
}

const SavedCrateSelector: React.FC<SavedCrateSelectorProps> = ({
  onCrateSelect,
  onBack,
  hideBackButton = false,
}) => {
  const [savedCrates, setSavedCrates] = useState<SavedCrate[]>([]);

  useEffect(() => {
    const loadSavedCrates = () => {
      const crates = getSavedCratesList();
      setSavedCrates(crates);
    };

    loadSavedCrates();
  }, []);

  const handleDeleteCrate = (crateId: string, crateName: string) => {
    if (window.confirm(`Are you sure you want to delete "${crateName}"?`)) {
      if (deleteSavedCrate(crateId)) {
        setSavedCrates((prev) =>
          prev.filter((crate) => crate.metadata.id !== crateId),
        );
      } else {
        alert("Failed to delete the saved crate. Please try again.");
      }
    }
  };

  const handleLoadCrate = (crateId: string) => {
    const data = loadCrate(crateId);
    if (data) {
      onCrateSelect(data);
    } else {
      alert("Failed to load the saved crate. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <Header>
        <Title>Continue from Saved Crate</Title>
      </Header>

      {savedCrates.length === 0 ? (
        <EmptyState>
          <EmptyText>No saved crates found.</EmptyText>
        </EmptyState>
      ) : (
        <CrateList>
          {savedCrates.map((crate) => {
            const hasReviewData = crate.metadata.reviewProgress;
            const isFullyReviewed =
              hasReviewData &&
              crate.metadata.reviewProgress?.reviewed ===
                crate.metadata.reviewProgress?.total;

            return (
              <CrateItem key={crate.metadata.id}>
                <CrateInfo>
                  <CrateName>{crate.metadata.name}</CrateName>
                  <CrateId>ID: {crate.metadata.id}</CrateId>

                  {hasReviewData && (
                    <ReviewStatus complete={isFullyReviewed}>
                      {isFullyReviewed ? <FiCheckCircle /> : <FiAlertCircle />}
                      <span>
                        {crate.metadata.reviewProgress?.reviewed}/
                        {crate.metadata.reviewProgress?.total} sections reviewed
                      </span>
                    </ReviewStatus>
                  )}

                  <DateInfo>
                    <FiClock size={14} />
                    <span>Last modified: {formatDate(crate.lastModified)}</span>
                  </DateInfo>
                </CrateInfo>
                <ButtonGroup>
                  <LoadButton
                    onClick={() => handleLoadCrate(crate.metadata.id)}
                  >
                    Load
                  </LoadButton>
                  <DeleteButton
                    onClick={() =>
                      handleDeleteCrate(crate.metadata.id, crate.metadata.name)
                    }
                  >
                    <FiTrash2 />
                  </DeleteButton>
                </ButtonGroup>
              </CrateItem>
            );
          })}
        </CrateList>
      )}
    </Card>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #3e7aa8;
  font-size: 24px;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyText = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 20px;
`;

const CrateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CrateItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  background: #f7f9f9;
  transition: all 0.2s;

  &:hover {
    background: #ebf2f4;
  }
`;

const CrateInfo = styled.div`
  flex: 1;
`;

const CrateName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
`;

const CrateId = styled.div`
  font-family: monospace;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const ReviewStatus = styled.div<{ complete?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 2px;
  font-size: 13px;
  margin-bottom: 8px;
  background: ${(e) => (e.complete ? "#d4edda" : "#fff3cd")};
  color: ${(e) => (e.complete ? "#155724" : "#856404")};
  border: 1px solid ${(e) => (e.complete ? "#c3e6cb" : "#ffeeba")};

  svg {
    font-size: 14px;
  }
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const LoadButton = styled.button`
  padding: 8px 16px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #2c5f8d;
  }
`;

const DeleteButton = styled.button`
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background: #c82333;
  }
`;

export default SavedCrateSelector;

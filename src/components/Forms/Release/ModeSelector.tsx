import React from "react";
import styled from "styled-components";

interface ModeSelectorProps {
  onModeSelect: (mode: "new" | "edit" | "review") => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onModeSelect }) => {
  return (
    <ChoiceContainer>
      <ChoiceCard onClick={() => onModeSelect("new")}>
        <ChoiceIcon>📝</ChoiceIcon>
        <ChoiceTitle>Start/Edit a Release</ChoiceTitle>
        <ChoiceDescription>
          Create a new release from scratch with optional AI assistance or edit
          an existing release.
        </ChoiceDescription>
      </ChoiceCard>

      <ChoiceCard onClick={() => onModeSelect("review")}>
        <ChoiceIcon>✅</ChoiceIcon>
        <ChoiceTitle>Review an Existing Release</ChoiceTitle>
        <ChoiceDescription>
          Review and approve a release draft
        </ChoiceDescription>
        <ReviewBadge>Review Mode</ReviewBadge>
      </ChoiceCard>
    </ChoiceContainer>
  );
};

const ChoiceContainer = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-top: 50px;
  flex-wrap: wrap;
`;

const ChoiceCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 40px;
  width: 280px;
  text-align: center;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #3e7aa8;
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(62, 122, 168, 0.2);
  }
`;

const ChoiceIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const ChoiceTitle = styled.h3`
  color: #3e7aa8;
  margin-bottom: 10px;
`;

const ChoiceDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 0;
`;

const ReviewBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

export default ModeSelector;

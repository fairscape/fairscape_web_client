import React from "react";
import styled from "styled-components";

interface ModeSelectorProps {
  onModeSelect: (mode: "start" | "review") => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onModeSelect }) => {
  return (
    <Container>
      <CardsContainer>
        <Card onClick={() => onModeSelect("start")}>
          <CardTitle>Start New RO-Crate</CardTitle>
          <CardDescription>
            Create a new RO-Crate from scratch or with AI using documentation or
            existing data
          </CardDescription>
        </Card>

        <Card onClick={() => onModeSelect("review")}>
          <CardTitle>Review Existing RO-Crate</CardTitle>
          <CardDescription>
            Upload and review an existing ro-crate-metadata.json file
          </CardDescription>
        </Card>
      </CardsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 12px 40px;
`;

const Title = styled.h2`
  font-size: 1.35rem;
  color: #2f5878;
  margin: 0 0 8px 0;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e7e7e9;
  border-radius: 2px;
  padding: 18px;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;
  outline: none;

  &:hover,
  &:focus {
    border-color: #3e7aa8;
  }
`;

const CardTitle = styled.h3`
  color: #3e7aa8;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const CardDescription = styled.p`
  margin-top: 10px;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
`;

export default ModeSelector;

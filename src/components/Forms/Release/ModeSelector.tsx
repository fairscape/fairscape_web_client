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
  align-items: center;
  padding: 40px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 30px;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 800px;
  width: 100%;
`;

const Card = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3e7aa8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: #3e7aa8;
  margin-bottom: 15px;
`;

const CardDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
`;

export default ModeSelector;

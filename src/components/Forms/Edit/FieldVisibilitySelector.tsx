import React from "react";
import styled from "styled-components";

interface FieldVisibilitySelectorProps {
  visibility: "minimal" | "ai-ready" | "all";
  onChange: (visibility: "minimal" | "ai-ready" | "all") => void;
  disabled?: boolean;
  fieldCounts?: {
    minimal: number;
    aiReady: number;
    all: number;
  };
}

const FieldVisibilitySelector: React.FC<FieldVisibilitySelectorProps> = ({
  visibility,
  onChange,
  disabled = false,
  fieldCounts,
}) => {
  return (
    <Container>
      <Label>Field Visibility</Label>
      <ButtonGroup>
        <VisibilityButton
          active={visibility === "minimal"}
          onClick={() => onChange("minimal")}
          disabled={disabled}
        >
          Minimal
          {fieldCounts && <Count>({fieldCounts.minimal})</Count>}
        </VisibilityButton>
        <VisibilityButton
          active={visibility === "ai-ready"}
          onClick={() => onChange("ai-ready")}
          disabled={disabled}
        >
          AI-Ready
          {fieldCounts && <Count>({fieldCounts.aiReady})</Count>}
        </VisibilityButton>
        <VisibilityButton
          active={visibility === "all"}
          onClick={() => onChange("all")}
          disabled={disabled}
        >
          All
          {fieldCounts && <Count>({fieldCounts.all})</Count>}
        </VisibilityButton>
      </ButtonGroup>
      {disabled && (
        <DisabledMessage>
          Visibility locked to "All" after LLM processing
        </DisabledMessage>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border-radius: 2px;
  padding: 20px;
  border: 1px solid #e2e8ea;
`;

const Label = styled.div`
  font-size: 0.875rem;
  color: #51626b;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const VisibilityButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background-color: ${({ variant }) => (variant === "approve" ? "#10b981" : "#ef4444")};
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Count = styled.span`
  margin-left: 4px;
  font-weight: 400;
  opacity: 0.8;
`;

const DisabledMessage = styled.div`
  margin-top: 8px;
  font-size: 0.75rem;
  color: #51626b;
  text-align: center;
`;

export default FieldVisibilitySelector;

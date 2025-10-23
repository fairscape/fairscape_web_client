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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const Label = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const VisibilityButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ active }) => (active ? "white" : "#374151")};
  background-color: ${({ active }) => (active ? "#3b82f6" : "white")};
  border: 1px solid ${({ active }) => (active ? "#3b82f6" : "#d1d5db")};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${({ active }) => (active ? "#2563eb" : "#f9fafb")};
    border-color: ${({ active }) => (active ? "#2563eb" : "#9ca3af")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
  color: #6b7280;
  font-style: italic;
`;

export default FieldVisibilitySelector;

import React from "react";
import styled from "styled-components";

type ViewType = "metadata" | "serialization" | "graph";

interface ButtonGroupProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  showEvidenceGraphButton?: boolean;
}

const Group = styled.div`
  display: inline-flex;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
`;

const Button = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover:not(:disabled) {
    background-color: ${({ $active }) =>
      $active ? "white" : "rgba(255, 255, 255, 0.5)"};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $active }) =>
    $active &&
    `
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
`;

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  currentView,
  onSelectView,
  showEvidenceGraphButton = true,
}) => {
  return (
    <Group role="group" aria-label="Metadata View Options">
      <Button
        $active={currentView === "metadata"}
        onClick={() => onSelectView("metadata")}
      >
        Metadata
      </Button>
      <Button
        $active={currentView === "serialization"}
        onClick={() => onSelectView("serialization")}
      >
        Serialization
      </Button>
      {showEvidenceGraphButton && (
        <Button
          $active={currentView === "graph"}
          onClick={() => onSelectView("graph")}
        >
          Evidence Graph
        </Button>
      )}
    </Group>
  );
};

export default ButtonGroup;

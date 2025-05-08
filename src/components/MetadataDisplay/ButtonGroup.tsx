import React from "react";
import styled from "styled-components";

type ViewType = "metadata" | "serialization" | "graph";

interface ButtonGroupProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  showEvidenceGraphButton?: boolean;
  showExplorerButton?: boolean; // Added prop
  explorerArkId?: string; // Added prop
}

const Group = styled.div`
  display: inline-flex;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
`;

const BaseButtonStyles = `
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;
  text-decoration: none; // For <a> tags that look like buttons

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
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
`;

const Button = styled.button<{ $active?: boolean }>`
  ${BaseButtonStyles}
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};

  &:hover:not(:disabled) {
    background-color: ${({ $active }) =>
      $active ? "white" : "rgba(255, 255, 255, 0.5)"};
  }

  ${({ $active }) =>
    $active &&
    `
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
`;

// New styled component for the link, inheriting common styles
const LinkButton = styled.a`
  ${BaseButtonStyles}
  background-color: transparent; // Always like a non-active button
  color: ${({ theme }) =>
    theme.colors.textSecondary}; // Always like a non-active button

  &:hover {
    background-color: rgba(
      255,
      255,
      255,
      0.5
    ); // Hover like a non-active button
  }
`;

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  currentView,
  onSelectView,
  showEvidenceGraphButton = true,
  showExplorerButton,
  explorerArkId,
}) => {
  const explorerUrl = explorerArkId
    ? `http://localhost:8050/?ark=${explorerArkId}`
    : "#";

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
      {showExplorerButton && explorerArkId && (
        <LinkButton
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Explorer
        </LinkButton>
      )}
    </Group>
  );
};

export default ButtonGroup;

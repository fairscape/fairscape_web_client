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
  border-radius: 2px;
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
  padding: 8px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ theme, $active, $disabled }) => {
    var e, l, c;
    return $disabled
      ? (((e = theme == null ? void 0 : theme.colors) == null
          ? void 0
          : e.textSecondary) || "#51626B") + "80"
      : $active
        ? ((l = theme == null ? void 0 : theme.colors) == null
            ? void 0
            : l.primary) || "#007bff"
        : ((c = theme == null ? void 0 : theme.colors) == null
            ? void 0
            : c.textSecondary) || "#51626B";
  }};
  border: none;
  border-radius: 2px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;

  &:hover:not(:disabled) {
    background-color: ${({ $active }) => ($active ? "white" : "rgba(255, 255, 255, 0.5)")};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
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
    </Group>
  );
};

export default ButtonGroup;

// src/components/common/Alert.tsx
import React from "react";
import styled from "styled-components";
import { ThemeType } from "../../styles/theme";

type AlertType = "error" | "success" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void; // Optional close handler
}

const AlertContainer = styled.div<{ $type: AlertType }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid;
  background-color: ${({ theme, $type }) =>
    theme.colors[$type] + "20"}; // Use theme color with opacity
  border-color: ${({ theme, $type }) => theme.colors[$type]};
  color: ${({ theme, $type }) => theme.colors[$type]};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: flex-start; // Align icon and text nicely
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AlertContent = styled.div`
  flex-grow: 1;
`;

const AlertTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: inherit; // Inherit color from container
`;

const AlertMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: inherit; // Inherit color from container
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit; // Inherit color from container
  opacity: 0.7;
  font-size: 1.2rem;
  padding: 0;
  margin-left: ${({ theme }) => theme.spacing.md};
  &:hover {
    opacity: 1;
  }
`;

// Use theme from the component props instead of importing it directly
const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  return (
    <AlertContainer $type={type}>
      <div
        style={{
          // Placeholder for icon
          width: "20px",
          height: "20px",
          marginRight: "8px",
          flexShrink: 0,
          marginTop: "2px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          border: "2px solid currentColor",
        }}
      >
        !
      </div>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{message}</AlertMessage>
      </AlertContent>
      {onClose && (
        <CloseButton onClick={onClose} aria-label="Close Alert">
          ×
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default Alert;

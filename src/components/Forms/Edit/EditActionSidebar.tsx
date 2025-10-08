import React from "react";
import styled from "styled-components";
import { FiSave, FiX, FiExternalLink } from "react-icons/fi";

interface EditActionSidebarProps {
  onUpdate: () => void;
  onCancel: () => void;
  arkId: string;
  updateStatus: "idle" | "updating" | "success" | "error";
  hasChanges: boolean;
}

const EditActionSidebar: React.FC<EditActionSidebarProps> = ({
  onUpdate,
  onCancel,
  arkId,
  updateStatus,
  hasChanges,
}) => {
  const getUpdateButtonText = () => {
    switch (updateStatus) {
      case "updating":
        return "Updating...";
      case "success":
        return "Updated!";
      case "error":
        return "Update Failed";
      default:
        return "Update Metadata";
    }
  };

  return (
    <SidebarContainer>
      <SidebarContent>
        <Title>Actions</Title>

        {hasChanges && (
          <ChangeIndicator>
            <IndicatorDot />
            Unsaved changes
          </ChangeIndicator>
        )}

        <ActionButton
          onClick={onUpdate}
          variant="primary"
          disabled={updateStatus === "updating" || !hasChanges}
        >
          <FiSave />
          <ButtonText>{getUpdateButtonText()}</ButtonText>
        </ActionButton>

        <ActionButton onClick={onCancel} variant="secondary">
          <FiX />
          <ButtonText>Cancel Changes</ButtonText>
        </ActionButton>

        <Divider />

        <ViewLink href={`/view/${arkId}`} target="_blank">
          <FiExternalLink />
          View Metadata Page
        </ViewLink>
      </SidebarContent>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  position: sticky;
  top: 20px;
  width: 250px;
  height: fit-content;
`;

const SidebarContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const ChangeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #856404;
  font-weight: 600;
`;

const IndicatorDot = styled.div`
  width: 8px;
  height: 8px;
  background: #ffc107;
  border-radius: 50%;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ActionButton = styled.button<{ variant: string }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px;
  margin-bottom: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  ${({ variant, theme }) => {
    switch (variant) {
      case "primary":
        return `
          background: ${theme.colors.primary};
          color: white;
          &:hover:not(:disabled) {
            background: ${theme.colors.primary};
            filter: brightness(0.9);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        `;
      case "secondary":
        return `
          background: ${theme.colors.textSecondary};
          color: white;
          &:hover:not(:disabled) {
            filter: brightness(0.9);
            transform: translateY(-2px);
          }
        `;
      default:
        return "";
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    font-size: 20px;
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ViewLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  svg {
    font-size: 16px;
  }
`;

export default EditActionSidebar;

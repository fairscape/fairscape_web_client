import styled from "styled-components";

export const UploaderContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background || "#ffffff"};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) =>
    theme.shadows?.subtle || "0 2px 4px rgba(0,0,0,0.06)"};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
`;

export const UploaderHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
`;

export const UploaderTitle = styled.h2`
  font-size: 22px;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

export const DropZone = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed
    ${({ theme, $isDragging }) =>
      $isDragging ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ theme, $isDragging }) =>
    $isDragging
      ? `${theme.colors.primary}08`
      : theme.colors.backgroundAlt || "#f9f9f9"};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}05`};
  }
`;

export const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const UploadIcon = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    width: 48px;
    height: 48px;
  }
`;

export const DropText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

export const BrowseButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const SupportedFormats = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin: 0;
`;

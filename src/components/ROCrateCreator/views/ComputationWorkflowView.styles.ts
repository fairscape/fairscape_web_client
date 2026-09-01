import styled from "styled-components";

export const ViewContainer = styled.div`
  max-width: 1100px; /* closer to old 1100 */
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background || "#ffffff"};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) =>
    theme.shadows?.subtle || "0 2px 4px rgba(0,0,0,0.06)"};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
  overflow: hidden;
`;

export const WorkflowHeader = styled.div`
  /* Old look: white header with colored bottom border */
  background: ${({ theme }) => theme.colors.background || "#ffffff"};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
`;

export const WorkflowTitle = styled.h2`
  font-size: 22px; /* old title size */
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

export const FormSection = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md}; /* tighter gap */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
`;

export const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

export const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 15px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const DragDropSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg}; /* tighter than xl */
  background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f9f9f9"};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Column = styled.div`
  min-height: 220px; /* down from 300 */
`;

export const ColumnHeader = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  text-transform: none; /* remove uppercase */
  letter-spacing: 0;
`;

export const DropZone = styled.div<{ $isDragging?: boolean }>`
  min-height: 150px; /* old vibe */
  max-height: 260px; /* much shorter */
  overflow-y: auto;
  border: 2px dashed
    ${({ theme, $isDragging }) =>
      $isDragging ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme, $isDragging }) =>
    $isDragging
      ? `${theme.colors.primary}08`
      : theme.colors.background || "#fff"};
  transition: all 0.2s ease;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundAlt || "#f1f1f1"};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

export const ObjectCard = styled.div<{ $dragging?: boolean }>`
  padding: 6px 8px; /* denser */
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  cursor: move;
  font-size: 13px; /* denser text */
  opacity: ${({ $dragging }) => ($dragging ? 0.5 : 1)};
  transition: background-color 0.15s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* remove heavy left accent & hover lift */
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f9f9f9"};
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    background-color: transparent;
    padding: 0;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg}; /* tighter */
  background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f9f9f9"};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export const SaveButton = styled.button<{ disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled || "#cccccc" : theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export const CancelButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f9f9f9"};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const RequiredIndicator = styled.span`
  color: ${({ theme }) => theme.colors.error || "#dc3545"};
  margin-left: 2px;
`;

export const HelperText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: -2px;
`;

import styled from "styled-components";

export const ViewContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background || "#ffffff"};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) =>
    theme.shadows?.card || "0 4px 8px rgba(0,0,0,0.08)"};
  overflow: hidden;
`;

export const EditorHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryDark}
  );
  color: white;
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const EditorTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

export const ObjectInfo = styled.div`
  font-size: 14px;
  opacity: 0.95;

  strong {
    font-weight: 600;
    margin: 0 ${({ theme }) => theme.spacing.xs};
  }
`;

export const TabContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f8f9fa"};
  padding: 0 ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const TabButton = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.background : "transparent"};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textSecondary};
  border: none;
  border-bottom: 3px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary : "transparent"};
  font-size: 15px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 500)};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -1px;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.background : `${theme.colors.background}80`};
  }
`;

export const TabContent = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  min-height: 400px;
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f8f9fa"};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SaveButton = styled.button<{ disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme, disabled }) =>
    disabled
      ? theme.colors.disabled || "#cccccc"
      : theme.colors.success || theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 15px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) =>
      theme.colors.successDark || theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

export const CancelButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f8f9fa"};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const ValidationStatus = styled.div<{ $hasErrors: boolean }>`
  margin: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ $hasErrors, theme }) =>
    $hasErrors
      ? `${theme.colors.error || "#dc3545"}10`
      : `${theme.colors.success || "#28a745"}10`};
  border: 1px solid
    ${({ $hasErrors, theme }) =>
      $hasErrors
        ? theme.colors.error || "#dc3545"
        : theme.colors.success || "#28a745"};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const ValidationMessage = styled.div`
  color: ${({ theme }) => theme.colors.error || "#dc3545"};
  font-size: 14px;

  ul {
    margin: ${({ theme }) => theme.spacing.sm} 0 0
      ${({ theme }) => theme.spacing.lg};
    padding: 0;

    li {
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }
  }
`;

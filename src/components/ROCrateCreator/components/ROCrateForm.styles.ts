import styled from "styled-components";

export const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background || "#ffffff"};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) =>
    theme.shadows?.subtle || "0 2px 4px rgba(0,0,0,0.06)"};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
`;

export const FormHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
`;

export const FormTitle = styled.h2`
  font-size: 22px;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

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
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
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
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const RequiredIndicator = styled.span`
  color: ${({ theme }) => theme.colors.error || "#dc3545"};
  margin-left: 2px;
`;

export const HelperText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: -4px;
`;

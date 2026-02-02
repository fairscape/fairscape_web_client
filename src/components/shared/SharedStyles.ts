import styled from "styled-components";

export const colors = {
  primary: "#3e7aa8",
  primaryHover: "#2c5a7a",
  primaryLight: "#f0f7fb",
  success: "#1e7e34",
  successLight: "#e6f4ea",
  error: "#d32f2f",
  errorLight: "#ffebee",
  warning: "#e65100",
  warningLight: "#fff3e0",
  text: "#333",
  textLight: "#666",
  border: "#e0e0e0",
  background: "#f5f5f5",
  white: "#ffffff",
};

export const spacing = {
  xs: "5px",
  sm: "10px",
  md: "15px",
  lg: "20px",
  xl: "30px",
  xxl: "40px",
};

export const typography = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  h1: "2rem",
  h2: "1.5rem",
  h3: "1.25rem",
  body: "1rem",
  small: "0.85rem",
  tiny: "0.75rem",
};

export const PrimaryButton = styled.button`
  padding: 12px 24px;
  background-color: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 6px;
  font-size: ${typography.body};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled.button`
  padding: 12px 24px;
  background-color: ${colors.white};
  color: ${colors.primary};
  border: 2px solid ${colors.primary};
  border-radius: 6px;
  font-size: ${typography.body};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.primaryLight};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Card = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: ${spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    border-color: ${colors.primary};
  }
`;

export const Section = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  padding: ${spacing.xl};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const SectionTitle = styled.h2`
  font-size: ${typography.h2};
  color: ${colors.primary};
  margin: 0 0 ${spacing.sm} 0;
`;

export const PageTitle = styled.h1`
  font-size: ${typography.h1};
  color: ${colors.primary};
  text-align: center;
  margin-bottom: ${spacing.xl};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;
`;

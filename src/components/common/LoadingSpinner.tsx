// src/components/common/LoadingSpinner.tsx
import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.background}; // Light border
  border-top: 4px solid ${({ theme }) => theme.colors.primary}; // Primary color for spinner part
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin: ${({ theme }) => theme.spacing.lg} auto; // Center it
`;

const LoadingSpinner: React.FC = () => <Spinner aria-label="Loading..." />;

export default LoadingSpinner;

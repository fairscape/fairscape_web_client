import styled from "styled-components";

// Container Components
export const SectionContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background || "#ffffff"};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) =>
    theme.shadows?.subtle || "0 2px 4px rgba(0,0,0,0.06)"};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
`;

export const SectionHeader = styled.h2`
  font-size: 22px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
`;

// Grid Components
export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;
`;

export const DetailItemRow = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  align-items: start;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.borderLight || "#f0f0f0"};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.sm} 0;
  }
`;

export const DetailLabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  padding-right: ${({ theme }) => theme.spacing.sm};
  line-height: 1.5;
  word-break: break-word;

  @media (max-width: 768px) {
    margin-bottom: 2px;
    padding-right: 0;
  }
`;

export const DetailValue = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) =>
    theme.colors.textSlightlyLighter || theme.colors.text};
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
  padding: 1px 0;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
`;

// List Components
export const ListStyled = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
`;

export const ListItemStyled = styled.li`
  margin-bottom: 5px;
`;

// Code Display
export const CodeBlockStyled = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f7f7f7"};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow-x: auto;
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.9em;
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
`;

// Link Buttons
export const ProminentLink = styled.a`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary || "#ff8c00"} !important;
  text-decoration: none !important;
  display: inline-block;
  padding: 3px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.secondary || "#ff8c00"};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary || "#ff8c00"};
    color: white !important;
    text-decoration: none !important;
  }

  &.embargoed {
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || "#757575"} !important;
    border-color: ${({ theme }) => theme.colors.border || "#ccc"} !important;
    background-color: transparent !important;
    font-style: italic;
    cursor: not-allowed;
    padding: 3px 6px;
    &:hover {
      color: ${({ theme }) =>
        theme.colors.textSlightlyLighter || "#757575"} !important;
      background-color: transparent !important;
    }
  }
`;

export const BrandLogo = styled.img`
  height: 24px;
  width: auto;
  margin-right: 8px;
`;

export const BrandedButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &.kaggle {
    background-color: #ffffff;
    color: #20beff !important;
    border: 1px solid #20beff;

    &:hover {
      background-color: #f0faff;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
  }
`;

// Keywords
export const KeywordPill = styled.span`
  display: inline-block;
  background-color: ${({ theme }) =>
    theme.colors.secondary || theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 13px;
  font-weight: 500;
  margin-right: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Table Components
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  table-layout: fixed;
`;

export const TableHeader = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

export const TableCell = styled.td<{ isDescription?: boolean }>`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  word-wrap: break-word;
  ${({ isDescription }) =>
    isDescription &&
    `
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

// Common UI Elements
export const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  max-width: 800px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
`;

export const ModalCloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// Download Button
export const DownloadButton = styled.a`
  display: inline-block;
  margin: ${({ theme }) => theme.spacing.md} 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export const ButtonContainer = styled.div`
  width: 100%;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

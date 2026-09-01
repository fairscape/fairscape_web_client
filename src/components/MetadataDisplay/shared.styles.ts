import styled from "styled-components";

// Container Components
export const SectionContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SectionHeader = styled.h2`
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: ${({ theme }) => theme.colors.ink};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 2px solid ${({ theme }) => theme.colors.ink};
`;

// Grid Components
export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
`;

export const DetailItemRow = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 200px) 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 13px 0;
  align-items: baseline;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

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
  font-size: 13px;
  font-weight: 550;
  color: ${({ theme }) => theme.colors.ink3};
  padding-right: ${({ theme }) => theme.spacing.sm};
  line-height: 1.5;
  word-break: break-word;

  @media (max-width: 768px) {
    margin-bottom: 2px;
    padding-right: 0;
  }
`;

export const DetailValue = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.ink};
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
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow-x: auto;
  font-family: ${({ theme }) => theme.fonts.mono};
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.9em;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

// Link Buttons
export const ProminentLink = styled.a`
  font-weight: 550;
  color: ${({ theme }) => theme.colors.primary} !important;
  text-decoration: none !important;
  display: inline-block;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background-color: ${({ theme }) => theme.colors.surface};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryTint};
    text-decoration: none !important;
  }

  &.embargoed {
    color: ${({ theme }) => theme.colors.ink3} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    background-color: transparent !important;
    font-style: italic;
    cursor: not-allowed;
    padding: 3px 8px;
    &:hover {
      color: ${({ theme }) => theme.colors.ink3} !important;
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
  transition: background-color 0.2s ease-in-out;

  &.kaggle {
    background-color: #ffffff;
    color: #20beff !important;
    border: 1px solid #20beff;

    &:hover {
      background-color: #f0faff;
    }
  }
`;

// Keywords
export const KeywordPill = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.lightGrey || "#EBF2F4"};
  color: ${({ theme }) => theme.colors.textSlightlyLighter || theme.colors.text};
  padding: 3px 7px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 12px;
  font-weight: 400;
  margin-right: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#C3CED2"};
`;

// Table Components
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  table-layout: fixed;

  thead {
    border-top: 2px solid ${({ theme }) => theme.colors.ink};
  }
`;

export const TableHeader = styled.th`
  text-align: left;
  padding: 9px ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.ink3};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TableCell = styled.td<{ isDescription?: boolean }>`
  text-align: left;
  padding: 11px ${({ theme }) => theme.spacing.md};
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
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ModalContent = styled.div`
  width: 100%;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.ink3};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.ink3};
  cursor: pointer;
  padding: 0;
  margin: 0 auto;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8em;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// Download Button
export const DownloadButton = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export const ButtonContainer = styled.div`
  margin-left: calc(-1 * ${({ theme }) => theme.spacing.lg});
  margin-right: calc(-1 * ${({ theme }) => theme.spacing.lg});
  width: calc(100% + 2 * ${({ theme }) => theme.spacing.lg});

  /* main's padding shrinks to spacing.md on mobile — mirror it here */
  @media (max-width: 768px) {
    margin-left: calc(-1 * ${({ theme }) => theme.spacing.md});
    margin-right: calc(-1 * ${({ theme }) => theme.spacing.md});
    width: calc(100% + 2 * ${({ theme }) => theme.spacing.md});
  }
`;

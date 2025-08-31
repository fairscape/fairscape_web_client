import styled from "styled-components";

export const TableContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background || "#ffffff"};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) =>
    theme.shadows?.subtle || "0 2px 4px rgba(0,0,0,0.06)"};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
`;

export const TableHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
`;

export const TableTitle = styled.h2`
  font-size: 22px;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHead = styled.thead``;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f9f9f9"};
  }
`;

export const TableHeaderCell = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

export const FileNameCell = styled.div`
  font-weight: 500;
  word-break: break-word;
  max-width: 300px;
`;

export const FileTypeSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const StatusBadge = styled.span<{ $isComplete: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ theme, $isComplete }) =>
    $isComplete ? "#d4edda" : "#f8d7da"};
  color: ${({ $isComplete }) => ($isComplete ? "#155724" : "#721c24")};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ActionButton = styled.button<{
  $variant: "primary" | "secondary";
}>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.primary : theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, $variant }) =>
      $variant === "primary"
        ? theme.colors.primaryDark
        : theme.colors.secondaryDark};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const RemoveButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.error || "#dc3545"};
  border: 1px solid ${({ theme }) => theme.colors.error || "#dc3545"};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.error || "#dc3545"};
    color: white;
  }
`;

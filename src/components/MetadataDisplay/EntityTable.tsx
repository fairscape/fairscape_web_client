import React from "react";
import styled from "styled-components";

const TableContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  table-layout: fixed;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const TableCell = styled.td<{ isDescription?: boolean }>`
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

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

export interface EntityItem {
  name: string;
  description: string;
  contentStatus?: string; // Access or other status
  date?: string;
  type?: string; // For 'other' types
  id?: string;
}

interface EntityTableProps {
  items: EntityItem[];
  headers: string[];
  emptyMessage?: string;
}

const EntityTable: React.FC<EntityTableProps> = ({
  items,
  headers,
  emptyMessage = "No items found.",
}) => {
  if (items.length === 0) {
    return <EmptyMessage>{emptyMessage}</EmptyMessage>;
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <TableHeader key={index}>{header}</TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell isDescription={true} title={item.description}>
                {item.description}
              </TableCell>
              <TableCell>{item.contentStatus}</TableCell>
              <TableCell>{item.date || item.type}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default EntityTable;

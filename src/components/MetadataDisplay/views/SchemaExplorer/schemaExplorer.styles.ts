import styled from "styled-components";

export const ExplorerContainer = styled.div`
  padding: 24px;
`;

export const TabBar = styled.div`
  display: flex;
  gap: 4px;
  background-color: #f0f2f5;
  border-radius: 2px;
  padding: 4px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#005f73" : "#51626B")};
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "white" : "#EBF2F4")};
    color: #005f73;
  }
`;

export const JoinKeyCard = styled.div`
  background: ${({ theme }) => theme.colors.primaryTint};
  border: 1px solid #b2d8e4;
  border-radius: 2px;
  padding: 16px 20px;
  margin-bottom: 20px;
`;

export const JoinKeyTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #005f73;
  font-size: 0.95rem;
  font-weight: 600;
`;

export const JoinKeyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const JoinKeyPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #94d2bd;
  border-radius: 2px;
  padding: 4px 12px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #005f73;
`;

export const JoinKeyCount = styled.span`
  background: #005f73;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
`;

export const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 8px 12px;
  border: 1px solid #e2e8ea;
  border-radius: 2px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #005f73;
  }

  &::placeholder {
    color: #84939a;
  }
`;

export const ColumnTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #e2e8ea;
    vertical-align: top;
    word-wrap: break-word;
  }

  th {
    background-color: #f7f9f9;
    font-weight: 600;
    font-size: 0.85rem;
    color: #005f73;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;

    &:hover {
      background-color: #ebf2f4;
    }
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 30%;
  }
  th:nth-child(2),
  td:nth-child(2) {
    width: 12%;
  }
  th:nth-child(3),
  td:nth-child(3) {
    width: 48%;
  }
  th:nth-child(4),
  td:nth-child(4) {
    width: 10%;
    text-align: center;
  }
`;

export const SortIcon = styled.span`
  margin-left: 4px;
  font-size: 0.75rem;
`;

export const RequiredBadge = styled.span`
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 2px;
  margin-left: 6px;
`;

export const TypeBadge = styled.span<{ $type?: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ $type }) => {
    switch ($type) {
      case "string":
        return "#e3f2fd";
      case "number":
        return "#fff3e0";
      case "integer":
        return "#fff8e1";
      case "boolean":
        return "#f3e5f5";
      case "array":
        return "#e8eaf6";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case "string":
        return "#1565c0";
      case "number":
        return "#e65100";
      case "integer":
        return "#f57f17";
      case "boolean":
        return "#7b1fa2";
      case "array":
        return "#283593";
      default:
        return "#616161";
    }
  }};
`;

export const ExpandableRow = styled.tr<{
  $expanded?: boolean;
  $isJoinKey?: boolean;
}>`
  cursor: pointer;

  ${({ $isJoinKey }) =>
    $isJoinKey &&
    `
    border-left: 3px solid #94d2bd;
    background-color: rgba(148, 210, 189, 0.06);
  `}

  &:hover {
    background-color: ${({ $isJoinKey }) => ($isJoinKey ? "rgba(148, 210, 189, 0.12)" : "#F7F9F9")};
  }

  ${({ $expanded }) =>
    $expanded &&
    `
    background-color: #f0f7f9;
    td { border-bottom: none; }
  `}
`;

export const DetailRow = styled.tr`
  td {
    padding: 0 12px 16px 12px;
    background-color: #f0f7f9;
  }
`;

export const DetailPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 12px 0;
`;

export const DetailItem = styled.div`
  font-size: 0.85rem;
`;

export const DetailItemLabel = styled.div`
  font-weight: 600;
  color: #51626b;
  margin-bottom: 2px;
`;

export const DetailItemValue = styled.div`
  color: #51626b;
  word-break: break-all;
`;

export const SchemaDescription = styled.p`
  color: #51626b;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

export const ColumnCount = styled.span`
  color: #51626b;
  font-size: 0.8rem;
  font-weight: normal;
  margin-left: 8px;
`;

export const JoinBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e8f4f8;
  color: #005f73;
  border-radius: 2px;
  padding: 1px 8px;
  font-size: 0.72rem;
  font-weight: 500;
  margin-left: 8px;
  white-space: nowrap;
`;

export const DiagramContainer = styled.div`
  width: 100%;
  height: 600px;
  border: 1px solid #e2e8ea;
  border-radius: 2px;
  overflow: hidden;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #51626b;
  font-size: 0.95rem;
`;

/* ---- ReactFlow table node styles ---- */

export const TableNodeContainer = styled.div`
  background: white;
  border: 2px solid #343a40;
  border-radius: 2px;
  overflow: hidden;
  min-width: 240px;
  font-size: 0.8rem;
`;

export const TableNodeHeader = styled.div`
  background: #005f73;
  color: white;
  padding: 8px 12px;
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
`;

export const TableNodeBody = styled.div`
  padding: 4px 0;
`;

export const TableNodeColumnRow = styled.div<{ $isJoinKey?: boolean }>`
  padding: 3px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: ${({ $isJoinKey }) => ($isJoinKey ? "#005f73" : "#51626B")};
  font-weight: ${({ $isJoinKey }) => ($isJoinKey ? "600" : "400")};
  border-bottom: 1px solid #f7f9f9;

  &:last-child {
    border-bottom: none;
  }
`;

export const TableNodeMoreRow = styled.div`
  padding: 3px 12px;
  font-size: 0.72rem;
  color: #84939a;
  font-style: italic;
  border-top: 1px solid #f7f9f9;
`;

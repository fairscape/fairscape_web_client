import styled from "styled-components";

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.06);
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
`;

const Counts = styled.div`
  display: flex;
  gap: 10px;
  color: #6b7280;
  font-size: 0.9rem;
  align-items: center;
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  background: #d1d5db;
  border-radius: 50%;
  display: inline-block;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f1f3;
`;

const Search = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  &:focus {
    border-color: #a5b4fc;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  thead tr {
    background: #fafafa;
  }
  th,
  td {
    padding: 12px 16px;
    text-align: left;
    vertical-align: top;
  }
  tbody tr + tr td {
    border-top: 1px solid #f2f2f2;
  }
`;

const Th = styled.th<{ $active?: boolean }>`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${(p) => (p.$active ? "#111827" : "#374151")};
  cursor: pointer;
  user-select: none;
`;

const Td = styled.td`
  font-size: 0.92rem;
  color: #1f2937;
`;

const EmptyCell = styled.td`
  text-align: center;
  padding: 28px 16px;
  color: #6b7280;
`;

const Name = styled.div`
  font-weight: 600;
  color: #111827;
`;

const Desc = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 2px;
  max-width: 55ch;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #eef2ff;
  color: #3730a3;
  &[data-type="Computation"] {
    background: #ecfdf5;
    color: #065f46;
  }
  &[data-type="Schema"] {
    background: #fff7ed;
    color: #9a3412;
  }
  &[data-type="Software"] {
    background: #eff6ff;
    color: #1e40af;
  }
  &[data-type="Dataset"] {
    background: #f0fdf4;
    color: #166534;
  }
`;

const Status = styled.span<{ $ok?: boolean }>`
  font-weight: 600;
  font-size: 0.85rem;
  color: ${(p) => (p.$ok ? "#065f46" : "#991b1b")};
`;

const Mono = styled.code`
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 360px;
  display: inline-block;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-start;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const DangerButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fff7f7;
  color: #b91c1c;
  cursor: pointer;
  &:hover {
    background: #fee2e2;
  }
`;

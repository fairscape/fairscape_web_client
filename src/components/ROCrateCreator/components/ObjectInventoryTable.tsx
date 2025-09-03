import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { MetadataObject } from "../types";
import { typeMatches, primaryTypeLabel } from "../utils/typeGuards";

type Props = {
  objects: MetadataObject[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

type SortKey = "name" | "type" | "status" | "source";

const ObjectInventoryTable: React.FC<Props> = ({
  objects,
  onEdit,
  onDelete,
}) => {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [typeFilter, setTypeFilter] = useState<
    "All" | "Dataset" | "Software" | "Computation" | "Schema"
  >("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return objects.filter((o) => {
      const typeOk = typeFilter === "All" || o["@type"] === typeFilter;
      const textOk =
        !q ||
        o.name?.toLowerCase().includes(q) ||
        o["@id"]?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q);
      return typeOk && textOk;
    });
  }, [objects, query, typeFilter]);

  const sorted = useMemo(() => {
    const getStatus = (o: MetadataObject) =>
      o.validation?.isComplete ? "Complete" : "Incomplete";
    const getSource = (o: MetadataObject) =>
      o["@type"] === "Dataset" || o["@type"] === "Software"
        ? o.fileData
          ? "Local file"
          : o.contentUrl
          ? "External URL"
          : "Unknown"
        : "—";

    const rows = [...filtered];
    rows.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      const av =
        sortKey === "name"
          ? a.name || ""
          : sortKey === "type"
          ? a["@type"]
          : sortKey === "status"
          ? getStatus(a)
          : getSource(a);
      const bv =
        sortKey === "name"
          ? b.name || ""
          : sortKey === "type"
          ? b["@type"]
          : sortKey === "status"
          ? getStatus(b)
          : getSource(b);
      return av.localeCompare(bv) * mul;
    });
    return rows;
  }, [filtered, sortKey, sortDir]);

  const counts = useMemo(() => {
    return {
      total: objects.length,
      Dataset: objects.filter((o) => typeMatches(o["@type"], "Dataset")).length,
      Software: objects.filter((o) => typeMatches(o["@type"], "Software"))
        .length,
      Computation: objects.filter((o) => typeMatches(o["@type"], "Computation"))
        .length,
      Schema: objects.filter((o) => typeMatches(o["@type"], "Schema")).length,
    };
  }, [objects]);

  const setSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  return (
    <Card>
      <CardHeader>
        <Title>Objects</Title>
        <Counts>
          <span>Total {counts.total}</span>
          <Dot />
          <span>Datasets {counts.Dataset}</span>
          <Dot />
          <span>Software {counts.Software}</span>
          <Dot />
          <span>Computations {counts.Computation}</span>
          <Dot />
          <span>Schemas {counts.Schema}</span>
        </Counts>
      </CardHeader>

      <Toolbar>
        <Search
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, id, or description…"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
        >
          <option>All</option>
          <option>Dataset</option>
          <option>Software</option>
          <option>Computation</option>
          <option>Schema</option>
        </Select>
      </Toolbar>

      <Table role="table">
        <thead>
          <tr>
            <Th onClick={() => setSort("name")} $active={sortKey === "name"}>
              Name {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </Th>
            <Th onClick={() => setSort("type")} $active={sortKey === "type"}>
              Type {sortKey === "type" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </Th>
            <Th>ID</Th>
            <Th
              onClick={() => setSort("status")}
              $active={sortKey === "status"}
            >
              Status{" "}
              {sortKey === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </Th>
            <Th
              onClick={() => setSort("source")}
              $active={sortKey === "source"}
            >
              Source{" "}
              {sortKey === "source" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <EmptyCell colSpan={6}>No objects match your filters.</EmptyCell>
            </tr>
          )}
          {sorted.map((o) => {
            const isData =
              o["@type"] === "Dataset" || o["@type"] === "Software";
            const status = o.validation?.isComplete ? "Complete" : "Incomplete";
            const source = isData
              ? o.fileData
                ? "Local file"
                : o.contentUrl
                ? "External URL"
                : "Unknown"
              : "—";
            return (
              <tr key={o["@id"]}>
                <Td>
                  <Name>{o.name || "(unnamed)"}</Name>
                  {o.description && <Desc>{o.description}</Desc>}
                </Td>
                <Td>
                  <TypeBadge
                    data-type={primaryTypeLabel(o["@type"])}
                    title={
                      Array.isArray(o["@type"])
                        ? o["@type"].join(", ")
                        : String(o["@type"] ?? "")
                    }
                  >
                    {primaryTypeLabel(o["@type"])}
                  </TypeBadge>
                </Td>

                <Td>
                  <Mono title={o["@id"]}>{o["@id"]}</Mono>
                </Td>
                <Td>
                  <Status $ok={o.validation?.isComplete === true}>
                    {status}
                  </Status>
                </Td>
                <Td>{source}</Td>
                <Td>
                  <Actions>
                    <ActionButton onClick={() => onEdit(o["@id"])}>
                      Edit
                    </ActionButton>
                    <DangerButton onClick={() => onDelete(o["@id"])}>
                      Delete
                    </DangerButton>
                  </Actions>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
};

export default ObjectInventoryTable;

// ————— styles —————
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
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

import React, { useState } from "react";
import {
  ColumnTable,
  SortIcon,
  RequiredBadge,
  TypeBadge,
  ExpandableRow,
  DetailRow,
  DetailPanel,
  DetailItem,
  DetailItemLabel,
  DetailItemValue,
  SearchInput,
  SchemaDescription,
  ColumnCount,
} from "./schemaExplorer.styles";
import { SectionHeader } from "../../shared.styles";

interface Property {
  type?: string;
  description?: string;
  index?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  items?: any;
  "value-url"?: string;
  [key: string]: any;
}

interface ColumnDetailPanelProps {
  schemaName: string;
  description?: string;
  properties: Record<string, Property>;
  required?: string[];
}

type SortField = "name" | "type";
type SortDir = "asc" | "desc";

const ColumnDetailPanel: React.FC<ColumnDetailPanelProps> = ({
  schemaName,
  description,
  properties,
  required = [],
}) => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedCol, setExpandedCol] = useState<string | null>(null);

  const requiredSet = new Set(required);

  const entries = Object.entries(properties)
    .filter(([name, prop]) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        name.toLowerCase().includes(q) ||
        (prop.description || "").toLowerCase().includes(q) ||
        (prop.type || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp: number;
      if (sortField === "name") {
        cmp = a[0].localeCompare(b[0]);
      } else {
        cmp = (a[1].type || "").localeCompare(b[1].type || "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " \u25B2" : " \u25BC";
  };

  const totalCols = Object.keys(properties).length;

  return (
    <div>
      <SectionHeader>
        {schemaName}
        <ColumnCount>{totalCols} columns</ColumnCount>
      </SectionHeader>
      {description && <SchemaDescription>{description}</SchemaDescription>}

      <SearchInput
        placeholder="Filter columns by name, type, or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ColumnTable>
        <thead>
          <tr>
            <th onClick={() => toggleSort("name")}>
              Name<SortIcon>{sortIndicator("name")}</SortIcon>
            </th>
            <th onClick={() => toggleSort("type")}>
              Type<SortIcon>{sortIndicator("type")}</SortIcon>
            </th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, prop]) => (
            <React.Fragment key={name}>
              <ExpandableRow
                $expanded={expandedCol === name}
                onClick={() =>
                  setExpandedCol(expandedCol === name ? null : name)
                }
              >
                <td>
                  <strong>{name}</strong>
                </td>
                <td>
                  <TypeBadge $type={prop.type}>{prop.type || "N/A"}</TypeBadge>
                </td>
                <td>{prop.description || "No description"}</td>
                <td style={{ textAlign: "center" }}>
                  {requiredSet.has(name) && (
                    <RequiredBadge>Required</RequiredBadge>
                  )}
                </td>
              </ExpandableRow>

              {expandedCol === name && (
                <DetailRow>
                  <td colSpan={4}>
                    <DetailPanel>
                      {prop.index !== undefined && (
                        <DetailItem>
                          <DetailItemLabel>Column Index</DetailItemLabel>
                          <DetailItemValue>{prop.index}</DetailItemValue>
                        </DetailItem>
                      )}
                      {prop.pattern && (
                        <DetailItem>
                          <DetailItemLabel>Pattern</DetailItemLabel>
                          <DetailItemValue>{prop.pattern}</DetailItemValue>
                        </DetailItem>
                      )}
                      {prop.minItems !== undefined && (
                        <DetailItem>
                          <DetailItemLabel>Min Items</DetailItemLabel>
                          <DetailItemValue>{prop.minItems}</DetailItemValue>
                        </DetailItem>
                      )}
                      {prop.maxItems !== undefined && (
                        <DetailItem>
                          <DetailItemLabel>Max Items</DetailItemLabel>
                          <DetailItemValue>{prop.maxItems}</DetailItemValue>
                        </DetailItem>
                      )}
                      {prop["value-url"] && (
                        <DetailItem>
                          <DetailItemLabel>Value URL</DetailItemLabel>
                          <DetailItemValue>
                            <a
                              href={prop["value-url"]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {prop["value-url"]}
                            </a>
                          </DetailItemValue>
                        </DetailItem>
                      )}
                      {prop.items && (
                        <DetailItem>
                          <DetailItemLabel>Array Item Type</DetailItemLabel>
                          <DetailItemValue>
                            {typeof prop.items === "object"
                              ? prop.items.type || JSON.stringify(prop.items)
                              : String(prop.items)}
                          </DetailItemValue>
                        </DetailItem>
                      )}
                    </DetailPanel>
                  </td>
                </DetailRow>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </ColumnTable>

      {entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
          No columns match your search.
        </div>
      )}
    </div>
  );
};

export default ColumnDetailPanel;

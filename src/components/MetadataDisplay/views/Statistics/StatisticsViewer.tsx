import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import styled from "styled-components";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { StatRow } from "./types";
import { DescriptiveStatistics } from "../../types/types";

interface SplitInfo {
  query?: string;
  queryType?: string;
  description?: string;
  statistics: DescriptiveStatistics;
}

interface StatisticsViewerProps {
  descriptiveStatistics: DescriptiveStatistics;
  splitStatistics?: { [splitName: string]: SplitInfo };
}

/* ── Styled components ── */

const SectionHeading = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 12px 0;
`;

const SplitControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
`;

const SplitButton = styled.button<{ $active?: boolean }>`
  padding: 6px 14px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#005f73" : "#6c757d")};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;

  &:hover {
    background-color: ${({ $active }) =>
      $active ? "white" : "rgba(255, 255, 255, 0.5)"};
  }
`;

const CompareButton = styled.button<{ $active?: boolean }>`
  padding: 6px 14px;
  background-color: ${({ $active }) => ($active ? "#005f73" : "transparent")};
  color: ${({ $active }) => ($active ? "white" : "#005f73")};
  border: 1px solid #005f73;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#004e5a" : "#f0f7f8")};
  }
`;

const SplitHeader = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
`;

const SplitName = styled.span`
  font-weight: 600;
  color: #212529;
  font-size: 0.9rem;
`;

const QueryBadge = styled.code`
  display: inline-block;
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #495057;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
`;

const SplitDescription = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #6c757d;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 24px 0;
`;

const SplitSection = styled.div`
  margin-bottom: 24px;
`;

/* ── Table helper ── */

const formatValue = (value: number | string): string => {
  if (value === "NaN" || value === null || value === undefined) return "-";
  if (typeof value === "number") return value.toFixed(2);
  return String(value);
};

const columns: MRT_ColumnDef<StatRow>[] = [
  { header: "Column", accessorKey: "columnName", size: 300 },
  {
    header: "Count",
    accessorKey: "count",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 100,
  },
  {
    header: "Mean",
    accessorKey: "mean",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 120,
  },
  {
    header: "Std Dev",
    accessorKey: "std",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 120,
  },
  {
    header: "Min",
    accessorKey: "min",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 100,
  },
  {
    header: "Q1",
    accessorKey: "first_quartile",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 100,
  },
  {
    header: "Median",
    accessorKey: "second_quartile",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 120,
  },
  {
    header: "Q3",
    accessorKey: "third_quartile",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 100,
  },
  {
    header: "Max",
    accessorKey: "max",
    Cell: ({ cell }) => formatValue(cell.getValue<number | string>()),
    size: 100,
  },
];

function toStatRows(stats: DescriptiveStatistics): StatRow[] {
  return Object.entries(stats).map(([_, value]) => ({
    columnName: value.columnName,
    count: value.statistics.count,
    mean: value.statistics.mean,
    std: value.statistics.std,
    min: value.statistics.min,
    first_quartile: value.statistics.first_quartile,
    second_quartile: value.statistics.second_quartile,
    third_quartile: value.statistics.third_quartile,
    max: value.statistics.max,
  }));
}

/* ── Sub-component: a single stats table ── */

function StatsTable({ data }: { data: StatRow[] }) {
  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnResizing: true,
    enableStickyHeader: true,
    enablePagination: false,
    layoutMode: "grid",
    initialState: { density: "compact" },
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 350px)",
        overflowX: "auto",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", overflow: "visible" },
    },
  });

  return <MaterialReactTable table={table} />;
}

/* ── Main component ── */

const StatisticsViewer = ({
  descriptiveStatistics,
  splitStatistics,
}: StatisticsViewerProps) => {
  const splitNames = useMemo(
    () => (splitStatistics ? Object.keys(splitStatistics) : []),
    [splitStatistics]
  );
  const hasSplits = splitNames.length > 0;

  const [selectedSplits, setSelectedSplits] = useState<string[]>(() =>
    splitNames.length > 0 ? [splitNames[0]] : []
  );
  const [compareMode, setCompareMode] = useState(false);

  const allDataRows = useMemo(
    () => toStatRows(descriptiveStatistics),
    [descriptiveStatistics]
  );

  const toggleSplit = (name: string) => {
    if (compareMode) {
      setSelectedSplits((prev) =>
        prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
      );
    } else {
      setSelectedSplits([name]);
    }
  };

  const toggleCompare = () => {
    setCompareMode((prev) => {
      if (prev) {
        // exiting compare → keep only first selected
        setSelectedSplits((s) => (s.length > 0 ? [s[0]] : []));
      }
      return !prev;
    });
  };

  return (
    <Box sx={{ width: "100%", padding: 2, backgroundColor: "#ffffff" }}>
      {/* All Data — always shown */}
      <SectionHeading>All Data</SectionHeading>
      <StatsTable data={allDataRows} />

      {/* Splits section */}
      {hasSplits && (
        <>
          <Divider />
          <SectionHeading>Data Splits</SectionHeading>

          <SplitControls>
            <ButtonGroup>
              {splitNames.map((name) => (
                <SplitButton
                  key={name}
                  $active={selectedSplits.includes(name)}
                  onClick={() => toggleSplit(name)}
                >
                  {name}
                </SplitButton>
              ))}
            </ButtonGroup>
            <CompareButton $active={compareMode} onClick={toggleCompare}>
              {compareMode ? "Exit Compare" : "Compare"}
            </CompareButton>
          </SplitControls>

          {selectedSplits.map((name) => {
            const split = splitStatistics![name];
            if (!split) return null;
            const rows = toStatRows(split.statistics);

            return (
              <SplitSection key={name}>
                <SplitHeader>
                  <SplitName>{name}</SplitName>
                  {split.description && (
                    <SplitDescription>{split.description}</SplitDescription>
                  )}
                  {split.query && (
                    <div style={{ marginTop: 6 }}>
                      <QueryBadge>{split.query}</QueryBadge>
                    </div>
                  )}
                </SplitHeader>
                <StatsTable data={rows} />
              </SplitSection>
            );
          })}
        </>
      )}
    </Box>
  );
};

export default StatisticsViewer;

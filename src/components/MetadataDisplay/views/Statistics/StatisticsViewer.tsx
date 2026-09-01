import { useMemo, useState, useRef, useEffect } from "react";
import { Box } from "@mui/material";
import styled from "styled-components";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import * as d3 from "d3";
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
  color: #18242a;
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
  border-radius: 2px;
  padding: 4px;
`;

const SplitButton = styled.button<{ $active?: boolean }>`
  padding: 6px 14px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#005f73" : "#51626B")};
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;

  &:hover {
    background-color: ${({ $active }) => ($active ? "white" : "rgba(255, 255, 255, 0.5)")};
  }
`;

const CompareButton = styled.button<{ $active?: boolean }>`
  padding: 6px 14px;
  background-color: ${({ $active }) => ($active ? "#005f73" : "transparent")};
  color: ${({ $active }) => ($active ? "white" : "#005f73")};
  border: 1px solid #005f73;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#004e5a" : "#f0f7f8")};
  }
`;

const SplitHeader = styled.div`
  background-color: #f7f9f9;
  border: 1px solid #ebf2f4;
  border-radius: 2px;
  padding: 10px 14px;
  margin-bottom: 12px;
`;

const SplitName = styled.span`
  font-weight: 600;
  color: #18242a;
  font-size: 0.9rem;
`;

const QueryBadge = styled.code`
  display: inline-block;
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #ebf2f4;
  border-radius: 2px;
  font-size: 0.8rem;
  color: #51626b;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
`;

const SplitDescription = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #51626b;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ebf2f4;
  margin: 24px 0;
`;

const SplitSection = styled.div`
  margin-bottom: 24px;
`;

const HistogramSection = styled.div`
  margin-top: 20px;
  margin-bottom: 8px;
`;

const ColumnSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #c3ced2;
  border-radius: 2px;
  font-size: 0.85rem;
  color: #51626b;
  background-color: #fff;
  margin-left: 10px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #005f73;
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #51626b;
`;

const LegendSwatch = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
  border: 1px solid rgba(0, 0, 0, 0.15);
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
    header: "Missing",
    accessorKey: "missing_count",
    Cell: ({ cell }) => {
      const v = cell.getValue<number | undefined>();
      return v != null ? String(v) : "-";
    },
    size: 90,
  },
  {
    header: "Missing %",
    accessorKey: "missing_percentage",
    Cell: ({ cell }) => {
      const v = cell.getValue<number | undefined>();
      return v != null ? `${v.toFixed(1)}%` : "-";
    },
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
    missing_count: value.statistics.missing_count,
    missing_percentage: value.statistics.missing_percentage,
    histogram_bins: value.statistics.histogram_bins,
    histogram_counts: value.statistics.histogram_counts,
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

/* ── Histogram chart (D3) ── */

const SPLIT_COLORS = [
  "#0a9396",
  "#ee9b00",
  "#ae2012",
  "#94d2bd",
  "#ca6702",
  "#9b2226",
  "#005f73",
  "#bb3e03",
];

interface HistogramSeries {
  name: string;
  counts: number[];
}

function HistogramChart({
  totalBins,
  totalCounts,
  splits,
}: {
  totalBins: number[];
  totalCounts: number[];
  splits: HistogramSeries[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 600;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 50, left: 55 };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const numBins = totalCounts.length;

    // Convert counts to percentages per series
    const toPercent = (counts: number[]) => {
      const total = counts.reduce((a, b) => a + b, 0);
      return total > 0
        ? counts.map((c) => (c / total) * 100)
        : counts.map(() => 0);
    };

    const allSeries = [
      { name: "All Data", pct: toPercent(totalCounts) },
      ...splits.map((s) => ({ name: s.name, pct: toPercent(s.counts) })),
    ];

    // x scale: one band per bin
    const binLabels = Array.from({ length: numBins }, (_, i) => {
      const lo = totalBins[i];
      const hi = totalBins[i + 1];
      return `${lo.toFixed(1)}–${hi.toFixed(1)}`;
    });

    const x = d3.scaleBand().domain(binLabels).range([0, innerW]).padding(0.1);

    const subX = d3
      .scaleBand()
      .domain(allSeries.map((s) => s.name))
      .range([0, x.bandwidth()])
      .padding(0.05);

    // y scale (percentage)
    const maxPct = d3.max(allSeries.flatMap((s) => s.pct)) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxPct * 1.1])
      .nice()
      .range([innerH, 0]);

    // axes
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat((d) => `${d}%`),
      )
      .selectAll("text")
      .style("font-size", "11px");

    // y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -42)
      .attr("x", -innerH / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#495057")
      .text("% of Rows");

    // color scale
    const color = (i: number) =>
      i === 0 ? "#adb5bd" : SPLIT_COLORS[(i - 1) % SPLIT_COLORS.length];

    // bars
    binLabels.forEach((label, binIdx) => {
      allSeries.forEach((series, seriesIdx) => {
        const val = series.pct[binIdx] ?? 0;
        const barX = (x(label) ?? 0) + (subX(series.name) ?? 0);
        const barH = innerH - y(val);

        g.append("rect")
          .attr("x", barX)
          .attr("y", y(val))
          .attr("width", subX.bandwidth())
          .attr("height", barH)
          .attr("fill", color(seriesIdx))
          .attr("opacity", 0.8)
          .attr("rx", 1);
      });
    });
  }, [totalBins, totalCounts, splits]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: "block" }}
    />
  );
}

/* ── Main component ── */

const StatisticsViewer = ({
  descriptiveStatistics,
  splitStatistics,
}: StatisticsViewerProps) => {
  const splitNames = useMemo(
    () => (splitStatistics ? Object.keys(splitStatistics) : []),
    [splitStatistics],
  );
  const hasSplits = splitNames.length > 0;

  const [selectedSplits, setSelectedSplits] = useState<string[]>(() =>
    splitNames.length > 0 ? [splitNames[0]] : [],
  );
  const [compareMode, setCompareMode] = useState(false);
  const [selectedHistColumn, setSelectedHistColumn] = useState<string>("");

  const allDataRows = useMemo(
    () => toStatRows(descriptiveStatistics),
    [descriptiveStatistics],
  );

  // Numeric columns that have histogram data
  const numericColumns = useMemo(
    () => allDataRows.filter((r) => r.histogram_bins && r.histogram_counts),
    [allDataRows],
  );

  // Auto-select first numeric column
  useEffect(() => {
    if (!selectedHistColumn && numericColumns.length > 0) {
      setSelectedHistColumn(numericColumns[0].columnName);
    }
  }, [numericColumns, selectedHistColumn]);

  const toggleSplit = (name: string) => {
    if (compareMode) {
      setSelectedSplits((prev) =>
        prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
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

  // Build histogram data for selected column
  const histogramData = useMemo(() => {
    if (!selectedHistColumn) return null;

    const totalRow = allDataRows.find(
      (r) => r.columnName === selectedHistColumn,
    );
    if (!totalRow?.histogram_bins || !totalRow?.histogram_counts) return null;

    const splitSeries: HistogramSeries[] = [];
    if (splitStatistics) {
      for (const name of selectedSplits) {
        const split = splitStatistics[name];
        if (!split) continue;
        const colData = split.statistics[selectedHistColumn];
        if (colData?.statistics?.histogram_counts) {
          splitSeries.push({
            name,
            counts: colData.statistics.histogram_counts,
          });
        }
      }
    }

    return {
      bins: totalRow.histogram_bins,
      counts: totalRow.histogram_counts,
      splits: splitSeries,
    };
  }, [selectedHistColumn, allDataRows, splitStatistics, selectedSplits]);

  return (
    <Box sx={{ width: "100%", padding: 2, backgroundColor: "#ffffff" }}>
      {/* All Data — always shown */}
      <SectionHeading>All Data</SectionHeading>
      <StatsTable data={allDataRows} />

      {/* Histogram section */}
      {numericColumns.length > 0 && (
        <HistogramSection>
          <div style={{ display: "flex", alignItems: "center" }}>
            <SectionHeading style={{ margin: 0 }}>Histogram</SectionHeading>
            <ColumnSelect
              value={selectedHistColumn}
              onChange={(e) => setSelectedHistColumn(e.target.value)}
            >
              {numericColumns.map((r) => (
                <option key={r.columnName} value={r.columnName}>
                  {r.columnName}
                </option>
              ))}
            </ColumnSelect>
          </div>

          {histogramData && (
            <>
              <HistogramChart
                totalBins={histogramData.bins}
                totalCounts={histogramData.counts}
                splits={histogramData.splits}
              />
              <Legend>
                <LegendItem>
                  <LegendSwatch $color="#adb5bd" />
                  All Data
                </LegendItem>
                {histogramData.splits.map((s, i) => (
                  <LegendItem key={s.name}>
                    <LegendSwatch
                      $color={SPLIT_COLORS[i % SPLIT_COLORS.length]}
                    />
                    {s.name}
                  </LegendItem>
                ))}
              </Legend>
            </>
          )}
        </HistogramSection>
      )}

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

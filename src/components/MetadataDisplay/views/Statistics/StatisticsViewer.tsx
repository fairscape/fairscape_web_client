import { useMemo } from "react";
import { Box } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { StatRow } from "./types";
import { DescriptiveStatistics } from "../../types/types";

interface StatisticsViewerProps {
  descriptiveStatistics: DescriptiveStatistics;
}

const StatisticsViewer = ({ descriptiveStatistics }: StatisticsViewerProps) => {
  const tableData = useMemo<StatRow[]>(() => {
    return Object.entries(descriptiveStatistics).map(([_, value]) => ({
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
  }, [descriptiveStatistics]);

  const formatValue = (value: number | string): string => {
    if (value === "NaN" || value === null || value === undefined) {
      return "-";
    }
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    return String(value);
  };

  const columns = useMemo<MRT_ColumnDef<StatRow>[]>(
    () => [
      {
        header: "Column",
        accessorKey: "columnName",
        size: 300,
      },
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
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnResizing: true,
    enableStickyHeader: true,
    enablePagination: false,
    layoutMode: "grid",
    initialState: {
      density: "compact",
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 250px)",
        overflowX: "auto",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: "1px solid #e0e0e0",
        overflow: "visible",
      },
    },
  });

  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        backgroundColor: "#ffffff",
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default StatisticsViewer;

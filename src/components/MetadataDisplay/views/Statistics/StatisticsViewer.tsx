import { useMemo, useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Dataset, StatRow } from "./types";

interface StatisticsViewerProps {
  dataset: Dataset;
}

const StatisticsViewer = ({ dataset }: StatisticsViewerProps) => {
  const availableColumns = useMemo(() => {
    return dataset.summaryStatistics.map((stat) => stat.name);
  }, [dataset]);

  const [selectedColumn, setSelectedColumn] = useState<string>(
    availableColumns[0] || ""
  );

  const tableData = useMemo<StatRow[]>(() => {
    const rows: StatRow[] = [];

    dataset.summaryStatistics
      .filter((colStat) => colStat.name === selectedColumn)
      .forEach((colStat) => {
        const statsObj: any = {
          column: colStat.name,
          subsetGroup: "Overall Dataset",
          subsetName: "All",
          sortOrder: 0,
        };
        colStat.statistics.forEach((stat) => {
          statsObj[stat.name] = stat.value;
        });
        rows.push(statsObj);
      });

    let sortOrder = 1;
    dataset.subsets.forEach((subset) => {
      subset.summaryStatistics
        .filter((colStat) => colStat.name === selectedColumn)
        .forEach((colStat) => {
          const statsObj: any = {
            column: colStat.name,
            subsetGroup: subset.group,
            subsetName: subset.name,
            sortOrder: sortOrder,
          };
          colStat.statistics.forEach((stat) => {
            statsObj[stat.name] = stat.value;
          });
          rows.push(statsObj);
        });
      sortOrder++;
    });

    return rows;
  }, [selectedColumn, dataset]);

  const columns = useMemo<MRT_ColumnDef<StatRow>[]>(
    () => [
      {
        header: "Sort",
        accessorKey: "sortOrder",
        enableGrouping: false,
        enableColumnActions: false,
        enableHiding: false,
        size: 0,
        muiTableHeadCellProps: {
          sx: { display: "none" },
        },
        muiTableBodyCellProps: {
          sx: { display: "none" },
        },
      },
      {
        header: "Subset",
        accessorKey: "subsetGroup",
        GroupedCell: ({ cell, row }) => (
          <Box sx={{ color: "primary.main", fontWeight: "bold" }}>
            {cell.getValue<string>()} ({row.subRows?.length})
          </Box>
        ),
        size: 180,
      },
      {
        header: "Subset",
        accessorKey: "subsetName",
        enableGrouping: false,
        size: 200,
      },
      {
        header: "Mean",
        accessorKey: "Mean",
        enableGrouping: false,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) ?? "-",
        size: 90,
      },
      {
        header: "Median",
        accessorKey: "Median",
        enableGrouping: false,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) ?? "-",
        size: 90,
      },
      {
        header: "Std Dev",
        accessorKey: "Std Dev",
        enableGrouping: false,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) ?? "-",
        size: 90,
      },
      {
        header: "Q1",
        accessorKey: "Q1",
        enableGrouping: false,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) ?? "-",
        size: 80,
      },
      {
        header: "Q3",
        accessorKey: "Q3",
        enableGrouping: false,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) ?? "-",
        size: 80,
      },
      {
        header: "Min",
        accessorKey: "Min",
        enableGrouping: false,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) ?? "-",
        size: 80,
      },
      {
        header: "Max",
        accessorKey: "Max",
        enableGrouping: false,
        Cell: ({ cell }) => cell.getValue<number>()?.toFixed(1) ?? "-",
        size: 80,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    displayColumnDefOptions: {
      "mrt-row-expand": {
        enableResizing: true,
        size: 60,
      },
    },
    enableColumnResizing: true,
    enableGrouping: true,
    enableStickyHeader: true,
    enablePagination: false,
    enableExpandAll: false,
    initialState: {
      density: "compact",
      expanded: { "subsetGroup:Overall Dataset": true },
      grouping: ["subsetGroup"],
      sorting: [{ id: "sortOrder", desc: false }],
      columnVisibility: {
        sortOrder: false,
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        fontWeight: row.original.subsetGroup === "Overall Dataset" ? 600 : 400,
      },
    }),
    muiExpandButtonProps: ({ row }) => ({
      disabled: row.original.subsetGroup === "Overall Dataset",
      sx: {
        visibility:
          row.original.subsetGroup === "Overall Dataset" ? "hidden" : "visible",
      },
    }),
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 250px)",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: "1px solid #e0e0e0",
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
      <Box sx={{ marginBottom: 2 }}>
        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel id="column-select-label">Column</InputLabel>
          <Select
            labelId="column-select-label"
            value={selectedColumn}
            label="Column"
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            {availableColumns.map((col) => (
              <MenuItem key={col} value={col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default StatisticsViewer;

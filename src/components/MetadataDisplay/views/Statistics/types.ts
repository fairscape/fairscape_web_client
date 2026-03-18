export interface StatRow {
  columnName: string;
  count: number | string;
  mean: number | string;
  std: number | string;
  min: number | string;
  first_quartile: number | string;
  second_quartile: number | string;
  third_quartile: number | string;
  max: number | string;
  missing_count?: number;
  missing_percentage?: number;
  histogram_bins?: number[];
  histogram_counts?: number[];
}

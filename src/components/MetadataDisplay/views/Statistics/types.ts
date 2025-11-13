export interface Statistic {
  "@type": string;
  name: string;
  value: number;
}

export interface ColumnStatistics {
  "@type": string;
  "@id": string;
  name: string;
  statistics: Statistic[];
}

export interface Subset {
  "@type": string;
  "@id": string;
  name: string;
  group: string;
  description: string;
  query: string;
  summaryStatistics: ColumnStatistics[];
}

export interface Dataset {
  "@context": Record<string, string>;
  "@type": string;
  "@id": string;
  name: string;
  description: string;
  summaryStatistics: ColumnStatistics[];
  subsets: Subset[];
}

export interface StatRow {
  column: string;
  subsetGroup: string;
  subsetName: string;
  [statName: string]: string | number;
}

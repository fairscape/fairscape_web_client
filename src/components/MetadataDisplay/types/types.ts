export type EvidenceStatus = "ready" | "building" | "failed";

export interface EvidenceInfo {
  id?: string;
  data?: any;
  supportData?: any;
  status: EvidenceStatus;
  error?: string;
  isAnnotated?: boolean;
  annotatedData?: any;
}

export interface Serializations {
  json: any;
  rdfXml?: string | null;
  turtle?: string | null;
}

export interface SessionInfo {
  isLoggedIn: boolean;
}

export interface Permissions {
  owner?: string;
  group?: string;
}

export interface Distribution {
  distributionType?: string;
  location?: {
    path?: string;
  };
}

export interface ColumnStatistics {
  count: number;
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
  unique?: number | string;
  top?: string | boolean;
  freq?: number | string;
}

export interface DescriptiveStatistics {
  [columnName: string]: {
    columnName: string;
    statistics: ColumnStatistics;
  };
}

export interface IdentifierValue {
  "@id": string;
  "@type"?: string | string[];
  name?: string;
}

/** Per-category entity counts from /rocrate/summary. */
export interface ContentCounts {
  datasets: number;
  software: number;
  computations: number;
  schemas: number;
  samples: number;
  mlModels: number;
  rocrates: number;
  other: number;
  total: number;
}

export interface MetadataBundle {
  kind: string;
  main: any;
  rocrate?: any;
  /**
   * Set when the crate was loaded via the paged path: `rocrate` holds only the
   * shell (expand=false) and entity lists must be fetched a page at a time
   * from /rocrate/entities. `counts` carries the category totals.
   */
  paged?: boolean;
  counts?: ContentCounts;
  evidence?: EvidenceInfo;
  serializations?: Serializations;
  session: SessionInfo;
  permissions?: Permissions;
  distribution?: Distribution;
  descriptiveStatistics?: DescriptiveStatistics;
  splitStatistics?: {
    [splitName: string]: {
      query?: string;
      queryType?: string;
      description?: string;
      statistics: DescriptiveStatistics;
    };
  };
  isPartOf?: IdentifierValue[];
}

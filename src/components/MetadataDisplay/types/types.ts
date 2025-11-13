export type EvidenceStatus = "ready" | "building" | "failed";

export interface EvidenceInfo {
  id?: string;
  data?: any;
  supportData?: any;
  status: EvidenceStatus;
  error?: string;
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
}

export interface DescriptiveStatistics {
  [columnName: string]: {
    columnName: string;
    statistics: ColumnStatistics;
  };
}

export interface MetadataBundle {
  kind: string;
  main: any;
  rocrate?: any;
  evidence?: EvidenceInfo;
  serializations?: Serializations;
  session: SessionInfo;
  permissions?: Permissions;
  distribution?: Distribution;
  descriptiveStatistics?: DescriptiveStatistics;
}

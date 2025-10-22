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

export interface MetadataBundle {
  kind: string;
  main: any;
  rocrate?: any;
  evidence?: EvidenceInfo;
  serializations?: Serializations;
  session: SessionInfo;
  permissions?: Permissions;
  distribution?: Distribution;
}

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

export interface MetadataBundle {
  kind: string;
  main: any;
  rocrate?: any;
  evidence?: EvidenceInfo;
  serializations?: Serializations;
  session: SessionInfo;
}

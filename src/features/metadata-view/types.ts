export type EntityKind = "entity" | "rocrate" | "release";
export type EvidenceStatus = "idle" | "building" | "ready" | "failed";

export interface EvidenceInfo {
  id?: string;
  data?: any;
  status: EvidenceStatus;
  error?: string;
}

export interface MetadataBundle {
  kind: EntityKind;
  main: any;
  rocrate?: any;
  evidence?: EvidenceInfo;
  // rdf?: { turtle?: string; rdfXml?: string } // add later if desired
}

import { RawGraphEntity, RawGraphData } from "./graph";
export interface User {
  givenName: string;
  surname: string;
  email: string;
  organization: string;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export type Metadata = RawGraphEntity;

export interface MetadataApiResponse {
  metadata: Metadata | null;
  evidenceGraph: RawGraphData | null; // Or a more specific type if you process it server-side
  turtle: string | null;
  rdfXml: string | null;
}

// Auth context types
export interface AuthContextType {
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Search result types
export interface SearchResult {
  id: string;
  name?: string;
  description?: string;
  score: number;
  keywords?: string[];
}

export interface SearchMetadataInfo {
  query?: string;
  totalResults?: number;
  timeTaken?: number;
  searchType?: string;
  error?: string;
}

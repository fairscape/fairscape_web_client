// src/services/metadataService.ts
import axios, { AxiosRequestConfig } from "axios";
import { AuthService } from "./authService";
import { Metadata, RawGraphData, RawGraphEntity } from "../types";

export interface FetchMetadataOptions {
  includeEvidenceGraph?: boolean;
  includeSerializations?: boolean;
  timeout?: number;
}

export interface MetadataResult {
  metadata: Metadata | null;
  evidenceGraph?: RawGraphData | null;
  turtle?: string | null;
  rdfXml?: string | null;
  type: string;
  error: string | null;
}

export interface EvidenceGraphBuildResult {
  taskId: string | null;
  statusEndpoint: string | null;
  error: string | null;
}

export interface TaskStatus {
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILURE";
  result?: { evidence_graph_id?: string };
  error?: { message?: string };
}

export class MetadataService {
  private static readonly API_URL = window.API_URL;
  private static readonly DEFAULT_TIMEOUT = 15000;

  /**
   * Determine metadata type from @type field
   */
  private static determineType(metadata: Metadata): string {
    if (!metadata || !metadata["@type"]) return "unknown";

    const typeValue = Array.isArray(metadata["@type"])
      ? metadata["@type"][1] || metadata["@type"][0]
      : metadata["@type"];

    if (typeof typeValue === "string") {
      const typeParts = typeValue.split(/[/#]/);
      const type = typeParts[typeParts.length - 1].toLowerCase();

      // Check if it's a release (multi-crate ROCrate)
      if (type === "rocrate" && metadata["@graph"]) {
        const graph = metadata["@graph"] as RawGraphEntity[];
        const rocrateCount = graph.filter((e) => {
          const types = Array.isArray(e["@type"]) ? e["@type"] : [e["@type"]];
          return types.some((t) => t === "https://w3id.org/EVI#ROCrate");
        }).length;
        if (rocrateCount > 1) return "release";
      }

      return type;
    }

    return "unknown";
  }

  /**
   * Fetch metadata for a given ARK ID
   */
  static async fetchMetadata(
    arkId: string,
    options: FetchMetadataOptions = {}
  ): Promise<MetadataResult> {
    const cleanId = arkId.replace(/^\/|\/$/g, "");
    const url = `${this.API_URL}/${cleanId}`;

    try {
      const config: AxiosRequestConfig = {
        headers: AuthService.getAuthHeaders(),
        timeout: options.timeout || this.DEFAULT_TIMEOUT,
        withCredentials: true,
      };

      // Fetch main metadata
      const response = await axios.get(url, config);
      const metadata = (response.data.metadata || response.data) as Metadata;
      const type = this.determineType(metadata);

      const result: MetadataResult = {
        metadata,
        type,
        error: null,
      };

      // Fetch additional data if requested
      if (options.includeSerializations) {
        const [turtle, rdfXml] = await Promise.all([
          this.fetchSerialization(cleanId, "turtle"),
          this.fetchSerialization(cleanId, "rdfxml"),
        ]);
        result.turtle = turtle;
        result.rdfXml = rdfXml;
      }

      if (options.includeEvidenceGraph && metadata.hasEvidenceGraph) {
        const graphId =
          typeof metadata.hasEvidenceGraph === "string"
            ? metadata.hasEvidenceGraph
            : metadata.hasEvidenceGraph["@id"];
        result.evidenceGraph = await this.fetchEvidenceGraph(graphId);
      }

      return result;
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
      return {
        metadata: null,
        type: "unknown",
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch metadata",
      };
    }
  }

  /**
   * Fetch ROCrate-specific metadata
   */
  static async fetchROCrateMetadata(arkId: string): Promise<MetadataResult> {
    const cleanId = arkId.replace(/^\/|\/$/g, "");
    const url = `${this.API_URL}/rocrate/${cleanId}`;

    try {
      const response = await axios.get(url, {
        headers: AuthService.getAuthHeaders(),
        timeout: this.DEFAULT_TIMEOUT,
      });

      const metadata = (response.data.metadata || response.data) as Metadata;
      return {
        metadata,
        type: this.determineType(metadata),
        error: null,
      };
    } catch (error: any) {
      // Fall back to regular metadata fetch
      return this.fetchMetadata(arkId);
    }
  }

  /**
   * Fetch serialization formats (Turtle, RDF/XML)
   */
  private static async fetchSerialization(
    arkId: string,
    format: "turtle" | "rdfxml"
  ): Promise<string | null> {
    const acceptHeader =
      format === "turtle" ? "text/turtle" : "application/rdf+xml";

    try {
      const response = await axios.get(`${this.API_URL}/${arkId}`, {
        headers: {
          ...AuthService.getAuthHeaders(),
          Accept: acceptHeader,
        },
        transformResponse: [(data) => data], // Get raw string
      });
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch ${format} for ${arkId}:`, error);
      return null;
    }
  }

  /**
   * Fetch evidence graph by ID
   */
  static async fetchEvidenceGraph(
    graphId: string
  ): Promise<RawGraphData | null> {
    try {
      const response = await axios.get(
        `${this.API_URL}/${graphId.replace(/^\/|\/$/g, "")}`,
        {
          headers: AuthService.getAuthHeaders(),
          timeout: 60000,
        }
      );
      return response.data as RawGraphData;
    } catch (error) {
      console.error("Error fetching evidence graph:", error);
      return null;
    }
  }

  /**
   * Initiate evidence graph build
   */
  static async initiateEvidenceGraphBuild(
    arkId: string
  ): Promise<EvidenceGraphBuildResult> {
    if (!AuthService.isLoggedIn()) {
      return {
        taskId: null,
        statusEndpoint: null,
        error: "Authentication required",
      };
    }

    const cleanId = arkId.replace(/^\/|\/$/g, "");
    try {
      const response = await axios.post(
        `${this.API_URL}/evidencegraph/build/${cleanId}`,
        {},
        { headers: AuthService.getAuthHeaders() }
      );

      return {
        taskId: response.data.task_id,
        statusEndpoint: response.data.status_endpoint,
        error: null,
      };
    } catch (error: any) {
      return {
        taskId: null,
        statusEndpoint: null,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to initiate build",
      };
    }
  }

  /**
   * Poll evidence graph build status
   */
  static async pollTaskStatus(
    taskId: string,
    maxAttempts: number = 24,
    interval: number = 5000
  ): Promise<TaskStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get<TaskStatus>(
          `${this.API_URL}/evidencegraph/build/status/${taskId}`,
          { headers: AuthService.getAuthHeaders() }
        );

        if (
          response.data.status === "SUCCESS" ||
          response.data.status === "FAILURE"
        ) {
          return response.data;
        }

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        console.error("Error polling task status:", error);
        // Continue polling on error
      }
    }

    // Timeout
    return {
      status: "FAILURE",
      error: { message: "Task polling timed out" },
    };
  }
}

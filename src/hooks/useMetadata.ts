// src/hooks/useMetadata.ts
import { useState, useCallback } from "react";
import axios from "axios";
import { Metadata, RawGraphData, MetadataApiResponse } from "../types"; // Adjust path

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

// Helper function to get auth headers (could be moved to a utils file)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper to map raw @type to a cleaner type name for UI/logic
const mapJsonLdTypeToInternal = (
  typeUri: string | string[] | undefined
): string | null => {
  if (!typeUri) return null;
  const typeString = Array.isArray(typeUri) ? typeUri[0] : typeUri;
  // Use last part of URI, handle common prefixes
  const parts = typeString.split(/[#\/]/);
  const rawType = parts.pop()?.toLowerCase() || null;

  // Map to consistent internal types used in routing/logic
  switch (rawType) {
    case "rocrate":
    case "ro-crate": // Handle variations
      return "rocrate";
    case "dataset":
      return "dataset";
    case "software":
    case "softwareapplication": // Handle variations
      return "software";
    case "schema":
    case "schemaobject": // Handle variations
      return "schema";
    case "computation":
      return "computation";
    case "evidencegraph":
      return "evidencegraph";
    // Add mappings for other types you expect
    default:
      console.warn(`Unmapped JSON-LD type: ${typeString}`);
      return rawType; // Return raw type as fallback, might be null
  }
};

// Helper to map internal type to user-friendly display name
const mapInternalTypeToDisplay = (
  internalType: string | null | undefined
): string => {
  if (!internalType) return "Item";
  switch (internalType.toLowerCase()) {
    case "rocrate":
      return "RO-Crate";
    case "dataset":
      return "Dataset";
    case "software":
      return "Software";
    case "schema":
      return "Schema";
    case "computation":
      return "Computation";
    case "evidencegraph":
      return "Evidence Graph";
    default:
      return internalType.charAt(0).toUpperCase() + internalType.slice(1); // Capitalize as default
  }
};

export const useMetadata = () => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [evidenceGraph, setEvidenceGraph] = useState<RawGraphData | null>(null);
  const [turtle, setTurtle] = useState<string | null>(null);
  const [rdfXml, setRdfXml] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [determinedType, setDeterminedType] = useState<string | null>(null); // Store the type found

  const fetchMetadata = useCallback(
    async (arkId: string, initialType?: string) => {
      setLoading(true);
      setError(null);
      setMetadata(null);
      setEvidenceGraph(null);
      setTurtle(null);
      setRdfXml(null);
      setDeterminedType(initialType || null); // Start with initial guess if provided

      const headers = getAuthHeaders();

      try {
        // 1. Fetch main metadata (JSON-LD)
        const metaResponse = await axios.get<Metadata>(`${API_URL}/${arkId}`, {
          headers,
        });
        const fetchedMetadata = metaResponse.data;

        if (!fetchedMetadata || !fetchedMetadata["@id"]) {
          throw new Error("Invalid metadata received.");
        }
        setMetadata(fetchedMetadata);

        // Determine type from fetched metadata if not already known
        const foundType = mapJsonLdTypeToInternal(fetchedMetadata["@type"]);
        if (foundType) {
          setDeterminedType(foundType);
        } else if (!initialType) {
          // If no initial type and type couldn't be determined from fetched data
          console.warn(`Could not determine type for ARK: ${arkId}`);
          // Keep determinedType as null or set a default? For now, keep null.
        }

        // 2. Fetch serializations (conditionally or always, depending on requirements)
        const fetchSerialization = async (
          format: "text/turtle" | "application/rdf+xml"
        ) => {
          try {
            const response = await axios.get<string>(`${API_URL}/${arkId}`, {
              headers: { ...headers, Accept: format },
              // Important: Expect plain text for Turtle/RDF+XML
              transformResponse: [(data) => data], // Prevent axios from parsing as JSON
            });
            return response.data;
          } catch (serError) {
            console.warn(`Failed to fetch ${format} for ${arkId}:`, serError);
            return null;
          }
        };

        const [fetchedTurtle, fetchedRdfXml] = await Promise.all([
          fetchSerialization("text/turtle"),
          fetchSerialization("application/rdf+xml"),
        ]);
        setTurtle(fetchedTurtle);
        setRdfXml(fetchedRdfXml);

        // 3. Fetch Evidence Graph data (if applicable - e.g., for Datasets, Computations)
        // Adjust condition based on which types should have an evidence graph
        const shouldFetchGraph =
          foundType === "dataset" ||
          foundType === "computation" ||
          foundType === "rocrate" ||
          foundType === "evidencegraph"; // Example logic

        if (shouldFetchGraph) {
          try {
            // Assuming the endpoint returns the graph data directly
            const graphResponse = await axios.get<RawGraphData>(
              `${API_URL}/evidencegraph/${arkId}`,
              { headers }
            );
            if (graphResponse.data && graphResponse.data["@graph"]) {
              setEvidenceGraph(graphResponse.data);
            } else {
              console.warn(
                `Evidence graph data missing or invalid for ${arkId}`
              );
            }
          } catch (graphError: any) {
            // It might be okay if the graph isn't found (404), log others as warnings
            if (graphError.response?.status !== 404) {
              console.warn(
                `Failed to fetch evidence graph for ${arkId}:`,
                graphError
              );
            } else {
              console.log(`No evidence graph found for ${arkId} (404)`);
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching metadata:", err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to load metadata."
        );
        // Clear all data on error
        setMetadata(null);
        setEvidenceGraph(null);
        setTurtle(null);
        setRdfXml(null);
        setDeterminedType(null);
      } finally {
        setLoading(false);
      }
    },
    []
  ); // useCallback dependencies are empty as it defines the function

  return {
    metadata,
    evidenceGraph,
    turtle,
    rdfXml,
    loading,
    error,
    fetchMetadata,
    determinedType, // Expose the determined type
    mapType: mapInternalTypeToDisplay, // Expose the display mapping helper
  };
};

import React, { useEffect, useMemo, useState } from "react";
import { ExplorerContainer, EmptyState } from "./schemaExplorer.styles";
import MultiTableSchemaView from "./MultiTableSchemaView";
import ColumnDetailPanel from "./ColumnDetailPanel";
import { SchemaInfo } from "./JoinKeyDetector";
import { useHttp } from "../../api/httpClient";
import LoadingSpinner from "../../../common/LoadingSpinner";
import Alert from "../../../common/Alert";

interface SchemaExplorerViewProps {
  metadata: any;
  bundleKind: string;
}

function extractSchemasFromGraph(metadata: any): SchemaInfo[] {
  const graph = metadata?.["@graph"];
  if (!Array.isArray(graph)) return [];

  return graph
    .filter((entry: any) => {
      const type = entry["@type"];
      if (typeof type === "string") return type === "EVI:Schema";
      if (Array.isArray(type)) return type.some((t: string) => t.includes("Schema"));
      return false;
    })
    .map((entry: any) => ({
      id: entry["@id"] || entry.name || "",
      name: entry.name || entry["@id"] || "Unnamed Schema",
      description: entry.description,
      properties: entry.properties || {},
      required: entry.required || [],
    }));
}

function getDataSchemaRef(metadata: any): string | null {
  const ref =
    metadata?.["evi:Schema"] ||
    metadata?.dataSchema ||
    metadata?.["schema:dataSchema"] ||
    metadata?.conformsTo;
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  if (ref?.["@id"]) return ref["@id"];
  return null;
}

const SchemaExplorerView: React.FC<SchemaExplorerViewProps> = ({
  metadata,
  bundleKind,
}) => {
  const http = useHttp();
  const [fetchedSchema, setFetchedSchema] = useState<SchemaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For RO-Crates: extract schemas from the @graph
  const graphSchemas = useMemo(() => {
    if (bundleKind === "rocrate" || bundleKind === "release") {
      return extractSchemasFromGraph(metadata);
    }
    return [];
  }, [metadata, bundleKind]);

  // For single schemas: the metadata itself IS the schema
  const inlineSchema = useMemo<SchemaInfo | null>(() => {
    if (bundleKind === "schema") {
      return {
        id: metadata?.["@id"] || "",
        name: metadata?.name || "Schema",
        description: metadata?.description,
        properties: metadata?.properties || {},
        required: metadata?.required || [],
      };
    }
    return null;
  }, [metadata, bundleKind]);

  // For datasets: fetch the linked schema
  useEffect(() => {
    if (bundleKind !== "dataset") return;

    const schemaRef = getDataSchemaRef(metadata);
    if (!schemaRef) {
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    http(`/schema/${encodeURIComponent(schemaRef)}`, { method: "GET" })
      .then((data: any) => {
        if (cancelled) return;
        setFetchedSchema({
          id: data["@id"] || schemaRef,
          name: data.name || "Dataset Schema",
          description: data.description,
          properties: data.properties || {},
          required: data.required || [],
        });
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError("Could not load schema for this dataset.");
        console.error("Schema fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [metadata, bundleKind, http]);

  // RO-Crate with schemas in @graph
  if (bundleKind === "rocrate" || bundleKind === "release") {
    if (graphSchemas.length === 0) {
      return (
        <ExplorerContainer>
          <EmptyState>
            No schemas found in this RO-Crate. Schemas define the column
            structure of tabular datasets.
          </EmptyState>
        </ExplorerContainer>
      );
    }
    return <MultiTableSchemaView schemas={graphSchemas} />;
  }

  // Single schema entity
  if (bundleKind === "schema" && inlineSchema) {
    return (
      <ExplorerContainer>
        <ColumnDetailPanel
          schemaName={inlineSchema.name}
          description={inlineSchema.description}
          properties={inlineSchema.properties}
          required={inlineSchema.required}
        />
      </ExplorerContainer>
    );
  }

  // Dataset with linked schema
  if (bundleKind === "dataset") {
    if (loading) {
      return (
        <ExplorerContainer>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <LoadingSpinner />
            <p style={{ marginTop: 10, color: "#666" }}>Loading schema...</p>
          </div>
        </ExplorerContainer>
      );
    }
    if (error) {
      return (
        <ExplorerContainer>
          <Alert type="info" title="Schema" message={error} />
        </ExplorerContainer>
      );
    }
    if (fetchedSchema) {
      return (
        <ExplorerContainer>
          <ColumnDetailPanel
            schemaName={fetchedSchema.name}
            description={fetchedSchema.description}
            properties={fetchedSchema.properties}
            required={fetchedSchema.required}
          />
        </ExplorerContainer>
      );
    }
    return (
      <ExplorerContainer>
        <EmptyState>
          No schema is linked to this dataset.
        </EmptyState>
      </ExplorerContainer>
    );
  }

  return (
    <ExplorerContainer>
      <EmptyState>
        Schema exploration is not available for this entity type.
      </EmptyState>
    </ExplorerContainer>
  );
};

export default SchemaExplorerView;

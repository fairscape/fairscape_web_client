import React, { useMemo, useState } from "react";
import { TabBar, Tab, ExplorerContainer } from "./schemaExplorer.styles";
import JoinKeyDetector, { SchemaInfo, detectJoinKeys } from "./JoinKeyDetector";
import ColumnDetailPanel from "./ColumnDetailPanel";
import RelationshipDiagram from "./RelationshipDiagram";
import CodeSnippetsView from "../CodeSnippets/CodeSnippetsView";

interface MultiTableSchemaViewProps {
  schemas: SchemaInfo[];
  metadata?: any;
}

type SpecialTab = "relationships" | "code";

const MultiTableSchemaView: React.FC<MultiTableSchemaViewProps> = ({
  schemas,
  metadata,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    schemas.length > 0 ? schemas[0].id : "",
  );
  const [specialTab, setSpecialTab] = useState<SpecialTab | null>(
    schemas.length >= 2 ? "relationships" : null,
  );

  const activeSchema = schemas.find((s) => s.id === activeTab);

  const joinKeys = useMemo(() => detectJoinKeys(schemas), [schemas]);

  // Build per-schema map: column name -> other schema names sharing it
  const joinColumnsForSchema = useMemo(() => {
    const map = new Map<string, Map<string, string[]>>();
    for (const schema of schemas) {
      const colMap = new Map<string, string[]>();
      for (const jk of joinKeys) {
        if (jk.schemas.includes(schema.name) && schema.properties[jk.column]) {
          const others = jk.schemas.filter((s) => s !== schema.name);
          colMap.set(jk.column, others);
        }
      }
      map.set(schema.id, colMap);
    }
    return map;
  }, [schemas, joinKeys]);

  const hasDatasets = useMemo(() => {
    if (!metadata?.["@graph"]) return false;
    return metadata["@graph"].some(
      (e: any) =>
        Array.isArray(e["@type"]) &&
        e["@type"].some((t: string) => t.includes("Dataset")) &&
        e.contentUrl &&
        e.contentUrl !== "Embargoed",
    );
  }, [metadata]);

  return (
    <ExplorerContainer>
      <JoinKeyDetector schemas={schemas} />

      <TabBar>
        {schemas.map((schema) => (
          <Tab
            key={schema.id}
            $active={activeTab === schema.id && specialTab === null}
            onClick={() => {
              setActiveTab(schema.id);
              setSpecialTab(null);
            }}
          >
            {schema.name}
          </Tab>
        ))}
        {schemas.length >= 2 && (
          <Tab
            $active={specialTab === "relationships"}
            onClick={() => setSpecialTab("relationships")}
          >
            Relationships
          </Tab>
        )}
        {hasDatasets && (
          <Tab
            $active={specialTab === "code"}
            onClick={() => setSpecialTab("code")}
          >
            Code
          </Tab>
        )}
      </TabBar>

      {specialTab === "relationships" ? (
        <RelationshipDiagram schemas={schemas} />
      ) : specialTab === "code" ? (
        <CodeSnippetsView metadata={metadata} bundleKind="rocrate" />
      ) : activeSchema ? (
        <ColumnDetailPanel
          schemaName={activeSchema.name}
          description={activeSchema.description}
          properties={activeSchema.properties}
          required={activeSchema.required}
          joinColumns={joinColumnsForSchema.get(activeSchema.id)}
        />
      ) : (
        <div style={{ color: "#6c757d", textAlign: "center", padding: "20px" }}>
          No schema selected.
        </div>
      )}
    </ExplorerContainer>
  );
};

export default MultiTableSchemaView;

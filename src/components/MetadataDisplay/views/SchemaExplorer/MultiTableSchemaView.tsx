import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { TabBar, Tab, ExplorerContainer } from "./schemaExplorer.styles";
import JoinKeyDetector, { SchemaInfo, detectJoinKeys } from "./JoinKeyDetector";
import ColumnDetailPanel from "./ColumnDetailPanel";
import RelationshipDiagram from "./RelationshipDiagram";
import { generateSchemaNotebook, openInJupyterLite } from "../CodeSnippets/notebookGenerator";
import { generatePythonMulti } from "../CodeSnippets/generators/pythonGenerator";
import type { DatasetGroup, JoinKeyInfo } from "../CodeSnippets/CodeSnippetsView";

const NotebookButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #005f73;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #003d4d;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
`;

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

interface MultiTableSchemaViewProps {
  schemas: SchemaInfo[];
  metadata?: any;
}

function extractDatasetGroupsForNotebook(metadata: any): { groups: DatasetGroup[]; ungrouped: any[] } {
  const graph = metadata?.["@graph"];
  if (!Array.isArray(graph)) return { groups: [], ungrouped: [] };

  const schemaNames: Record<string, string> = {};
  for (const entry of graph) {
    const type = entry["@type"];
    const isSchema = typeof type === "string" ? type === "EVI:Schema" :
      Array.isArray(type) && type.some((t: string) => t.includes("Schema"));
    if (isSchema) {
      schemaNames[entry["@id"]] = entry.name || entry["@id"];
    }
  }

  const bySchema: Record<string, any[]> = {};
  const ungrouped: any[] = [];

  for (const entry of graph) {
    const type = entry["@type"];
    const isDataset = Array.isArray(type) && type.some((t: string) => t.includes("Dataset"));
    if (!isDataset) continue;
    if (!entry.contentUrl || entry.contentUrl === "Embargoed") continue;

    const ds = {
      name: entry.name || entry["@id"] || "Dataset",
      contentUrl: entry.contentUrl,
      fileFormat: entry.fileFormat || entry.encodingFormat || "",
      schemaId: entry["evi:Schema"]?.["@id"] || entry["evi:Schema"] || undefined,
    };

    if (ds.schemaId && schemaNames[ds.schemaId]) {
      if (!bySchema[ds.schemaId]) bySchema[ds.schemaId] = [];
      bySchema[ds.schemaId].push(ds);
    } else {
      ungrouped.push(ds);
    }
  }

  const groups: DatasetGroup[] = Object.entries(bySchema).map(([schemaId, datasets]) => ({
    schemaId,
    schemaName: schemaNames[schemaId] || schemaId,
    datasets,
    fileFormat: datasets[0]?.fileFormat,
  }));

  return { groups, ungrouped };
}

const MultiTableSchemaView: React.FC<MultiTableSchemaViewProps> = ({
  schemas,
  metadata,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    schemas.length > 0 ? schemas[0].id : ""
  );
  const [showDiagram, setShowDiagram] = useState(false);

  const activeSchema = schemas.find((s) => s.id === activeTab);

  const handleOpenNotebook = () => {
    if (!metadata) return;
    const { groups, ungrouped } = extractDatasetGroupsForNotebook(metadata);

    const joinKeys: JoinKeyInfo[] = detectJoinKeys(schemas).map((jk) => ({
      column: jk.column,
      schemaNames: jk.schemas,
    }));

    const pythonCode = generatePythonMulti(groups, ungrouped, joinKeys);
    const title = metadata?.name || "Schema Exploration";
    const notebook = generateSchemaNotebook(title, pythonCode);
    openInJupyterLite(notebook, "schema_explore.ipynb");
  };

  const hasDatasets = useMemo(() => {
    if (!metadata?.["@graph"]) return false;
    return metadata["@graph"].some((e: any) =>
      Array.isArray(e["@type"]) &&
      e["@type"].some((t: string) => t.includes("Dataset")) &&
      e.contentUrl && e.contentUrl !== "Embargoed"
    );
  }, [metadata]);

  return (
    <ExplorerContainer>
      {hasDatasets && (
        <TopActions>
          <NotebookButton onClick={handleOpenNotebook}>
            Open in Notebook
          </NotebookButton>
        </TopActions>
      )}

      <JoinKeyDetector schemas={schemas} />

      <TabBar>
        {schemas.map((schema) => (
          <Tab
            key={schema.id}
            $active={activeTab === schema.id && !showDiagram}
            onClick={() => {
              setActiveTab(schema.id);
              setShowDiagram(false);
            }}
          >
            {schema.name}
          </Tab>
        ))}
        {schemas.length >= 2 && (
          <Tab
            $active={showDiagram}
            onClick={() => setShowDiagram(true)}
          >
            Relationships
          </Tab>
        )}
      </TabBar>

      {showDiagram ? (
        <RelationshipDiagram schemas={schemas} />
      ) : activeSchema ? (
        <ColumnDetailPanel
          schemaName={activeSchema.name}
          description={activeSchema.description}
          properties={activeSchema.properties}
          required={activeSchema.required}
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

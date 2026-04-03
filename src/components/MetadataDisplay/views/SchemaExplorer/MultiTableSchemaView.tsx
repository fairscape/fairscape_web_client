import React, { useState } from "react";
import { TabBar, Tab, ExplorerContainer } from "./schemaExplorer.styles";
import JoinKeyDetector, { SchemaInfo } from "./JoinKeyDetector";
import ColumnDetailPanel from "./ColumnDetailPanel";
import RelationshipDiagram from "./RelationshipDiagram";

interface MultiTableSchemaViewProps {
  schemas: SchemaInfo[];
}

const MultiTableSchemaView: React.FC<MultiTableSchemaViewProps> = ({
  schemas,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    schemas.length > 0 ? schemas[0].id : ""
  );
  const [showDiagram, setShowDiagram] = useState(false);

  const activeSchema = schemas.find((s) => s.id === activeTab);

  return (
    <ExplorerContainer>
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

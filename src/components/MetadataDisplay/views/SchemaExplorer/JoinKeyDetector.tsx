import React from "react";
import {
  JoinKeyCard,
  JoinKeyTitle,
  JoinKeyList,
  JoinKeyPill,
  JoinKeyCount,
} from "./schemaExplorer.styles";

export interface SchemaInfo {
  id: string;
  name: string;
  description?: string;
  properties: Record<string, any>;
  required?: string[];
}

export interface JoinKey {
  column: string;
  schemas: string[]; // schema names that share this column
}

export function detectJoinKeys(schemas: SchemaInfo[]): JoinKey[] {
  if (schemas.length < 2) return [];

  const columnToSchemas: Record<string, string[]> = {};

  for (const schema of schemas) {
    if (!schema.properties) continue;
    for (const colName of Object.keys(schema.properties)) {
      if (!columnToSchemas[colName]) {
        columnToSchemas[colName] = [];
      }
      columnToSchemas[colName].push(schema.name);
    }
  }

  return Object.entries(columnToSchemas)
    .filter(([, schemaNames]) => schemaNames.length >= 2)
    .map(([column, schemaNames]) => ({ column, schemas: schemaNames }))
    .sort((a, b) => b.schemas.length - a.schemas.length);
}

interface JoinKeyDetectorProps {
  schemas: SchemaInfo[];
}

const JoinKeyDetector: React.FC<JoinKeyDetectorProps> = ({ schemas }) => {
  const joinKeys = detectJoinKeys(schemas);

  if (joinKeys.length === 0) return null;

  return (
    <JoinKeyCard>
      <JoinKeyTitle>
        Detected Join Keys ({joinKeys.length} shared columns)
      </JoinKeyTitle>
      <JoinKeyList>
        {joinKeys.map((jk) => (
          <JoinKeyPill key={jk.column}>
            {jk.column}
            <JoinKeyCount>{jk.schemas.length}</JoinKeyCount>
          </JoinKeyPill>
        ))}
      </JoinKeyList>
    </JoinKeyCard>
  );
};

export default JoinKeyDetector;

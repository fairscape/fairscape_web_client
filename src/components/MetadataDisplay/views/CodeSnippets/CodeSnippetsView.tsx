import React, { useMemo, useState } from "react";
import styled from "styled-components";
import SnippetBlock from "./SnippetBlock";
import {
  generatePythonSingle,
  generatePythonMulti,
} from "./generators/pythonGenerator";
import { generateRSingle, generateRMulti } from "./generators/rGenerator";
import { generateCLISingle, generateCLIMulti } from "./generators/cliGenerator";
import { generateCodeNotebook, openInJupyterLite } from "./notebookGenerator";
import { SectionHeader } from "../../shared.styles";

const Container = styled.div`
  padding: 24px;
`;

const LangBar = styled.div`
  display: inline-flex;
  background-color: #f0f2f5;
  border-radius: 2px;
  padding: 4px;
  margin-bottom: 20px;
`;

const LangButton = styled.button<{ $active?: boolean }>`
  padding: 6px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#005f73" : "#51626B")};
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "white" : "#EBF2F4")};
    color: #005f73;
  }
`;

const Description = styled.p`
  color: #51626b;
  font-size: 0.9rem;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const NotebookButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #005f73;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  margin-left: 12px;

  &:hover {
    background: #003d4d;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
`;

export interface DatasetInfo {
  name: string;
  contentUrl: string;
  fileFormat?: string;
  schemaId?: string;
}

export interface DatasetGroup {
  schemaId: string;
  schemaName: string;
  datasets: DatasetInfo[];
  fileFormat?: string;
}

export interface JoinKeyInfo {
  column: string;
  schemaNames: string[];
}

interface CodeSnippetsViewProps {
  metadata: any;
  bundleKind: string;
}

/** Group datasets by their schema. Datasets sharing a schema become one group (rendered as a loop). */
function extractDatasetGroups(metadata: any): {
  groups: DatasetGroup[];
  ungrouped: DatasetInfo[];
} {
  const graph = metadata?.["@graph"];
  if (!Array.isArray(graph)) return { groups: [], ungrouped: [] };

  // Build schema id -> name map
  const schemaNames: Record<string, string> = {};
  for (const entry of graph) {
    const type = entry["@type"];
    const isSchema =
      typeof type === "string"
        ? type === "EVI:Schema"
        : Array.isArray(type) && type.some((t: string) => t.includes("Schema"));
    if (isSchema) {
      schemaNames[entry["@id"]] = entry.name || entry["@id"];
    }
  }

  // Collect datasets and group by schema
  const bySchema: Record<string, DatasetInfo[]> = {};
  const ungrouped: DatasetInfo[] = [];

  for (const entry of graph) {
    const type = entry["@type"];
    const isDataset =
      Array.isArray(type) && type.some((t: string) => t.includes("Dataset"));
    if (!isDataset) continue;
    if (!entry.contentUrl || entry.contentUrl === "Embargoed") continue;

    const ds: DatasetInfo = {
      name: entry.name || entry["@id"] || "Dataset",
      contentUrl: entry.contentUrl,
      fileFormat: entry.fileFormat || entry.encodingFormat || "",
      schemaId:
        entry["evi:Schema"]?.["@id"] || entry["evi:Schema"] || undefined,
    };

    if (ds.schemaId && schemaNames[ds.schemaId]) {
      if (!bySchema[ds.schemaId]) bySchema[ds.schemaId] = [];
      bySchema[ds.schemaId].push(ds);
    } else {
      ungrouped.push(ds);
    }
  }

  const groups: DatasetGroup[] = Object.entries(bySchema).map(
    ([schemaId, datasets]) => ({
      schemaId,
      schemaName: schemaNames[schemaId] || schemaId,
      datasets,
      fileFormat: datasets[0]?.fileFormat,
    }),
  );

  return { groups, ungrouped };
}

function extractJoinKeys(metadata: any): JoinKeyInfo[] {
  const graph = metadata?.["@graph"];
  if (!Array.isArray(graph)) return [];

  const schemas = graph.filter((entry: any) => {
    const type = entry["@type"];
    return typeof type === "string" && type === "EVI:Schema";
  });

  if (schemas.length < 2) return [];

  const columnToSchemas: Record<string, string[]> = {};
  for (const schema of schemas) {
    const props = schema.properties || {};
    for (const colName of Object.keys(props)) {
      if (!columnToSchemas[colName]) columnToSchemas[colName] = [];
      columnToSchemas[colName].push(schema.name || schema["@id"]);
    }
  }

  return Object.entries(columnToSchemas)
    .filter(([, names]) => new Set(names).size >= 2)
    .map(([column, names]) => ({
      column,
      schemaNames: [...new Set(names)],
    }))
    .sort((a, b) => b.schemaNames.length - a.schemaNames.length);
}

type Lang = "python" | "r" | "cli";

const CodeSnippetsView: React.FC<CodeSnippetsViewProps> = ({
  metadata,
  bundleKind,
}) => {
  const [lang, setLang] = useState<Lang>("python");

  const isMulti = bundleKind === "rocrate" || bundleKind === "release";

  const singleDataset = useMemo<DatasetInfo | null>(() => {
    if (isMulti) return null;
    const contentUrl = metadata?.contentUrl;
    if (!contentUrl || contentUrl === "Embargoed") return null;
    return {
      name: metadata?.name || "dataset",
      contentUrl,
      fileFormat: metadata?.fileFormat || metadata?.encodingFormat || "",
    };
  }, [metadata, isMulti]);

  const { groups, ungrouped } = useMemo(() => {
    if (!isMulti) return { groups: [], ungrouped: [] };
    return extractDatasetGroups(metadata);
  }, [metadata, isMulti]);

  const joinKeys = useMemo<JoinKeyInfo[]>(() => {
    if (!isMulti) return [];
    return extractJoinKeys(metadata);
  }, [metadata, isMulti]);

  // Always compute Python code for notebook generation
  const pythonCode = useMemo(() => {
    if (isMulti && (groups.length > 0 || ungrouped.length > 0)) {
      return generatePythonMulti(groups, ungrouped, joinKeys);
    }
    if (singleDataset) {
      return generatePythonSingle(singleDataset);
    }
    return null;
  }, [isMulti, groups, ungrouped, singleDataset, joinKeys]);

  const code = useMemo(() => {
    if (lang === "python") return pythonCode;

    if (isMulti && (groups.length > 0 || ungrouped.length > 0)) {
      switch (lang) {
        case "r":
          return generateRMulti(groups, ungrouped, joinKeys);
        case "cli":
          return generateCLIMulti(groups, ungrouped);
      }
    }

    if (singleDataset) {
      switch (lang) {
        case "r":
          return generateRSingle(singleDataset);
        case "cli":
          return generateCLISingle(singleDataset);
      }
    }

    return null;
  }, [lang, pythonCode, isMulti, groups, ungrouped, singleDataset, joinKeys]);

  const handleOpenNotebook = () => {
    if (!pythonCode) return;
    const title = metadata?.name || "FAIRSCAPE Dataset";
    const hasMetadata = isMulti && metadata?.["@graph"];
    const notebook = generateCodeNotebook(title, pythonCode, !!hasMetadata);
    openInJupyterLite(notebook, undefined, hasMetadata ? metadata : undefined);
  };

  const langMap: Record<Lang, string> = {
    python: "python",
    r: "r",
    cli: "bash",
  };

  const totalDatasets = isMulti
    ? groups.reduce((sum, g) => sum + g.datasets.length, 0) + ungrouped.length
    : 1;

  if (!code) {
    return (
      <Container>
        <SectionHeader>Code Snippets</SectionHeader>
        <Description>
          No downloadable datasets found. Code snippets require datasets with
          download URLs (contentUrl).
        </Description>
      </Container>
    );
  }

  return (
    <Container>
      <SectionHeader>Code Snippets</SectionHeader>
      <Description>
        Ready-to-use code for loading {totalDatasets} dataset
        {totalDatasets !== 1 ? "s" : ""}
        {groups.some((g) => g.datasets.length > 1)
          ? ` (${groups
              .filter((g) => g.datasets.length > 1)
              .map((g) => `${g.datasets.length} ${g.schemaName} files`)
              .join(", ")} loaded via loop)`
          : ""}
        {joinKeys.length > 0
          ? `, ${joinKeys.length} detected join column${joinKeys.length !== 1 ? "s" : ""}`
          : ""}
        .
      </Description>

      <TopBar>
        <LangBar>
          <LangButton
            $active={lang === "python"}
            onClick={() => setLang("python")}
          >
            Python
          </LangButton>
          <LangButton $active={lang === "r"} onClick={() => setLang("r")}>
            R
          </LangButton>
          <LangButton $active={lang === "cli"} onClick={() => setLang("cli")}>
            CLI
          </LangButton>
        </LangBar>

        {pythonCode && (
          <NotebookButton onClick={handleOpenNotebook}>
            Open in Notebook
          </NotebookButton>
        )}
      </TopBar>

      <SnippetBlock code={code} language={langMap[lang]} />
    </Container>
  );
};

export default CodeSnippetsView;

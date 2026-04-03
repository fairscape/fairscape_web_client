import React, { useMemo, useState } from "react";
import styled from "styled-components";
import SnippetBlock from "./SnippetBlock";
import { generatePythonSingle, generatePythonMulti } from "./generators/pythonGenerator";
import { generateRSingle, generateRMulti } from "./generators/rGenerator";
import { generateCLISingle, generateCLIMulti } from "./generators/cliGenerator";
import { SectionHeader } from "../../shared.styles";

const Container = styled.div`
  padding: 24px;
`;

const LangBar = styled.div`
  display: inline-flex;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 20px;
`;

const LangButton = styled.button<{ $active?: boolean }>`
  padding: 6px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#005f73" : "#6c757d")};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "white" : "#e9ecef")};
    color: #005f73;
  }
`;

const Description = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

interface DatasetInfo {
  name: string;
  contentUrl: string;
  fileFormat?: string;
  schemaName?: string;
  columns?: string[];
}

interface JoinKeyInfo {
  column: string;
  datasets: string[];
}

interface CodeSnippetsViewProps {
  metadata: any;
  bundleKind: string;
}

function extractDatasetsFromGraph(metadata: any): DatasetInfo[] {
  const graph = metadata?.["@graph"];
  if (!Array.isArray(graph)) return [];

  return graph
    .filter((entry: any) => {
      const type = entry["@type"];
      if (typeof type === "string") return false;
      if (Array.isArray(type))
        return type.some((t: string) => t.includes("Dataset"));
      return false;
    })
    .filter((entry: any) => entry.contentUrl && entry.contentUrl !== "Embargoed")
    .map((entry: any) => ({
      name: entry.name || entry["@id"] || "Dataset",
      contentUrl: entry.contentUrl,
      fileFormat: entry.fileFormat || entry["encodingFormat"] || "",
      columns: [],
    }));
}

function extractSchemasForJoinKeys(metadata: any): JoinKeyInfo[] {
  const graph = metadata?.["@graph"];
  if (!Array.isArray(graph)) return [];

  const schemas = graph.filter((entry: any) => {
    const type = entry["@type"];
    return typeof type === "string" && type === "EVI:Schema";
  });

  if (schemas.length < 2) return [];

  // Find datasets linked to each schema
  const datasets = graph.filter((entry: any) => {
    const type = entry["@type"];
    return Array.isArray(type) && type.some((t: string) => t.includes("Dataset"));
  });

  const schemaToDatasets: Record<string, string[]> = {};
  for (const ds of datasets) {
    const schemaRef = ds["evi:Schema"]?.["@id"] || ds["evi:Schema"];
    if (schemaRef) {
      if (!schemaToDatasets[schemaRef]) schemaToDatasets[schemaRef] = [];
      schemaToDatasets[schemaRef].push(ds.name || ds["@id"]);
    }
  }

  // Find shared columns across schemas
  const columnToDatasets: Record<string, string[]> = {};
  for (const schema of schemas) {
    const props = schema.properties || {};
    const linkedDatasets = schemaToDatasets[schema["@id"]] || [schema.name || "unknown"];
    for (const colName of Object.keys(props)) {
      if (!columnToDatasets[colName]) columnToDatasets[colName] = [];
      columnToDatasets[colName].push(...linkedDatasets);
    }
  }

  return Object.entries(columnToDatasets)
    .filter(([, dsList]) => {
      // Deduplicate and check if column appears in datasets linked to 2+ schemas
      const unique = [...new Set(dsList)];
      return unique.length >= 2;
    })
    .map(([column, dsList]) => ({
      column,
      datasets: [...new Set(dsList)],
    }))
    .sort((a, b) => b.datasets.length - a.datasets.length);
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
      columns: [],
    };
  }, [metadata, isMulti]);

  const multiDatasets = useMemo<DatasetInfo[]>(() => {
    if (!isMulti) return [];
    return extractDatasetsFromGraph(metadata);
  }, [metadata, isMulti]);

  const joinKeys = useMemo<JoinKeyInfo[]>(() => {
    if (!isMulti) return [];
    return extractSchemasForJoinKeys(metadata);
  }, [metadata, isMulti]);

  const code = useMemo(() => {
    if (isMulti && multiDatasets.length > 0) {
      switch (lang) {
        case "python":
          return generatePythonMulti(multiDatasets, joinKeys);
        case "r":
          return generateRMulti(multiDatasets, joinKeys);
        case "cli":
          return generateCLIMulti(multiDatasets);
      }
    }

    if (singleDataset) {
      switch (lang) {
        case "python":
          return generatePythonSingle(singleDataset);
        case "r":
          return generateRSingle(singleDataset);
        case "cli":
          return generateCLISingle(singleDataset);
      }
    }

    return null;
  }, [lang, isMulti, multiDatasets, singleDataset, joinKeys]);

  const langMap: Record<Lang, string> = {
    python: "python",
    r: "r",
    cli: "bash",
  };

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

  const datasetCount = isMulti ? multiDatasets.length : 1;

  return (
    <Container>
      <SectionHeader>Code Snippets</SectionHeader>
      <Description>
        Ready-to-use code for loading {datasetCount} dataset
        {datasetCount !== 1 ? "s" : ""}
        {joinKeys.length > 0
          ? ` with ${joinKeys.length} detected join column${joinKeys.length !== 1 ? "s" : ""}`
          : ""}
        .
      </Description>

      <LangBar>
        <LangButton $active={lang === "python"} onClick={() => setLang("python")}>
          Python
        </LangButton>
        <LangButton $active={lang === "r"} onClick={() => setLang("r")}>
          R
        </LangButton>
        <LangButton $active={lang === "cli"} onClick={() => setLang("cli")}>
          CLI
        </LangButton>
      </LangBar>

      <SnippetBlock code={code} language={langMap[lang]} />
    </Container>
  );
};

export default CodeSnippetsView;

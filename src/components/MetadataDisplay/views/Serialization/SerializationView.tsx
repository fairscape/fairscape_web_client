import React, { useState, useCallback } from "react";
import styled from "styled-components";

interface SerializationViewProps {
  json: string | null;
  rdfXml?: string | null;
  turtle?: string | null;
  showAllFormats?: boolean;
}

type SerializationType = "json" | "rdfXml" | "turtle";

const Container = styled.div`
  margin-top: 20px;
`;

const ButtonGroupContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
`;

const SelectButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ theme, $active, $disabled }) =>
    $disabled
      ? (theme?.colors?.textSecondary || "#6c757d") + "80"
      : $active
      ? theme?.colors?.primary || "#007bff"
      : theme?.colors?.textSecondary || "#6c757d"};
  border: none;
  border-radius: 6px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;

  &:hover:not(:disabled) {
    background-color: ${({ $active }) =>
      $active ? "white" : "rgba(255, 255, 255, 0.5)"};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const PreWrapper = styled.div`
  position: relative;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  max-height: 500px;
  overflow: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
`;

const Pre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme?.colors?.text || "#212529"};
  padding-right: 80px;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: white;
  border: 1px solid #eaeaea;
  padding: 8px 12px;
  border-radius: 6px;
  color: ${({ theme }) => theme?.colors?.textSecondary || "#6c757d"};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${({ theme }) => theme?.colors?.background || "#f8f9fa"};
    border-color: #d0d0d0;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const SerializationView: React.FC<SerializationViewProps> = ({
  json,
  rdfXml,
  turtle,
  showAllFormats = false,
}) => {
  const [type, setType] = useState<SerializationType>("json");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const getContent = useCallback(() => {
    switch (type) {
      case "json":
        return json ?? "JSON-LD not available.";
      case "rdfXml":
        return rdfXml ?? "RDF/XML not available.";
      case "turtle":
        return turtle ?? "Turtle not available.";
      default:
        return "";
    }
  }, [type, json, rdfXml, turtle]);

  const handleCopy = useCallback(() => {
    const currentContent = getContent();
    if (currentContent && !currentContent.endsWith("not available.")) {
      navigator.clipboard
        .writeText(currentContent)
        .then(() => {
          setCopyStatus("copied");
          setTimeout(() => setCopyStatus("idle"), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          alert("Failed to copy text.");
        });
    } else {
      alert("No valid content available to copy for the selected format.");
    }
  }, [getContent]);

  const currentContentForDisplay = getContent();
  const isContentReadyForCopy =
    currentContentForDisplay &&
    !currentContentForDisplay.endsWith("not available.");

  return (
    <Container>
      <ButtonGroupContainer>
        <ButtonGroup>
          <SelectButton
            $active={type === "json"}
            onClick={() => setType("json")}
            $disabled={!json && !showAllFormats}
          >
            JSON-LD
          </SelectButton>
          <SelectButton
            $active={type === "rdfXml"}
            onClick={() => setType("rdfXml")}
            $disabled={!rdfXml && !showAllFormats}
          >
            RDF/XML
          </SelectButton>
          <SelectButton
            $active={type === "turtle"}
            onClick={() => setType("turtle")}
            $disabled={!turtle && !showAllFormats}
          >
            Turtle
          </SelectButton>
        </ButtonGroup>
      </ButtonGroupContainer>

      <PreWrapper>
        <Pre>{currentContentForDisplay}</Pre>
        {isContentReadyForCopy && (
          <CopyButton onClick={handleCopy}>
            {copyStatus === "copied" ? "Copied!" : "Copy"}
          </CopyButton>
        )}
      </PreWrapper>
    </Container>
  );
};

export default SerializationView;

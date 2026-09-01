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
  border-radius: 2px;
  padding: 4px;
`;

const SelectButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ theme, $active, $disabled }) => {
    var e, l, c;
    return $disabled
      ? (((e = theme == null ? void 0 : theme.colors) == null
          ? void 0
          : e.textSecondary) || "#51626B") + "80"
      : $active
        ? ((l = theme == null ? void 0 : theme.colors) == null
            ? void 0
            : l.primary) || "#007bff"
        : ((c = theme == null ? void 0 : theme.colors) == null
            ? void 0
            : c.textSecondary) || "#51626B";
  }};
  border: none;
  border-radius: 2px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;

  &:hover:not(:disabled) {
    background-color: ${({ $active }) => ($active ? "white" : "rgba(255, 255, 255, 0.5)")};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const PreWrapper = styled.div`
  position: relative;
  background-color: white;
  border-radius: 2px;
  padding: 20px;
  max-height: 500px;
  overflow: auto;
  border: 1px solid #f7f9f9;
`;

const Pre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => {
    var t;
    return (
      ((t = theme == null ? void 0 : theme.colors) == null ? void 0 : t.text) ||
      "#18242A"
    );
  }};
  padding-right: 80px;

  @media (max-width: 768px) {
    padding-right: 48px;
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: white;
  border: 1px solid #eaeaea;
  padding: 8px 12px;
  border-radius: 2px;
  color: ${({ theme }) => {
    var t;
    return (
      ((t = theme == null ? void 0 : theme.colors) == null
        ? void 0
        : t.textSecondary) || "#51626B"
    );
  }};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => {
      var t;
      return (
        ((t = theme == null ? void 0 : theme.colors) == null
          ? void 0
          : t.background) || "#F7F9F9"
      );
    }};
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

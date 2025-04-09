import React, { useState, useCallback } from "react";
import styled from "styled-components";

interface SerializationViewProps {
  json: string | null;
  rdfXml: string | null;
  turtle: string | null;
  showAllFormats?: boolean;
}

type SerializationType = "json" | "rdfXml" | "turtle";

const Container = styled.div`
  margin-top: 20px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 20px;
`;

const SelectButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ theme, $active, $disabled }) =>
    $disabled
      ? theme.colors.textSecondary + "80"
      : $active
      ? theme.colors.primary
      : theme.colors.textSecondary};
  border: none;
  border-radius: 6px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin: 0 2px;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover:not(:disabled) {
    background-color: ${({ $active }) =>
      $active ? "white" : "rgba(255, 255, 255, 0.5)"};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }

  ${({ $active }) =>
    $active &&
    `
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
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
  color: ${({ theme }) => theme.colors.text};
  padding-right: 32px; /* Space for copy button */
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: white;
  border: 1px solid #eaeaea;
  padding: 8px 12px;
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
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

  const getContent = () => {
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
  };

  const handleCopy = useCallback(() => {
    const content = getContent();
    if (content && !content.endsWith("not available.")) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          setCopyStatus("copied");
          setTimeout(() => setCopyStatus("idle"), 2000); // Reset after 2s
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          alert("Failed to copy text.");
        });
    } else {
      alert("No content available to copy.");
    }
  }, [type, json, rdfXml, turtle]);

  const getButtonLabel = (serializationType: SerializationType) => {
    switch (serializationType) {
      case "json":
        return "JSON-LD";
      case "rdfXml":
        return "RDF/XML";
      case "turtle":
        return "Turtle";
      default:
        return "Unknown";
    }
  };

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <ButtonGroup>
          <SelectButton
            $active={type === "json"}
            onClick={() => setType("json")}
          >
            JSON-LD
          </SelectButton>

          <SelectButton
            $active={type === "rdfXml"}
            $disabled={!rdfXml && !showAllFormats}
            onClick={() => rdfXml && setType("rdfXml")}
          >
            RDF/XML
          </SelectButton>

          <SelectButton
            $active={type === "turtle"}
            $disabled={!turtle && !showAllFormats}
            onClick={() => turtle && setType("turtle")}
          >
            Turtle
          </SelectButton>
        </ButtonGroup>
      </div>

      <PreWrapper>
        <Pre>{getContent()}</Pre>
        <CopyButton onClick={handleCopy} title={`Copy ${getButtonLabel(type)}`}>
          {copyStatus === "copied" ? "Copied!" : "Copy"}
        </CopyButton>
      </PreWrapper>
    </Container>
  );
};

export default SerializationView;

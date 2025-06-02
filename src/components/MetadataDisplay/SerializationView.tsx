import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import jsonld from "jsonld";
import N3 from "n3";

const escapeXmlChars = (unsafe: string): string => {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/'/g, "'");
};

const YOUR_EXTERNAL_CONTEXT = {
  "@vocab": "https://schema.org/",
  EVI: "https://w3id.org/EVI#",
};

const convertNQuadsToRdfXml = async (
  nquads: string,
  context?: any
): Promise<string> => {
  if (typeof nquads !== "string" || nquads.trim() === "") {
    return Promise.resolve(
      '<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"></rdf:RDF>'
    );
  }
  try {
    const parser = new N3.Parser({ format: "N-Quads" });
    const quads = parser.parse(nquads);

    if (quads.length === 0) {
      if (nquads.trim() !== "") {
        console.warn(
          "N-Quads input was not empty but parsed to zero quads for RDF/XML."
        );
      }
      return Promise.resolve(
        '<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"></rdf:RDF>'
      );
    }

    let rdfXmlString =
      '<?xml version="1.0"?>\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"';

    const prefixesToDeclare: { [prefix: string]: string } = {};
    const knownPrefixesFromContext: { [uri: string]: string } = {};

    if (context && typeof context === "object") {
      for (const key in context) {
        if (
          typeof context[key] === "string" &&
          (context[key].endsWith("#") || context[key].endsWith("/")) &&
          !key.includes(":") &&
          key !== "@vocab"
        ) {
          knownPrefixesFromContext[context[key]] = key;
        }
      }
      if (context["@vocab"] && typeof context["@vocab"] === "string") {
        if (
          context["@vocab"] === "https://schema.org/" &&
          !knownPrefixesFromContext[context["@vocab"]]
        ) {
          knownPrefixesFromContext[context["@vocab"]] = "schema";
        }
      }
    }

    let genericNsCount = 0;

    const getQName = (uri: string): string => {
      for (const nsUri in knownPrefixesFromContext) {
        if (uri.startsWith(nsUri)) {
          const prefix = knownPrefixesFromContext[nsUri];
          const localName = uri.substring(nsUri.length);
          if (!prefixesToDeclare[prefix]) prefixesToDeclare[prefix] = nsUri;
          return `${prefix}:${localName}`;
        }
      }
      const match = uri.match(/^(.*?)([#\/])([^#\/]+)$/);
      if (match) {
        const ns = match[1] + match[2];
        let prefix = `ns${genericNsCount}`;
        for (const p in prefixesToDeclare) {
          if (prefixesToDeclare[p] === ns) {
            prefix = p;
            break;
          }
        }
        if (!prefixesToDeclare[prefix]) {
          prefixesToDeclare[prefix] = ns;
          genericNsCount++;
        }
        return `${prefix}:${match[3]}`;
      }
      return uri;
    };

    quads.forEach((quad) => {
      getQName(quad.subject.value);
      getQName(quad.predicate.value);
      if (quad.object.termType === "NamedNode") {
        getQName(quad.object.value);
      }
    });

    for (const prefix in prefixesToDeclare) {
      rdfXmlString += `\n  xmlns:${prefix}="${escapeXmlChars(
        prefixesToDeclare[prefix]
      )}"`;
    }
    rdfXmlString += ">\n";

    const quadsBySubject: { [subjectUri: string]: N3.Quad[] } = {};
    quads.forEach((q) => {
      if (!quadsBySubject[q.subject.value])
        quadsBySubject[q.subject.value] = [];
      quadsBySubject[q.subject.value].push(q);
    });

    for (const subjectUri in quadsBySubject) {
      rdfXmlString += `  <rdf:Description rdf:about="${escapeXmlChars(
        subjectUri
      )}">\n`;
      quadsBySubject[subjectUri].forEach((quad) => {
        const predQName = getQName(quad.predicate.value);

        if (quad.object.termType === "NamedNode") {
          rdfXmlString += `    <${predQName} rdf:resource="${escapeXmlChars(
            quad.object.value
          )}"/>\n`;
        } else {
          rdfXmlString += `    <${predQName}`;
          if (quad.object.language) {
            rdfXmlString += ` xml:lang="${escapeXmlChars(
              quad.object.language
            )}"`;
          } else if (
            quad.object.datatype &&
            quad.object.datatype.value !==
              "http://www.w3.org/2001/XMLSchema#string" &&
            quad.object.datatype.value !==
              "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
          ) {
            rdfXmlString += ` rdf:datatype="${escapeXmlChars(
              quad.object.datatype.value
            )}"`;
          }
          rdfXmlString += `>${escapeXmlChars(
            quad.object.value
          )}</${predQName}>\n`;
        }
      });
      rdfXmlString += `  </rdf:Description>\n`;
    }
    rdfXmlString += "</rdf:RDF>";
    return Promise.resolve(rdfXmlString);
  } catch (e) {
    console.error("Error in convertNQuadsToRdfXml:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return Promise.resolve(
      `Error generating RDF/XML from N-Quads: ${errorMessage}`
    );
  }
};

const generateRdfFormatsFromJSONLD = async (
  jsonLdString: string
): Promise<{ rdfXml: string; turtle: string }> => {
  try {
    if (!jsonLdString || jsonLdString.trim() === "") {
      throw new Error("Input JSON-LD string is empty.");
    }
    const jsonLdObject = JSON.parse(jsonLdString);

    const nquads = (await jsonld.toRDF(jsonLdObject, {
      format: "application/n-quads",
      expandContext: YOUR_EXTERNAL_CONTEXT,
    })) as string;

    if (!nquads || nquads.trim() === "") {
      console.warn(
        "JSON-LD toRDF resulted in empty N-Quads. Check JSON-LD structure and context."
      );
      return {
        rdfXml:
          '<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="error:emptyNQuads"><rdfs:label xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">JSON-LD conversion resulted in no RDF triples.</rdfs:label></rdf:Description></rdf:RDF>',
        turtle: "# JSON-LD conversion resulted in no RDF triples.",
      };
    }

    const turtlePromise = new Promise<string>((resolve, reject) => {
      const parser = new N3.Parser({ format: "N-Quads" });
      const prefixesForTurtle: N3.Prefixes = {};
      if (YOUR_EXTERNAL_CONTEXT.EVI)
        prefixesForTurtle.EVI = YOUR_EXTERNAL_CONTEXT.EVI;
      if (YOUR_EXTERNAL_CONTEXT["@vocab"] === "https://schema.org/") {
        prefixesForTurtle.schema = YOUR_EXTERNAL_CONTEXT["@vocab"];
      } else if (YOUR_EXTERNAL_CONTEXT["@vocab"]) {
        prefixesForTurtle.vocab = YOUR_EXTERNAL_CONTEXT["@vocab"];
      }

      const writer = new N3.Writer({
        format: "text/turtle",
        prefixes: prefixesForTurtle,
      });
      const quads = parser.parse(nquads);
      writer.addQuads(quads);
      writer.end((error, result) => {
        if (error) {
          console.error("Error generating Turtle:", error);
          reject(new Error(`Turtle generation failed: ${error.message}`));
        } else {
          resolve(result);
        }
      });
    });

    const rdfXmlPromise = convertNQuadsToRdfXml(nquads, YOUR_EXTERNAL_CONTEXT);

    const [turtle, rdfXml] = await Promise.all([turtlePromise, rdfXmlPromise]);

    return { rdfXml, turtle };
  } catch (error) {
    console.error("Error converting JSON-LD to RDF formats:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      rdfXml: `RDF/XML generation failed: ${errorMessage}. Check console for details.`,
      turtle: `Turtle generation failed: ${errorMessage}. Check console for details.`,
    };
  }
};

interface SerializationViewProps {
  json: string | null;
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
    outline: 2px solid ${({ theme }) => theme?.colors?.primary || "#007bff"};
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
  display: flex;
  align-items: center;
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
  showAllFormats = false,
}) => {
  const [type, setType] = useState<SerializationType>("json");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const [rdfXmlContent, setRdfXmlContent] = useState<string | null>(null);
  const [turtleContent, setTurtleContent] = useState<string | null>(null);
  const [isLoadingFormats, setIsLoadingFormats] = useState<boolean>(false);

  useEffect(() => {
    if (json) {
      setIsLoadingFormats(true);
      setRdfXmlContent(null);
      setTurtleContent(null);
      generateRdfFormatsFromJSONLD(json)
        .then(({ rdfXml, turtle }) => {
          setRdfXmlContent(rdfXml);
          setTurtleContent(turtle);
        })
        .catch((error) => {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          setRdfXmlContent(`RDF/XML generation failed: ${errorMessage}`);
          setTurtleContent(`Turtle generation failed: ${errorMessage}`);
        })
        .finally(() => {
          setIsLoadingFormats(false);
        });
    } else {
      setRdfXmlContent("RDF/XML not available (no JSON input).");
      setTurtleContent("Turtle not available (no JSON input).");
      setIsLoadingFormats(false);
    }
  }, [json]);

  const getContent = useCallback(() => {
    switch (type) {
      case "json":
        return json ?? "JSON-LD not available.";
      case "rdfXml":
        if (isLoadingFormats && json) return "Generating RDF/XML...";
        return rdfXmlContent ?? "RDF/XML not available.";
      case "turtle":
        if (isLoadingFormats && json) return "Generating Turtle...";
        return turtleContent ?? "Turtle not available.";
      default:
        return "";
    }
  }, [type, json, rdfXmlContent, turtleContent, isLoadingFormats]);

  const handleCopy = useCallback(() => {
    const currentContent = getContent();
    const isServiceMessage =
      currentContent.endsWith("not available.") ||
      currentContent.startsWith("Generating") ||
      currentContent.includes("generation failed:");

    if (currentContent && !isServiceMessage) {
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

  const currentContentForDisplay = getContent();
  const isContentReadyForCopy =
    currentContentForDisplay &&
    !currentContentForDisplay.endsWith("not available.") &&
    !currentContentForDisplay.startsWith("Generating") &&
    !currentContentForDisplay.includes("generation failed:");

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
            $disabled={
              (!json && !showAllFormats) ||
              (isLoadingFormats && type === "rdfXml")
            }
            onClick={() => setType("rdfXml")}
          >
            RDF/XML
          </SelectButton>

          <SelectButton
            $active={type === "turtle"}
            $disabled={
              (!json && !showAllFormats) ||
              (isLoadingFormats && type === "turtle")
            }
            onClick={() => setType("turtle")}
          >
            Turtle
          </SelectButton>
        </ButtonGroup>
      </ButtonGroupContainer>

      <PreWrapper>
        <Pre>{currentContentForDisplay}</Pre>
        {isContentReadyForCopy && (
          <CopyButton
            onClick={handleCopy}
            title={`Copy ${getButtonLabel(type)}`}
          >
            {copyStatus === "copied" ? "Copied!" : "Copy"}
          </CopyButton>
        )}
      </PreWrapper>
    </Container>
  );
};

export default SerializationView;

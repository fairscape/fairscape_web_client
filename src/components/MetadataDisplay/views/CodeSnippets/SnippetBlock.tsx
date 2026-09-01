import React, { useState } from "react";
import styled from "styled-components";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const Container = styled.div`
  position: relative;
  margin-bottom: 16px;
  border-radius: 2px;
  overflow: hidden;
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  border: 1px solid
    ${({ $copied }) => ($copied ? "#2e7d32" : "rgba(255,255,255,0.3)")};
  border-radius: 2px;
  background: ${({ $copied }) => ($copied ? "#2e7d32" : "rgba(255,255,255,0.1)")};
  color: white;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;

  &:hover {
    background: ${({ $copied }) => ($copied ? "#2e7d32" : "rgba(255,255,255,0.2)")};
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

interface SnippetBlockProps {
  code: string;
  language: string;
}

const SnippetBlock: React.FC<SnippetBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container>
      <CopyButton onClick={handleCopy} $copied={copied}>
        {copied ? "Copied!" : "Copy"}
      </CopyButton>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: "8px",
          fontSize: "0.85rem",
          lineHeight: 1.5,
          padding: "16px",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </Container>
  );
};

export default SnippetBlock;

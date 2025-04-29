// src/components/EvidenceGraph/EvidenceNode.tsx
import React, { useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { EvidenceNodeData } from "../../types/graph";
import {
  formatPropertyValue,
  getDisplayableProperties,
} from "../../utils/graphUtils";
import styled from "styled-components";

const getNodeColor = (type: string): string => {
  switch (type) {
    case "Dataset":
    case "Sample":
      return "#8AE68A";
    case "Computation":
    case "Experiment":
      return "#FD9A9A";
    case "Software":
    case "Instrument":
      return "#FFC107";
    case "DatasetCollection":
      return "#B5DEFF";
    default:
      return "#E0E0E0";
  }
};

const TooltipWrapper = styled.div`
  max-width: 480px;
  text-align: left;
  font-size: 13px;
  padding: 8px;
  font-family: sans-serif;
  color: #333;

  h4 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 1.1em;
    color: #000;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
  }

  .tooltip-section {
    margin-bottom: 8px;
    padding-bottom: 8px;
    &:not(:last-child) {
      border-bottom: 1px dotted #eee;
    }
  }

  .prop-item {
    display: flex;
    margin: 4px 0;
    line-height: 1.4;
  }

  .prop-key {
    font-weight: bold;
    min-width: 100px;
    flex-shrink: 0;
    margin-right: 8px;
    color: #555;
    vertical-align: top;
  }

  .prop-value {
    word-break: break-word;
    a {
      color: #007bff;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      background-color: #f8f8f8;
      padding: 4px 6px;
      border-radius: 3px;
      font-size: 0.95em;
      max-height: 150px;
      overflow-y: auto;
    }
  }

  .node-meta {
    font-size: 0.9em;
    color: #666;
  }

  em.expand-hint {
    display: block;
    margin-top: 10px;
    color: #007bff;
    font-style: italic;
    font-size: 0.9em;
  }
`;

const NodeWrapper = styled.div<{
  expandable: boolean;
  color: string;
  highlightClass: string;
}>`
  background: #fff;
  padding: 0;
  border-radius: 5px;
  border: 1px solid #ddd;
  text-align: center;
  width: 180px;
  height: 90px;
  font-size: 13px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border 0.2s ease, box-shadow 0.2s ease;
  cursor: default;

  ${({ expandable }) =>
    expandable &&
    `
    border: 2px dashed #555;
    cursor: pointer;
  `}

  &.path-highlight {
    box-shadow: 0 0 0 3px rgba(255, 0, 114, 0.7) !important;
    border: 2px solid rgba(255, 0, 114, 0.9) !important;
  }
  &.path-start-end {
    box-shadow: 0 0 0 4px rgba(0, 114, 255, 0.7) !important;
    border: 2px solid rgba(0, 114, 255, 0.9) !important;
  }
`;

const NodeHeader = styled.div<{ bgColor: string }>`
  background: ${(props) => props.bgColor};
  padding: 8px 6px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  width: 100%;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  flex-shrink: 0;
`;

const NodeContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  width: 100%;
  text-align: center;
  word-break: break-word;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 1.3;
  box-sizing: border-box;
  min-height: 0;
`;

const NodeLabel = styled.div`
  width: 100%;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const InfoButton = styled.button<{ bgColor: string }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 22px;
  height: 22px;
  background: ${(props) => props.bgColor};
  color: #333;
  border: none;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  padding: 0;
  margin: 0;
  border-bottom-left-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const EvidenceNode: React.FC<NodeProps<EvidenceNodeData>> = ({
  data,
  isConnectable,
  id,
  selected,
  className = "",
}) => {
  const nodeColor = getNodeColor(data.type);

  const renderTooltipContent = useCallback(() => {
    const sourceProps = getDisplayableProperties(data._sourceData);
    const allProps = { ...sourceProps, ...data.properties };

    delete allProps.name;
    delete allProps.label;
    delete allProps.description;
    delete allProps["@id"];
    delete allProps["@type"];
    delete allProps.count;

    return (
      <TooltipWrapper>
        <h4>{data.label || data.displayName || "Node Details"}</h4>

        <div className="tooltip-section node-meta">
          <div className="prop-item">
            <span className="prop-key">@id:</span>
            <span
              className="prop-value"
              dangerouslySetInnerHTML={{ __html: formatPropertyValue(data.id) }}
            ></span>
          </div>
          <div className="prop-item">
            <span className="prop-key">@type:</span>
            <span className="prop-value">{data.type}</span>
          </div>
          {data.description && (
            <div className="prop-item">
              <span className="prop-key">description:</span>
              <span className="prop-value">{data.description}</span>
            </div>
          )}
          {data.type === "DatasetCollection" &&
            data.properties?.count !== undefined && (
              <div className="prop-item">
                <span className="prop-key">Items:</span>
                <span className="prop-value">{data.properties.count}</span>
              </div>
            )}
        </div>

        {Object.entries(allProps).length > 0 && (
          <div className="tooltip-section">
            {Object.entries(allProps).map(([key, value]) => (
              <div key={key} className="prop-item">
                <span className="prop-key">{key}:</span>
                <span
                  className="prop-value"
                  dangerouslySetInnerHTML={{
                    __html: formatPropertyValue(value),
                  }}
                ></span>
              </div>
            ))}
          </div>
        )}

        {data.expandable && (
          <em className="expand-hint">
            (Click node center to expand{" "}
            {data.type === "DatasetCollection" ? "next item" : "details"})
            <br />
            (Shift+Click to select for path)
          </em>
        )}
        {!data.expandable && (
          <em className="expand-hint">(Shift+Click to select for path)</em>
        )}
      </TooltipWrapper>
    );
  }, [data]);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <NodeWrapper
      expandable={!!data.expandable}
      color={nodeColor}
      highlightClass={className}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: "#555", zIndex: 1 }}
      />

      <NodeHeader bgColor={nodeColor}>{data.type}</NodeHeader>

      <NodeContent>
        <NodeLabel title={data.label}>{data.displayName}</NodeLabel>
      </NodeContent>

      <Tippy
        content={renderTooltipContent()}
        theme="light"
        interactive={true}
        placement="right-start"
        trigger="mouseenter focus"
        appendTo={() => document.body}
        maxWidth={500}
        delay={[150, 0]}
      >
        <InfoButton
          onClick={handleIconClick}
          aria-label={`Details for ${data.label || data.displayName}`}
          bgColor={nodeColor}
        >
          i
        </InfoButton>
      </Tippy>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: "#555", zIndex: 1 }}
      />
    </NodeWrapper>
  );
};

export default React.memo(EvidenceNode);

import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, NodeProps } from "reactflow";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import styled from "styled-components";
import { EvidenceNodeData, AnnotationData, Concern } from "../../types/graph";
import { formatPropertyValue, getDisplayableProperties } from "./graphUtils";

const getNodeColor = (type: string): string => {
  switch (type) {
    case "Dataset":
    case "Sample":
      return "#8AE68A";
    case "ROCrate":
      return "#64C2A6";
    case "Computation":
      return "#FD9A9A";
    case "Software":
    case "Instrument":
      return "#FFC107";
    case "MLModel":
      return "#C8A2FF";
    case "Annotation":
    case "AnnotatedComputation":
      return "#FFA07A";
    case "DatasetCollection":
    case "DatasetGroup":
      return "#B5DEFF";
    case "Person":
      return "#87CEEB";
    default:
      return "#E0E0E0";
  }
};

// --- Styled Components ---

const NodeWrapper = styled.div<{ $expandable: boolean }>`
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

  ${({ $expandable }) =>
    $expandable &&
    `border: 2px dashed #555; cursor: pointer;`}
`;

const NodeHeader = styled.div<{ $bgColor: string }>`
  background: ${(props) => props.$bgColor};
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
  overflow: hidden;
  font-size: 12px;
  line-height: 1.3;
  box-sizing: border-box;
`;

const NodeLabel = styled.div`
  width: 100%;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const InfoButton = styled.button<{ $bgColor: string; $hasAnnotation: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 22px;
  height: 22px;
  background: ${(props) => props.$bgColor};
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

  &:hover { opacity: 1; }

  ${({ $hasAnnotation }) =>
    $hasAnnotation &&
    `
    background: #2c3e50;
    color: #fff;
    opacity: 1;
    box-shadow: 0 0 0 2px #2c3e50, 0 1px 3px rgba(0,0,0,0.3);
  `}
`;

const TooltipWrapper = styled.div`
  max-width: 480px;
  text-align: left;
  font-size: 13px;
  padding: 8px;
  font-family: sans-serif;
  color: #333;

  h4 { margin: 0 0 8px; font-size: 1.1em; color: #000; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .tooltip-section { margin-bottom: 8px; padding-bottom: 8px; &:not(:last-child) { border-bottom: 1px dotted #eee; } }
  .prop-item { display: flex; margin: 4px 0; line-height: 1.4; }
  .prop-key { font-weight: bold; min-width: 100px; flex-shrink: 0; margin-right: 8px; color: #555; }
  .prop-value { word-break: break-word; a { color: #007bff; text-decoration: none; &:hover { text-decoration: underline; } } pre { margin: 0; white-space: pre-wrap; word-break: break-all; background: #f8f8f8; padding: 4px 6px; border-radius: 3px; font-size: 0.95em; max-height: 150px; overflow-y: auto; } }

  .annotation-summary { background: #f0f4ff; border: 1px solid #c5d5ea; border-radius: 4px; padding: 8px 10px; margin: 8px 0; }
  .annotation-summary p { margin: 0 0 6px; font-size: 12.5px; line-height: 1.5; }
  .concerns-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; }
  .concerns-critical { background: #fde8e8; color: #c0392b; }
  .concerns-moderate { background: #fef9e7; color: #d68910; }
  .concerns-minor { background: #eaf4fb; color: #1a5276; }

  .view-detail-btn {
    display: inline-block;
    margin-top: 6px;
    padding: 4px 10px;
    background: #2c3e50;
    color: #fff;
    border: none;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    &:hover { background: #34495e; }
  }
`;

// --- Detail Modal ---

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 24px;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 1100px;
  overflow-y: auto;
  padding: 32px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  font-size: 14px;
  color: #333;

  h2 { margin: 0 0 16px; color: #2c3e50; font-size: 20px; }
  h3 { margin: 16px 0 8px; color: #34495e; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h4 { margin: 12px 0 6px; color: #555; font-size: 14px; }

  .close-btn {
    float: right;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    &:hover { color: #000; }
  }

  .concern-item {
    padding: 6px 10px;
    margin: 4px 0;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
  }
  .concern-critical { background: #fde8e8; border-left: 4px solid #c0392b; }
  .concern-moderate { background: #fef9e7; border-left: 4px solid #d68910; }
  .concern-minor { background: #eaf4fb; border-left: 4px solid #1a5276; }

  .code-analysis-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 8px 0;
  }
  .code-analysis-card .software-name { font-weight: 600; color: #2c3e50; font-size: 14px; }
  .code-analysis-card .summary { margin: 6px 0; color: #555; }
  .key-functions { margin: 4px 0 4px 16px; }
  .key-functions li { font-size: 13px; color: #666; }

  .dataset-summary {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    font-size: 13px;
    border-bottom: 1px dotted #eee;
  }
  .dataset-summary .role-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    background: #e9ecef;
    color: #495057;
    text-transform: uppercase;
  }

  .provenance-info {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 13px;
    color: #666;
    margin-top: 12px;
  }
  .provenance-info span { color: #333; font-weight: 500; }
`;

function getConcernCssClass(concern: Concern): string {
  switch (concern.level) {
    case "CRITICAL": return "critical";
    case "MODERATE": return "moderate";
    default: return "minor";
  }
}

function AnnotationDetailModal({
  annotation,
  nodeName,
  onClose,
}: {
  annotation: AnnotationData;
  nodeName: string;
  onClose: () => void;
}) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Analysis: {nodeName}</h2>

        <h3>Step Summary</h3>
        <p>{annotation["evi:stepSummary"]}</p>

        {annotation["evi:codeAnalysis"] && annotation["evi:codeAnalysis"].length > 0 && (
          <>
            <h3>Code Analysis</h3>
            {annotation["evi:codeAnalysis"].map((ca, i) => (
              <div key={i} className="code-analysis-card">
                <div className="software-name">{ca.name || ca.software["@id"]}</div>
                <p className="summary">{ca.summary}</p>
                {ca.keyFunctions && ca.keyFunctions.length > 0 && (
                  <>
                    <h4>Key Functions</h4>
                    <ul className="key-functions">
                      {ca.keyFunctions.map((fn, j) => <li key={j}>{fn}</li>)}
                    </ul>
                  </>
                )}
                {ca.concerns && ca.concerns.length > 0 && (
                  <>
                    <h4>Code Concerns</h4>
                    {ca.concerns.map((c, j) => (
                      <div key={j} className={`concern-item concern-${getConcernCssClass(c)}`}>{c.description}</div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {annotation["evi:inputSummaries"] && annotation["evi:inputSummaries"].length > 0 && (
          <>
            <h3>Inputs</h3>
            {annotation["evi:inputSummaries"].map((ds, i) => (
              <div key={i} className="dataset-summary">
                <span className="role-badge">{ds.role || "input"}</span>
                <div>
                  <strong>{ds.name || ds.dataset["@id"]}</strong>
                  {ds.description && <span> &mdash; {ds.description}</span>}
                  {ds.dataQuality && (
                    <div className="data-quality-note" style={{ marginTop: 4, fontSize: '0.9em', color: '#6b7280' }}>
                      <strong>Data Quality:</strong> {ds.dataQuality}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {annotation["evi:outputSummaries"] && annotation["evi:outputSummaries"].length > 0 && (
          <>
            <h3>Outputs</h3>
            {annotation["evi:outputSummaries"].map((ds, i) => (
              <div key={i} className="dataset-summary">
                <span className="role-badge">{ds.role || "output"}</span>
                <div>
                  <strong>{ds.name || ds.dataset["@id"]}</strong>
                  {ds.description && <span> &mdash; {ds.description}</span>}
                  {ds.dataQuality && (
                    <div className="data-quality-note" style={{ marginTop: 4, fontSize: '0.9em', color: '#6b7280' }}>
                      <strong>Data Quality:</strong> {ds.dataQuality}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {annotation["evi:concerns"] && annotation["evi:concerns"].length > 0 && (
          <>
            <h3>Concerns</h3>
            {annotation["evi:concerns"].map((c, i) => (
              <div key={i} className={`concern-item concern-${getConcernCssClass(c)}`}>
                {c.description}
              </div>
            ))}
          </>
        )}

        <div className="provenance-info">
          <span>LLM Model:</span> {annotation["evi:llmModel"]}
          {annotation["evi:llmTemperature"] !== undefined && (
            <> &middot; <span>Temperature:</span> {annotation["evi:llmTemperature"]}</>
          )}
          &middot; <span>Date:</span> {annotation.dateCreated}
          {annotation["evi:interpreterVersion"] && (
            <> &middot; <span>Version:</span> {annotation["evi:interpreterVersion"]}</>
          )}
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}

// --- Main Node Component ---

const AnnotatedEvidenceNode: React.FC<NodeProps<EvidenceNodeData>> = (props) => {
  const { data, isConnectable, id } = props;
  const className = (props as any).className || "";
  const nodeColor = getNodeColor(data.type);
  const hasAnnotation = !!data._annotation;
  const [showModal, setShowModal] = useState(false);

  const renderTooltipContent = useCallback(() => {
    const sourceProps = getDisplayableProperties(data._sourceData as any);
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

        <div className="tooltip-section">
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
          {data.type === "DatasetCollection" && data.properties?.count !== undefined && (
            <div className="prop-item">
              <span className="prop-key">Items:</span>
              <span className="prop-value">{data.properties.count}</span>
            </div>
          )}
        </div>

        {/* Annotation summary for computation nodes */}
        {hasAnnotation && data._annotation && (
          <div className="annotation-summary">
            <p><strong>LLM Analysis:</strong> {data._annotation["evi:stepSummary"]?.substring(0, 200)}
              {(data._annotation["evi:stepSummary"]?.length || 0) > 200 ? "..." : ""}
            </p>
            {data._annotation["evi:concerns"] && data._annotation["evi:concerns"].length > 0 && (
              <div>
                {(() => {
                  const concerns = data._annotation!["evi:concerns"]!;
                  const critical = concerns.filter((c) => c.level === "CRITICAL").length;
                  const moderate = concerns.filter((c) => c.level === "MODERATE").length;
                  const minor = concerns.filter((c) => c.level === "MINOR").length;
                  return (
                    <>
                      {critical > 0 && <span className="concerns-badge concerns-critical">{critical} Critical</span>}
                      {" "}
                      {moderate > 0 && <span className="concerns-badge concerns-moderate">{moderate} Moderate</span>}
                      {" "}
                      {minor > 0 && <span className="concerns-badge concerns-minor">{minor} Minor</span>}
                    </>
                  );
                })()}
              </div>
            )}
            <button
              className="view-detail-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              View Full Analysis
            </button>
          </div>
        )}

        {/* Other properties */}
        {!hasAnnotation && Object.entries(allProps).length > 0 && (
          <div className="tooltip-section">
            {Object.entries(allProps).slice(0, 6).map(([key, value]) => (
              <div key={key} className="prop-item">
                <span className="prop-key">{key}:</span>
                <span
                  className="prop-value"
                  dangerouslySetInnerHTML={{ __html: formatPropertyValue(value) }}
                />
              </div>
            ))}
          </div>
        )}

        {data.expandable && (
          <em style={{ display: "block", marginTop: 10, color: "#007bff", fontStyle: "italic", fontSize: "0.9em" }}>
            (Click node to expand)
          </em>
        )}
      </TooltipWrapper>
    );
  }, [data, hasAnnotation]);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <NodeWrapper $expandable={!!data.expandable} className={className}>
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: "#555", zIndex: 1 }} />

        <NodeHeader $bgColor={nodeColor}>{data.type}</NodeHeader>

        <NodeContent>
          <NodeLabel title={data.displayName || data.label}>
            {data.displayName || data.label || id}
          </NodeLabel>
        </NodeContent>

        <Tippy
          content={renderTooltipContent()}
          theme="light"
          interactive={true}
          placement="right-start"
          trigger="mouseenter focus click"
          appendTo={() => document.body}
          maxWidth={500}
          delay={[150, 0]}
        >
          <InfoButton
            onClick={handleIconClick}
            aria-label={`Details for ${data.displayName || data.label || id}`}
            $bgColor={nodeColor}
            $hasAnnotation={hasAnnotation}
          >
            {hasAnnotation ? "\u2139" : "i"}
          </InfoButton>
        </Tippy>

        <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: "#555", zIndex: 1 }} />
      </NodeWrapper>

      {showModal && data._annotation && createPortal(
        <AnnotationDetailModal
          annotation={data._annotation}
          nodeName={data.label || data.displayName || id}
          onClose={() => setShowModal(false)}
        />,
        document.body
      )}
    </>
  );
};

export default React.memo(AnnotatedEvidenceNode);

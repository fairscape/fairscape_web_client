import React, { useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, NodeProps } from "reactflow";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { EvidenceNodeData, AnnotationData, Assumption, Concern, EvidencePointer, normalizeImpact } from "../../types/graph";
import { formatPropertyValue, getDisplayableProperties } from "./graphUtils";
import { GraphDataServiceContext } from "./AnnotatedGraphViewer";
import AssumptionChainModal from "./AssumptionChainModal";

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

// ---------------------------------------------------------------------------
// Backward compat: normalize old concerns to assumption shape for display
// ---------------------------------------------------------------------------

interface DisplayAssumption {
  impact: string;
  name?: string;
  description: string;
  downstreamImpacts?: string;
  evidence?: EvidencePointer;
}

function getStepAssumptions(annotation: AnnotationData): DisplayAssumption[] {
  if (annotation["evi:assumptions"] && annotation["evi:assumptions"].length > 0) {
    return annotation["evi:assumptions"].map((a) => ({ ...a, impact: normalizeImpact(a.impact) }));
  }
  // Fallback: map old evi:concerns
  if (annotation["evi:concerns"] && annotation["evi:concerns"].length > 0) {
    return annotation["evi:concerns"].map((c) => ({
      impact: normalizeImpact(c.level),
      description: c.description,
    }));
  }
  return [];
}

function getCodeAssumptions(ca: { assumptions?: Assumption[]; concerns?: Concern[] }): DisplayAssumption[] {
  if (ca.assumptions && ca.assumptions.length > 0) {
    return ca.assumptions.map((a) => ({ ...a, impact: normalizeImpact(a.impact) }));
  }
  if (ca.concerns && ca.concerns.length > 0) {
    return ca.concerns.map((c) => ({
      impact: normalizeImpact(c.level),
      description: c.description,
    }));
  }
  return [];
}

function getAssumptionCssClass(impact: string): string {
  // normalizeImpact should have already been called, but handle edge cases
  switch (normalizeImpact(impact)) {
    case "CRITICAL": return "critical";
    case "MAJOR": return "major";
    case "MINOR": return "minor";
    default: return "minor";
  }
}

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
  .assumptions-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 700; }
  .assumptions-critical { background: #f3e8f9; color: #7b2d8e; }
  .assumptions-major { background: #fef9e7; color: #d68910; }
  .assumptions-minor { background: #eaf4fb; color: #1a5276; }

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

  .assumption-item {
    padding: 6px 10px;
    margin: 4px 0;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
  }
  .assumption-critical { background: #f3e8f9; border-left: 4px solid #7b2d8e; }
  .assumption-major { background: #fef9e7; border-left: 4px solid #d68910; }
  .assumption-minor { background: #eaf4fb; border-left: 4px solid #1a5276; }

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

const ModalMarkdown = styled.div`
  font-size: 14px;
  line-height: 1.6;
  p { margin: 0 0 8px; }
  p:last-child { margin-bottom: 0; }
  h1, h2, h3, h4, h5, h6 { margin: 12px 0 6px; color: #2c3e50; }
  h1 { font-size: 18px; }
  h2 { font-size: 16px; }
  h3 { font-size: 15px; }
  ul, ol { margin: 4px 0; padding-left: 20px; }
  li { margin: 2px 0; }
  strong { color: #2c3e50; }
  code { background: #f1f3f5; padding: 1px 4px; border-radius: 3px; font-size: 0.9em; }
`;

const AssumptionDetailBlock = styled.div`
  .assumption-name { font-weight: 600; color: #2c3e50; margin-bottom: 2px; }
  .assumption-desc { margin: 2px 0 4px; color: #555; }
  .assumption-downstream {
    background: #fff8e1;
    border-left: 3px solid #ffb300;
    padding: 4px 8px;
    border-radius: 2px;
    margin: 4px 0;
    font-size: 12.5px;
  }
  .assumption-downstream-label {
    font-weight: 600;
    color: #666;
    font-size: 11px;
    text-transform: uppercase;
  }
  .assumption-evidence {
    font-size: 12.5px;
    color: #666;
    margin-top: 4px;
  }
  .assumption-evidence-label {
    font-weight: 600;
    color: #666;
    font-size: 11px;
    text-transform: uppercase;
  }
  .evidence-link {
    color: #007bff;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const ModalImpactGroupHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0 4px;
  cursor: pointer;
  user-select: none;

  &:first-child { padding-top: 0; }

  .group-label {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) => props.$color};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .group-count {
    font-size: 12px;
    color: #888;
  }
  .group-toggle {
    font-size: 10px;
    color: #95a5a6;
  }

  &:hover .group-label { opacity: 0.8; }
`;

const ModalAssumptionRow = styled.div`
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &:hover { filter: brightness(0.95); }
`;

const ModalAssumptionChevron = styled.span`
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
  margin-top: 3px;
  width: 12px;
`;

const ModalAssumptionExpanded = styled.div`
  padding: 2px 10px 8px 30px;
  font-size: 12.5px;
  color: #555;
  line-height: 1.5;
`;

const MODAL_IMPACT_ORDER = ["CRITICAL", "MAJOR", "MINOR"] as const;
const MODAL_IMPACT_COLORS: Record<string, string> = {
  CRITICAL: "#7b2d8e",
  MAJOR: "#d68910",
  MINOR: "#1a5276",
};

function EvidenceLink({ evidence }: { evidence: EvidencePointer }) {
  const arkId = evidence.artifact?.["@id"];
  if (!arkId) return <span>Unknown</span>;
  return (
    <>
      <a className="evidence-link" href={`/view/${arkId}`} target="_blank" rel="noopener noreferrer">
        {arkId}
      </a>
      {evidence.location && <span style={{ color: "#888", marginLeft: 6 }}>({evidence.location})</span>}
    </>
  );
}

function ModalAssumptionItem({ assumption }: { assumption: DisplayAssumption }) {
  const [expanded, setExpanded] = useState(false);
  const cssClass = getAssumptionCssClass(assumption.impact);
  const displayName = assumption.name || (assumption.description.length > 80
    ? assumption.description.slice(0, 80) + "..."
    : assumption.description);

  return (
    <div className={`assumption-item assumption-${cssClass}`}>
      <ModalAssumptionRow onClick={() => setExpanded(!expanded)}>
        <ModalAssumptionChevron>{expanded ? "\u25BC" : "\u25B6"}</ModalAssumptionChevron>
        <span style={{ fontWeight: 600, color: "#2c3e50", flex: 1 }}>{displayName}</span>
      </ModalAssumptionRow>
      {expanded && (
        <ModalAssumptionExpanded>
          {assumption.name && (
            <div style={{ marginBottom: 4 }}>{assumption.description}</div>
          )}
          {assumption.downstreamImpacts && (
            <AssumptionDetailBlock>
              <div className="assumption-downstream">
                <div className="assumption-downstream-label">If Wrong</div>
                {assumption.downstreamImpacts}
              </div>
            </AssumptionDetailBlock>
          )}
          {assumption.evidence && (
            <AssumptionDetailBlock>
              <div className="assumption-evidence">
                <span className="assumption-evidence-label">Evidence: </span>
                <EvidenceLink evidence={assumption.evidence} />
              </div>
            </AssumptionDetailBlock>
          )}
        </ModalAssumptionExpanded>
      )}
    </div>
  );
}

function ModalAssumptionsGrouped({ assumptions }: { assumptions: DisplayAssumption[] }) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(["CRITICAL"])
  );

  const groups = MODAL_IMPACT_ORDER.reduce((acc, impact) => {
    acc[impact] = assumptions.filter((a) => a.impact === impact);
    return acc;
  }, {} as Record<string, DisplayAssumption[]>);

  const toggleGroup = (impact: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(impact)) next.delete(impact);
      else next.add(impact);
      return next;
    });
  };

  return (
    <>
      {MODAL_IMPACT_ORDER.map((impact) => {
        const group = groups[impact];
        if (!group.length) return null;
        const isOpen = expandedGroups.has(impact);
        return (
          <React.Fragment key={impact}>
            <ModalImpactGroupHeader $color={MODAL_IMPACT_COLORS[impact]} onClick={() => toggleGroup(impact)}>
              <span className="group-toggle">{isOpen ? "\u25BC" : "\u25B6"}</span>
              <span className="group-label">{impact}</span>
              <span className="group-count">({group.length})</span>
            </ModalImpactGroupHeader>
            {isOpen && group.map((a, i) => (
              <ModalAssumptionItem key={i} assumption={a} />
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
}

function CollapsibleSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible-section">
      <h3 onClick={() => setOpen(!open)} style={{ cursor: "pointer", userSelect: "none" }}>
        <span style={{ fontSize: 10, color: "#95a5a6", marginRight: 6 }}>{open ? "\u25BC" : "\u25B6"}</span>
        {title}
      </h3>
      {open && children}
    </div>
  );
}

function AnnotationDetailModal({
  annotation,
  nodeName,
  nodeDescription,
  onClose,
}: {
  annotation: AnnotationData;
  nodeName: string;
  nodeDescription?: string;
  onClose: () => void;
}) {
  const stepAssumptions = getStepAssumptions(annotation);

  const allCodeAnalysis = annotation["evi:codeAnalysis"] || [];
  const allDatasets = [
    ...(annotation["evi:inputSummaries"] || []),
    ...(annotation["evi:outputSummaries"] || []),
  ];
  const hasDataQuality = allDatasets.some((ds) => ds.dataQuality);
  const inputSummaries = annotation["evi:inputSummaries"] || [];
  const outputSummaries = annotation["evi:outputSummaries"] || [];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Analysis: {nodeName}</h2>

        {/* Brief description from the computation itself */}
        {nodeDescription && (
          <p style={{ margin: "0 0 12px", color: "#555", fontSize: "14px", lineHeight: 1.5 }}>
            {nodeDescription}
          </p>
        )}

        {/* Compact two-column overview: Software, Inputs, Outputs */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: 13, margin: "8px 0 16px", alignItems: "baseline" }}>
          {allCodeAnalysis.length > 0 && (
            <>
              <span style={{ fontWeight: 600, color: "#666" }}>Software</span>
              <span>
                {allCodeAnalysis.map((ca, i) => {
                  const id = ca.software["@id"];
                  const label = ca.name || id;
                  return (
                    <span key={i}>
                      {i > 0 && ", "}
                      <a href={`/view/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", textDecoration: "none" }}>{label}</a>
                    </span>
                  );
                })}
              </span>
            </>
          )}
          {inputSummaries.length > 0 && (
            <>
              <span style={{ fontWeight: 600, color: "#666" }}>Inputs</span>
              <span>
                {inputSummaries.map((ds, i) => {
                  const id = ds.dataset["@id"];
                  const label = ds.name || id;
                  return (
                    <span key={i}>
                      {i > 0 && ", "}
                      <a href={`/view/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", textDecoration: "none" }}>{label}</a>
                    </span>
                  );
                })}
              </span>
            </>
          )}
          {outputSummaries.length > 0 && (
            <>
              <span style={{ fontWeight: 600, color: "#666" }}>Outputs</span>
              <span>
                {outputSummaries.map((ds, i) => {
                  const id = ds.dataset["@id"];
                  const label = ds.name || id;
                  return (
                    <span key={i}>
                      {i > 0 && ", "}
                      <a href={`/view/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", textDecoration: "none" }}>{label}</a>
                    </span>
                  );
                })}
              </span>
            </>
          )}
        </div>

        {/* --- Detail sections (collapsible) --- */}
        <div style={{ borderTop: "2px solid #e9ecef", paddingTop: 8 }}>

          {/* Code Analysis: summary, key functions, software assumptions */}
          {allCodeAnalysis.length > 0 && (
            <CollapsibleSection title="Code Analysis">
              {allCodeAnalysis.map((ca, i) => {
                const caAssumptions = getCodeAssumptions(ca);
                return (
                  <div key={i} className="code-analysis-card" style={{ marginBottom: 12 }}>
                    <div className="software-name">{ca.name || ca.software["@id"]}</div>
                    <ModalMarkdown className="summary">
                      <ReactMarkdown>{ca.summary}</ReactMarkdown>
                    </ModalMarkdown>
                    {ca.keyFunctions && ca.keyFunctions.length > 0 && (
                      <>
                        <h4 style={{ margin: "10px 0 4px", color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Key Functions</h4>
                        <ul className="key-functions">
                          {ca.keyFunctions.map((fn, j) => <li key={j}>{fn}</li>)}
                        </ul>
                      </>
                    )}
                    {caAssumptions.length > 0 && (
                      <>
                        <h4 style={{ margin: "10px 0 4px", color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Software Assumptions</h4>
                        <ModalAssumptionsGrouped assumptions={caAssumptions} />
                      </>
                    )}
                  </div>
                );
              })}
            </CollapsibleSection>
          )}

          {/* Data: quality notes + data assumptions */}
          {(hasDataQuality || stepAssumptions.length > 0) && (
            <CollapsibleSection title="Data">
              {hasDataQuality && (
                <>
                  <h4 style={{ margin: "0 0 6px", color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Data Quality</h4>
                  {allDatasets.filter((ds) => ds.dataQuality).map((ds, i) => (
                    <div key={i} style={{ marginBottom: 8, fontSize: 13 }}>
                      <strong>{ds.name || ds.dataset["@id"]}</strong>
                      <div style={{ marginTop: 2, color: "#6b7280" }}>{ds.dataQuality}</div>
                    </div>
                  ))}
                </>
              )}
              {stepAssumptions.length > 0 && (
                <>
                  <h4 style={{ margin: "12px 0 6px", color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Data Assumptions</h4>
                  <ModalAssumptionsGrouped assumptions={stepAssumptions} />
                </>
              )}
            </CollapsibleSection>
          )}

          {/* Step Summary */}
          {annotation["evi:stepSummary"] && (
            <CollapsibleSection title="Step Summary">
              <ModalMarkdown>
                <ReactMarkdown>{annotation["evi:stepSummary"]}</ReactMarkdown>
              </ModalMarkdown>
            </CollapsibleSection>
          )}

          {/* Provenance */}
          <CollapsibleSection title="Provenance">
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
          </CollapsibleSection>

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
  const [showChainModal, setShowChainModal] = useState(false);
  const dataService = useContext(GraphDataServiceContext);

  const renderTooltipContent = useCallback(() => {
    const sourceProps = getDisplayableProperties(data._sourceData as any);
    const allProps = { ...sourceProps, ...data.properties };
    delete allProps.name;
    delete allProps.label;
    delete allProps.description;
    delete allProps["@id"];
    delete allProps["@type"];
    delete allProps.count;

    const stepAssumptions = data._annotation ? getStepAssumptions(data._annotation) : [];

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
            {stepAssumptions.length > 0 && (
              <div>
                {(() => {
                  const critical = stepAssumptions.filter((a) => a.impact === "CRITICAL").length;
                  const major = stepAssumptions.filter((a) => a.impact === "MAJOR").length;
                  const minor = stepAssumptions.filter((a) => a.impact === "MINOR").length;
                  return (
                    <>
                      {critical > 0 && <span className="assumptions-badge assumptions-critical">{critical} Critical</span>}
                      {" "}
                      {major > 0 && <span className="assumptions-badge assumptions-major">{major} Major</span>}
                      {" "}
                      {minor > 0 && <span className="assumptions-badge assumptions-minor">{minor} Minor</span>}
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

        {data.type === "Dataset" && dataService && (
          <button
            className="view-detail-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowChainModal(true);
            }}
          >
            View Assumption Chain
          </button>
        )}

        {data.expandable && (
          <em style={{ display: "block", marginTop: 10, color: "#007bff", fontStyle: "italic", fontSize: "0.9em" }}>
            (Click node to expand)
          </em>
        )}
      </TooltipWrapper>
    );
  }, [data, hasAnnotation, dataService]);

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
          nodeDescription={data.description}
          onClose={() => setShowModal(false)}
        />,
        document.body
      )}

      {showChainModal && dataService && createPortal(
        <AssumptionChainModal
          datasetId={data.id}
          datasetName={data.label || data.displayName || id}
          dataService={dataService}
          onClose={() => setShowChainModal(false)}
        />,
        document.body
      )}
    </>
  );
};

export default React.memo(AnnotatedEvidenceNode);

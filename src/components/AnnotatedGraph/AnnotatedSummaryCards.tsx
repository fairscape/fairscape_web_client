import React, { useState } from "react";
import styled from "styled-components";
import { AnnotatedEvidenceGraphData } from "../../types/graph";

const SummarySection = styled.div`
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const SummaryHeader = styled.div<{ $expanded: boolean }>`
  padding: 12px 16px;
  background: #f7f9fc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;

  h3 {
    margin: 0;
    font-size: 15px;
    color: #2c3e50;
  }
  .toggle {
    color: #95a5a6;
    font-size: 12px;
  }

  &:hover {
    background: #eef2f7;
  }
`;

const SummaryBody = styled.div`
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const ConcernsList = styled.div`
  .concern-item {
    padding: 8px 12px;
    margin: 4px 0;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
  }
  .concern-critical {
    background: #fde8e8;
    border-left: 4px solid #c0392b;
  }
  .concern-warning {
    background: #fef9e7;
    border-left: 4px solid #d68910;
  }
  .concern-info {
    background: #eaf4fb;
    border-left: 4px solid #1a5276;
  }
  .concern-good {
    background: #eafaf1;
    border-left: 4px solid #1e8449;
  }
`;

const FindingsList = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
  li {
    margin: 6px 0;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;

  span {
    color: #333;
    font-weight: 500;
  }
`;

function getConcernLevel(concern: string): string {
  const lower = concern.toLowerCase();
  if (lower.startsWith("critical")) return "critical";
  if (lower.startsWith("warning")) return "warning";
  if (lower.startsWith("info")) return "info";
  if (lower.startsWith("good")) return "good";
  return "info";
}

function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <SummaryCard>
      <SummaryHeader
        $expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <h3>{title}</h3>
        <span className="toggle">{expanded ? "\u25BC" : "\u25B6"}</span>
      </SummaryHeader>
      {expanded && <SummaryBody>{children}</SummaryBody>}
    </SummaryCard>
  );
}

interface AnnotatedSummaryCardsProps {
  data: AnnotatedEvidenceGraphData;
  placement: "above" | "below";
}

const AnnotatedSummaryCards: React.FC<AnnotatedSummaryCardsProps> = ({
  data,
  placement,
}) => {
  if (placement === "above") {
    return (
      <SummarySection>
        {/* Meta info bar */}
        <MetaInfo>
          <div>
            <span>Name:</span> {data.name}
          </div>
          <div>
            <span>LLM:</span> {data["evi:llmModel"]}
          </div>
          <div>
            <span>Date:</span> {data.dateCreated}
          </div>
          <div>
            <span>Entities:</span> {Object.keys(data["@graph"]).length}
          </div>
          {data["evi:stepAnnotations"] && (
            <div>
              <span>Annotations:</span> {data["evi:stepAnnotations"].length}
            </div>
          )}
        </MetaInfo>

        {/* Executive Summary - always open */}
        <CollapsibleCard title="Executive Summary" defaultOpen={true}>
          <p>{data["evi:executiveSummary"]}</p>
        </CollapsibleCard>
      </SummarySection>
    );
  }

  // placement === "below"
  return (
    <SummarySection>
      <CollapsibleCard title="Narrative Summary">
        <p>{data["evi:narrativeSummary"]}</p>
      </CollapsibleCard>

      {data["evi:keyFindings"] && data["evi:keyFindings"].length > 0 && (
        <CollapsibleCard
          title={`Key Findings (${data["evi:keyFindings"].length})`}
        >
          <FindingsList>
            {data["evi:keyFindings"].map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </FindingsList>
        </CollapsibleCard>
      )}

      {data["evi:concerns"] && data["evi:concerns"].length > 0 && (
        <CollapsibleCard
          title={`Concerns (${data["evi:concerns"].length})`}
          defaultOpen={true}
        >
          <ConcernsList>
            {data["evi:concerns"].map((c, i) => (
              <div
                key={i}
                className={`concern-item concern-${getConcernLevel(c)}`}
              >
                {c}
              </div>
            ))}
          </ConcernsList>
        </CollapsibleCard>
      )}
    </SummarySection>
  );
};

export default AnnotatedSummaryCards;

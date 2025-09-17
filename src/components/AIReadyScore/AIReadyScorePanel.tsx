// components/AIReadyScore/AIReadyScorePanel.tsx
import React, { useMemo, useState } from "react";
import { CriteriaData } from "./hooks/useAIReadyScore";
import {
  Layout,
  Body,
  LeftNav,
  CriteriaItem,
  CriteriaTitle,
  CriteriaScoreMini,
  RightPane,
  PaneHeader,
  PaneTitleRow,
  PaneTitle,
  PaneScoreChip,
  PaneDescription,
  SectionTitle,
  SubCriteriaGrid,
  SubCriterionCard,
  SubCriterionHeader,
  SubCriterionName,
  StatusChip,
  InfoIcon,
  Tooltip,
  TooltipInner,
  OverallScoreBanner,
} from "./AIReadyScorePanel.styles";
import { AI_READY_DOCS, getSubDocsFor } from "./docs/aiReadyDocs";

interface Props {
  criteriaData: CriteriaData[];
  datasetTitle?: string;
}

function hexToRgba(hex: string, alpha = 0.12) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const AIReadyScorePanel: React.FC<Props> = ({ criteriaData }) => {
  const [activeId, setActiveId] = useState<string>(criteriaData[0]?.id ?? "");
  const active = useMemo(
    () => criteriaData.find((c) => c.id === activeId) ?? criteriaData[0],
    [criteriaData, activeId]
  );

  const totalScore = useMemo(
    () => criteriaData.reduce((sum, c) => sum + c.score, 0),
    [criteriaData]
  );
  const maxTotal = useMemo(
    () => criteriaData.reduce((sum, c) => sum + c.maxScore, 0),
    [criteriaData]
  );
  const pct = Math.round((totalScore / maxTotal) * 100);

  const docs = getSubDocsFor(active.id as keyof typeof AI_READY_DOCS);

  // UPDATED: drive "Met" directly from API has_content via metByKey map
  const isMet = (docKey: string, displayName: string) => {
    return active.metByKey[docKey] ?? active.metByKey[displayName] ?? false;
  };

  const evidenceFor = (docKey: string, displayName: string) =>
    active.metadata[docKey] ?? active.metadata[displayName] ?? "";

  const formatLinks = (value: string) =>
    value.replace(
      /(https?:\/\/[^\s)]+)|(ark:[^\s)]+)/g,
      (m) =>
        `<a href="${
          m.startsWith("http") ? m : `https://n2t.net/${m}`
        }" target="_blank" rel="noopener noreferrer">${m}</a>`
    );

  return (
    <Layout>
      <OverallScoreBanner title="Overall AI Readiness">
        {totalScore}/{maxTotal} • {pct}% AI Ready
      </OverallScoreBanner>

      <Body>
        <LeftNav>
          {criteriaData.map((c) => {
            const bg = hexToRgba(c.color, c.id === active.id ? 0.22 : 0.12);
            return (
              <CriteriaItem
                key={c.id}
                $active={c.id === active.id}
                $accent={c.color}
                $bg={bg}
                onClick={() => setActiveId(c.id)}
                title={`${c.title} (${c.score}/${c.maxScore})`}
              >
                <CriteriaTitle>{c.title}</CriteriaTitle>
                <CriteriaScoreMini>
                  {c.score}/{c.maxScore}
                </CriteriaScoreMini>
              </CriteriaItem>
            );
          })}
        </LeftNav>

        <RightPane $accent={active.color}>
          <PaneHeader>
            <PaneTitleRow>
              <PaneTitle style={{ color: active.color }}>
                {active.title}
              </PaneTitle>
              <PaneScoreChip
                style={{ borderColor: active.color, color: active.color }}
              >
                {active.score}/{active.maxScore}
              </PaneScoreChip>
            </PaneTitleRow>
            <PaneDescription>{active.description}</PaneDescription>
          </PaneHeader>

          <SectionTitle $accent={active.color}>Sub-criteria</SectionTitle>
          <SubCriteriaGrid>
            {docs.map((d) => {
              const met = isMet(d.key, d.name);
              const evidence = evidenceFor(d.key, d.name);
              return (
                <SubCriterionCard key={d.key} $accent={active.color}>
                  <SubCriterionHeader>
                    <SubCriterionName>{d.name}</SubCriterionName>
                    <StatusChip $met={met}>
                      {met ? "Met" : "Needs work"}
                    </StatusChip>
                    <InfoIcon tabIndex={0}>
                      ℹ︎
                      <Tooltip role="dialog">
                        <TooltipInner>
                          <strong>Definition:</strong>
                          <div style={{ marginBottom: 8 }}>{d.definition}</div>
                          <strong>How we check:</strong>
                          <div style={{ marginBottom: 8 }}>{d.logic}</div>
                          <strong>Status notes:</strong>
                          <div>{d.statusNotes}</div>
                        </TooltipInner>
                      </Tooltip>
                    </InfoIcon>
                  </SubCriterionHeader>

                  {evidence && (
                    <div style={{ marginTop: 8 }}>
                      <strong>Evidence:</strong>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatLinks(evidence),
                        }}
                      />
                    </div>
                  )}
                </SubCriterionCard>
              );
            })}
          </SubCriteriaGrid>
        </RightPane>
      </Body>
    </Layout>
  );
};

export default AIReadyScorePanel;

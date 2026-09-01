import React, { useMemo, useState } from "react";
import { CriteriaData } from "./hooks/useAIReadyScore";
import {
  Layout,
  Body,
  LeftNav,
  LeftNavList,
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
  ViewSwitch,
  View,
  SummaryHeader,
  SummaryTitle,
  SummaryGrid,
  SummaryCard,
  SummaryCardHead,
  SummaryCardTitle,
  SummaryScoreChip,
  MiniList,
  MiniItem,
  MiniIcon,
  BackLink,
  CriteriaStatus,
  CriteriaText,
} from "./AIReadyScorePanel.styles";
import { AI_READY_DOCS, getSubDocsFor } from "./docs/AIReadyDocs";

interface Props {
  criteriaData: CriteriaData[];
  datasetTitle?: string;
}

function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 99) return "#15803d";
  if (percentage >= 40) return "#ea580c";
  return "#dc2626";
}

function getScoreBackground(
  score: number,
  maxScore: number,
  isActive: boolean,
): string {
  const percentage = (score / maxScore) * 100;
  const opacity = isActive ? 0.22 : 0.12;

  if (percentage >= 99) {
    const [r, g, b] = [21, 128, 61];
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (percentage >= 40) {
    const [r, g, b] = [234, 88, 12];
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  const [r, g, b] = [220, 38, 38];
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const AIReadyScorePanel: React.FC<Props> = ({ criteriaData }) => {
  const [activeId, setActiveId] = useState<string>(criteriaData[0]?.id ?? "");
  const [mode, setMode] = useState<"summary" | "detail">("summary");

  const active = useMemo(
    () => criteriaData.find((c) => c.id === activeId) ?? criteriaData[0],
    [criteriaData, activeId],
  );

  const totalScore = useMemo(
    () => criteriaData.reduce((sum, c) => sum + c.score, 0),
    [criteriaData],
  );
  const maxTotal = useMemo(
    () => criteriaData.reduce((sum, c) => sum + c.maxScore, 0),
    [criteriaData],
  );
  const pct = Math.round((totalScore / maxTotal) * 100);

  const docsFor = (id: string) =>
    getSubDocsFor(id as keyof typeof AI_READY_DOCS);

  const isMet = (crit: CriteriaData, docKey: string, displayName: string) =>
    crit.metByKey[docKey] ?? crit.metByKey[displayName] ?? false;

  const evidenceFor = (
    crit: CriteriaData,
    docKey: string,
    displayName: string,
  ) => crit.metadata[docKey] ?? crit.metadata[displayName] ?? "";

  const formatLinks = (value: string) =>
    value.replace(
      /(https?:\/\/[^\s)]+)|(ark:[^\s)]+)/g,
      (m) =>
        `<a href="${
          m.startsWith("http") ? m : `https://n2t.net/${m}`
        }" target="_blank" rel="noopener noreferrer">${m}</a>`,
    );

  return (
    <Layout>
      <OverallScoreBanner title="Overall AI Readiness">
        {totalScore}/{maxTotal} • {pct}% AI Ready
      </OverallScoreBanner>

      <Body>
        <LeftNav>
          <LeftNavList>
            {criteriaData.map((c) => {
              const color = getScoreColor(c.score, c.maxScore);
              const bg = getScoreBackground(
                c.score,
                c.maxScore,
                c.id === active.id,
              );
              return (
                <CriteriaItem
                  key={c.id}
                  $active={c.id === active.id}
                  $accent={color}
                  $bg={bg}
                  $complete={c.hasMetCriteria}
                  onClick={() => {
                    setActiveId(c.id);
                    setMode("detail");
                  }}
                  title={`${c.title} (${c.score}/${c.maxScore})`}
                >
                  <CriteriaStatus $complete={c.hasMetCriteria}>
                    {c.hasMetCriteria ? "✓" : "✕"}
                  </CriteriaStatus>
                  <CriteriaText>
                    <CriteriaTitle>{c.title}</CriteriaTitle>
                    <CriteriaScoreMini>
                      {c.score}/{c.maxScore}
                    </CriteriaScoreMini>
                  </CriteriaText>
                </CriteriaItem>
              );
            })}
          </LeftNavList>
        </LeftNav>

        <RightPane $accent={getScoreColor(active.score, active.maxScore)}>
          <ViewSwitch>
            <View $visible={mode === "summary"}>
              <SummaryHeader>
                <SummaryTitle>AI Readiness Summary</SummaryTitle>
              </SummaryHeader>
              <SummaryGrid>
                {criteriaData.map((c) => {
                  const list = docsFor(c.id);
                  const color = getScoreColor(c.score, c.maxScore);
                  return (
                    <SummaryCard
                      key={c.id}
                      $accent={color}
                      $complete={c.hasMetCriteria}
                      onClick={() => {
                        setActiveId(c.id);
                        setMode("detail");
                      }}
                      title={`${c.title} (${c.score}/${c.maxScore})`}
                    >
                      <SummaryCardHead>
                        <SummaryCardTitle>{c.title}</SummaryCardTitle>
                        <SummaryScoreChip $accent={color}>
                          {c.score}/{c.maxScore}
                        </SummaryScoreChip>
                      </SummaryCardHead>
                      <MiniList>
                        {list.map((d) => {
                          const met = isMet(c, d.key, d.name);
                          return (
                            <MiniItem key={d.key} $met={met}>
                              <MiniIcon $met={met}>{met ? "✓" : "✕"}</MiniIcon>
                              <span>{d.name}</span>
                            </MiniItem>
                          );
                        })}
                      </MiniList>
                    </SummaryCard>
                  );
                })}
              </SummaryGrid>
            </View>

            <View $visible={mode === "detail"}>
              <PaneHeader>
                <PaneTitleRow>
                  <PaneTitle
                    style={{
                      color: getScoreColor(active.score, active.maxScore),
                    }}
                  >
                    {active.title}
                  </PaneTitle>
                  <PaneScoreChip
                    style={{
                      borderColor: getScoreColor(active.score, active.maxScore),
                      color: getScoreColor(active.score, active.maxScore),
                    }}
                  >
                    {active.score}/{active.maxScore}
                  </PaneScoreChip>
                  <BackLink onClick={() => setMode("summary")}>
                    Back to summary
                  </BackLink>
                </PaneTitleRow>
                <PaneDescription>{active.description}</PaneDescription>
              </PaneHeader>

              <SectionTitle
                $accent={getScoreColor(active.score, active.maxScore)}
              >
                Sub-criteria
              </SectionTitle>
              <SubCriteriaGrid>
                {docsFor(active.id).map((d) => {
                  const met = isMet(active, d.key, d.name);
                  const evidence = evidenceFor(active, d.key, d.name);
                  return (
                    <SubCriterionCard
                      key={d.key}
                      $accent={getScoreColor(active.score, active.maxScore)}
                    >
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
                              <div style={{ marginBottom: 8 }}>
                                {d.definition}
                              </div>
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
            </View>
          </ViewSwitch>
        </RightPane>
      </Body>
    </Layout>
  );
};

export default AIReadyScorePanel;

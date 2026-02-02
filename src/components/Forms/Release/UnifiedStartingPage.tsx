import React, { useState, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { useIssues } from "../../d4d-assistant/hooks/useIssues";
import {
  getAllSavedCrates,
  loadCrate,
  deleteSavedCrate,
} from "../utils/storageUtils";

interface UnifiedStartingPageProps {
  onMethodSelect: (
    method: "manual" | "upload-existing" | "direct" | "interactive"
  ) => void;
  onUploadExisting: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCrateUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSavedCrateSelect: (data: { formData: any; reviewState?: any }) => void;
  onIssueSelect: (issueNumber: number) => void;
}

interface SavedCrate {
  id: string;
  name: string;
  lastModified: string;
  reviewStatus: boolean;
  hasUnreviewed: boolean;
}

const UnifiedStartingPage: React.FC<UnifiedStartingPageProps> = ({
  onMethodSelect,
  onUploadExisting,
  onCrateUpload,
  onSavedCrateSelect,
  onIssueSelect,
}) => {
  const [savedCrates, setSavedCrates] = useState<SavedCrate[]>([]);
  const { issues, loading: issuesLoading } = useIssues();
  const uploadExistingInputRef = useRef<HTMLInputElement>(null);
  const reviewUploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedCrates(getAllSavedCrates());
  }, []);

  const refreshSavedCrates = () => {
    setSavedCrates(getAllSavedCrates());
  };

  const handleCrateClick = (crate: SavedCrate) => {
    const saved = loadCrate(crate.id);
    if (saved) {
      onSavedCrateSelect(saved);
    } else {
      alert("Saved crate not found or is corrupted.");
      refreshSavedCrates();
    }
  };

  const handleDeleteCrate = async (
    e: React.MouseEvent | React.KeyboardEvent,
    crate: SavedCrate
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const confirmDelete = window.confirm(
      `Delete saved crate "${crate.name}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    const ok = deleteSavedCrate(crate.id);
    if (!ok) {
      alert("Failed to delete crate. Please try again.");
      return;
    }
    refreshSavedCrates();
  };

  const handleUploadExistingClick = () =>
    uploadExistingInputRef.current?.click();
  const handleReviewUploadClick = () => reviewUploadInputRef.current?.click();

  const combinedItems = useMemo(() => {
    const items = [
      ...savedCrates.map((crate) => ({
        type: "crate" as const,
        id: crate.id,
        title: crate.name,
        date: crate.lastModified,
        status: crate.hasUnreviewed ? "Needs Review" : "Complete",
        data: crate,
      })),
      ...issues.map((issue) => ({
        type: "issue" as const,
        id: issue.number.toString(),
        title: issue.title,
        date: issue.updated_at,
        status: issue.state,
        data: issue,
      })),
    ];

    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [savedCrates, issues]);

  return (
    <Container>
      <TopGrid>
        <Section role="region" aria-labelledby="create-title">
          <SectionTitle id="create-title">Create New</SectionTitle>
          <SectionDescription>
            Start a new RO-Crate from scratch, existing file, or with AI
            assistance.
          </SectionDescription>
          <TwoByTwoGrid>
            <PrimaryButton onClick={() => onMethodSelect("manual")}>
              Manual Entry
            </PrimaryButton>
            <PrimaryButton onClick={handleUploadExistingClick}>
              Start from Prev. Version
            </PrimaryButton>
            <PrimaryButton onClick={() => onMethodSelect("direct")}>
              Direct LLM Assist
            </PrimaryButton>
            <PrimaryButton onClick={() => onMethodSelect("interactive")}>
              Interactive D4D Assistant
            </PrimaryButton>
          </TwoByTwoGrid>
          <HiddenFileInput
            ref={uploadExistingInputRef}
            type="file"
            accept=".json,application/json"
            onChange={onUploadExisting}
            aria-hidden
            tabIndex={-1}
          />
        </Section>

        <Section role="region" aria-labelledby="review-title">
          <SectionTitle id="review-title">Review / Upload</SectionTitle>
          <SectionDescription>
            Upload a <code>ro-crate-metadata.json</code> for review and
            approval.
          </SectionDescription>
          <ButtonGroup>
            <SecondaryButton onClick={handleReviewUploadClick}>
              Upload RO-Crate
            </SecondaryButton>
            <HiddenFileInput
              ref={reviewUploadInputRef}
              type="file"
              accept=".json,application/json"
              onChange={onCrateUpload}
              aria-hidden
              tabIndex={-1}
            />
          </ButtonGroup>
          {savedCrates.length > 0 && (
            <SmallNote>
              You have {savedCrates.length} saved{" "}
              {savedCrates.length === 1 ? "crate" : "crates"}.
            </SmallNote>
          )}
        </Section>
      </TopGrid>

      <Section role="region" aria-labelledby="continue-title">
        <SectionHeaderRow>
          <SectionTitle id="continue-title">Continue Working</SectionTitle>
          <SectionMeta>
            {issuesLoading
              ? "Loading issues…"
              : `${combinedItems.length} items`}
          </SectionMeta>
        </SectionHeaderRow>
        <SectionDescription>
          Resume work on saved crates or open issues.
        </SectionDescription>

        {combinedItems.length === 0 && !issuesLoading ? (
          <EmptyState>
            <Emoji aria-hidden>🗂️</Emoji>
            <EmptyTitle>No recent items</EmptyTitle>
            <EmptySubtitle>
              Create a new RO-Crate or upload one to get started.
            </EmptySubtitle>
          </EmptyState>
        ) : (
          <CardGrid>
            {(issuesLoading ? Array.from({ length: 6 }) : combinedItems).map(
              (item: any, idx: number) =>
                issuesLoading ? (
                  <Card key={`skeleton-${idx}`} aria-busy>
                    <SkeletonLine style={{ width: "35%" }} />
                    <SkeletonLine style={{ width: "90%", marginTop: 12 }} />
                    <CardInfo>
                      <SkeletonPill />
                      <SkeletonPill style={{ width: 90 }} />
                    </CardInfo>
                  </Card>
                ) : (
                  <Card
                    key={`${item.type}-${item.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (item.type === "crate") {
                        handleCrateClick(item.data as SavedCrate);
                      } else {
                        onIssueSelect(item.data.number);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (item.type === "crate") {
                          handleCrateClick(item.data as SavedCrate);
                        } else {
                          onIssueSelect(item.data.number);
                        }
                      }
                    }}
                    aria-label={
                      item.type === "crate"
                        ? `Open saved crate ${item.title}`
                        : `Open issue ${item.title}`
                    }
                  >
                    <CardHeader>
                      <CardType aria-hidden>
                        {item.type === "crate" ? "📦" : "🔧"}
                      </CardType>
                      <CardTitle title={item.title}>{item.title}</CardTitle>

                      {item.type === "crate" && (
                        <DeleteButton
                          type="button"
                          title="Delete"
                          aria-label={`Delete saved crate ${item.title}`}
                          onClick={(e) =>
                            handleDeleteCrate(e, item.data as SavedCrate)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleDeleteCrate(e, item.data as SavedCrate);
                            }
                          }}
                        >
                          <span aria-hidden>✕</span>
                        </DeleteButton>
                      )}
                    </CardHeader>

                    <CardInfo>
                      <CardDate>
                        {new Date(item.date).toLocaleDateString()}
                      </CardDate>
                      <CardStatus
                        data-type={item.type}
                        data-status={item.status}
                        status={String(item.status)}
                      >
                        {normalizeStatus(item.status)}
                      </CardStatus>
                    </CardInfo>
                  </Card>
                )
            )}
          </CardGrid>
        )}
      </Section>
    </Container>
  );
};

function normalizeStatus(status: string) {
  const s = (status || "").toLowerCase();
  if (["closed", "complete", "completed", "done"].includes(s))
    return "Complete";
  if (["open"].includes(s)) return "Open";
  if (["needs review", "review", "in review"].includes(s))
    return "Needs Review";
  return status || "—";
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 12px 40px;
`;

const TopGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Section = styled.section`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ececec;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.06);
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const SectionMeta = styled.span`
  color: #667085;
  font-size: 0.9rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.35rem;
  color: #2f5878;
  margin: 0 0 8px 0;
`;

const SectionDescription = styled.p`
  color: #667085;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
`;

const SmallNote = styled.p`
  color: #7f8c99;
  font-size: 0.85rem;
  margin: 14px 0 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const TwoByTwoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const BaseButton = styled.button`
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 0.975rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  border: 0;
  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButton = styled(BaseButton)`
  background-color: #3e7aa8;
  color: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  &:hover {
    background-color: #2f5f82;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(62, 122, 168, 0.22);
  }
`;

const SecondaryButton = styled(BaseButton)`
  background-color: #fff;
  color: #3e7aa8;
  border: 2px solid #3e7aa8;
  &:hover {
    background-color: #f4f8fb;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(62, 122, 168, 0.12);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const CardGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin-top: 12px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e7e7e9;
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease,
    border-color 0.12s ease;
  outline: none;

  &:hover,
  &:focus {
    transform: translateY(-3px);
    box-shadow: 0 12px 22px rgba(16, 24, 40, 0.12);
    border-color: #3e7aa8;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
`;

const CardType = styled.span`
  font-size: 1.35rem;
  line-height: 1;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  color: #1f2937;
  margin: 0;
  flex: 1;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DeleteButton = styled.button`
  margin-left: auto;
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  line-height: 1;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;

  &:hover,
  &:focus {
    background: #fff1f2;
    color: #b91c1c;
    border-color: #fecaca;
  }
`;

const CardInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
`;

const CardDate = styled.span`
  font-size: 0.85rem;
  color: #667085;
`;

const CardStatus = styled.span<{ status: string }>`
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 600;
  background-color: ${(p) =>
    /complete|closed/i.test(p.status)
      ? "#e8f5ee"
      : /open/i.test(p.status)
      ? "#eef2ff"
      : "#fff6e6"};
  color: ${(p) =>
    /complete|closed/i.test(p.status)
      ? "#0a7a42"
      : /open/i.test(p.status)
      ? "#3949ab"
      : "#b45309"};
  border: 1px solid
    ${(p) =>
      /complete|closed/i.test(p.status)
        ? "#bfe6d1"
        : /open/i.test(p.status)
        ? "#c7d2fe"
        : "#fde7c3"};
`;

const SkeletonLine = styled.div`
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f2f4f7 25%, #eceff3 37%, #f2f4f7 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`;

const SkeletonPill = styled(SkeletonLine)`
  width: 70px;
  height: 22px;
  border-radius: 999px;
`;

const EmptyState = styled.div`
  border: 1px dashed #d5d9df;
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  background: #fafbfc;
  margin-top: 8px;
`;

const Emoji = styled.div`
  font-size: 1.6rem;
  margin-bottom: 6px;
`;

const EmptyTitle = styled.div`
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`;

const EmptySubtitle = styled.div`
  color: #667085;
  font-size: 0.95rem;
`;

export default UnifiedStartingPage;

import React, { useState } from "react";
import styled from "styled-components";
import {
  FiTable,
  FiCode,
  FiShare2,
  FiEdit2,
  FiDownload,
  FiChevronDown,
  FiRefreshCw,
  FiPlusCircle,
  FiCpu,
  FiDatabase,
} from "react-icons/fi";
import { RiPercentLine } from "react-icons/ri";
import { useMetadataApi } from "../api/metadataApi";
import { MdOutlineQueryStats } from "react-icons/md";

type ViewType =
  | "metadata"
  | "serialization"
  | "graph"
  | "score"
  | "statistics"
  | "interpretation"
  | "schema";

interface MetadataNavigationSidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  arkId: string;
  bundleKind: string;
  isOwner: boolean;
  downloadZip: () => void;
  downloadJSON: () => void;
  downloadCroissant: () => void;
  downloadHTML: () => void;
  hasDistribution: boolean;
  hasContentUrl: boolean;
  isLoggedIn: boolean;
  onInterpret: () => void;
}

export default function MetadataNavigationSidebar({
  activeView,
  onViewChange,
  arkId,
  bundleKind,
  isOwner,
  downloadZip,
  downloadJSON,
  downloadCroissant,
  downloadHTML,
  hasDistribution,
  hasContentUrl,
  isLoggedIn,
  onInterpret,
}: MetadataNavigationSidebarProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const metadataApi = useMetadataApi();

  const showScoreView = bundleKind === "release" || bundleKind === "rocrate";
  const showReScoreView =
    (bundleKind === "release" || bundleKind === "rocrate") &&
    activeView == "score";
  const showAdvancedDownloads =
    bundleKind === "release" || bundleKind === "rocrate";
  const showCreateButton =
    (bundleKind === "release" || bundleKind === "rocrate") && isOwner;

  const showDataDownload =
    (bundleKind === "rocrate" && hasDistribution) ||
    (bundleKind !== "rocrate" && bundleKind !== "release" && hasContentUrl);

  const handleEdit = () => {
    window.location.href = `/edit/${arkId}`;
  };

  const handleRescore = async () => {
    try {
      await metadataApi.rescoreAIReady(arkId);
      alert("Rescore initiated successfully");
    } catch (error) {
      console.error("Rescore failed:", error);
      alert("Failed to initiate rescore");
    }
  };

  const isRoCrateLike = bundleKind === "release" || bundleKind === "rocrate";
  const capitalize = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const kindLabel = isRoCrateLike ? "RO-Crate" : capitalize(bundleKind);

  return (
    <SidebarContainer>
      <SidebarContent>
        <Section>
          <SectionTitle>Views</SectionTitle>

          <ViewButton
            active={activeView === "metadata"}
            onClick={() => onViewChange("metadata")}
          >
            <FiTable />
            <span>Metadata</span>
          </ViewButton>

          <ViewButton
            active={activeView === "serialization"}
            onClick={() => onViewChange("serialization")}
          >
            <FiCode />
            <span>Serialization</span>
          </ViewButton>

          <ViewButton
            active={activeView === "graph"}
            onClick={() => onViewChange("graph")}
          >
            <FiShare2 />
            <span>Evidence Graph</span>
          </ViewButton>

          {bundleKind === "dataset" && (
            <ViewButton
              active={activeView === "statistics"}
              onClick={() => onViewChange("statistics")}
            >
              <MdOutlineQueryStats />
              <span>Descriptive Statistics</span>
            </ViewButton>
          )}

          {showScoreView && (
            <ViewButton
              active={activeView === "score"}
              onClick={() => onViewChange("score")}
            >
              <RiPercentLine />
              <span>AI-Ready Score</span>
            </ViewButton>
          )}

          {(bundleKind === "rocrate" ||
            bundleKind === "release" ||
            bundleKind === "dataset" ||
            bundleKind === "schema") && (
            <ViewButton
              active={activeView === "schema"}
              onClick={() => onViewChange("schema")}
            >
              <FiDatabase />
              <span>Schema Explorer</span>
            </ViewButton>
          )}
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Actions</SectionTitle>

          <ActionButton disabled={!isOwner} onClick={handleEdit}>
            <FiEdit2 />
            <span>Edit</span>
          </ActionButton>

          {showCreateButton && (
            <DownloadSection>
              <DownloadButton onClick={() => setCreateOpen(!createOpen)}>
                <ButtonContent>
                  <FiPlusCircle />
                  <span>Create Entity</span>
                </ButtonContent>
                <ChevronIcon open={createOpen}>
                  <FiChevronDown />
                </ChevronIcon>
              </DownloadButton>

              {createOpen && (
                <DropdownMenu>
                  <DropdownItem
                    onClick={() =>
                      (window.location.href = `/create/dataset?parent=${arkId}`)
                    }
                  >
                    Dataset
                  </DropdownItem>
                  <DropdownItem
                    onClick={() =>
                      (window.location.href = `/create/software?parent=${arkId}`)
                    }
                  >
                    Software
                  </DropdownItem>
                  <DropdownItem
                    onClick={() =>
                      (window.location.href = `/create/computation?parent=${arkId}`)
                    }
                  >
                    Computation
                  </DropdownItem>
                  <DropdownItem
                    onClick={() =>
                      (window.location.href = `/create/schema?parent=${arkId}`)
                    }
                  >
                    Schema
                  </DropdownItem>
                </DropdownMenu>
              )}
            </DownloadSection>
          )}

          <DownloadSection>
            <DownloadButton onClick={() => setDownloadOpen(!downloadOpen)}>
              <ButtonContent>
                <FiDownload />
                <span>Download</span>
              </ButtonContent>
              <ChevronIcon open={downloadOpen}>
                <FiChevronDown />
              </ChevronIcon>
            </DownloadButton>

            {downloadOpen && (
              <DropdownMenu>
                <DropdownItem onClick={downloadJSON}>
                  {kindLabel} JSON
                </DropdownItem>
                {showAdvancedDownloads && (
                  <>
                    <DropdownItem onClick={downloadCroissant}>
                      Croissant JSON
                    </DropdownItem>
                    <DropdownItem onClick={downloadHTML}>
                      Datasheet HTML
                    </DropdownItem>
                  </>
                )}
                {showDataDownload && (
                  <DropdownItem onClick={downloadZip}>
                    {isRoCrateLike
                      ? "RO-Crate Zip"
                      : `${capitalize(bundleKind)} Data`}
                  </DropdownItem>
                )}
              </DropdownMenu>
            )}
          </DownloadSection>

          {showReScoreView && (
            <ActionButton onClick={handleRescore}>
              <FiRefreshCw />
              <span>Rescore</span>
            </ActionButton>
          )}

          {bundleKind === "rocrate" && isLoggedIn && (
            <ActionButton onClick={onInterpret}>
              <FiCpu />
              <span>Interpret</span>
            </ActionButton>
          )}

          {!isOwner && <OwnerNote>Edit requires owner permissions</OwnerNote>}
        </Section>
      </SidebarContent>
    </SidebarContainer>
  );
}

const SidebarContainer = styled.div`
  position: sticky;
  top: 20px;
  width: 250px;
  height: fit-content;

  /* Stacked layout: move above the content so the view switcher stays reachable */
  @media (max-width: 1024px) {
    position: static;
    width: 100%;
    order: -1;
  }
`;

const SidebarContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Section = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  /* Stacked layout: sections become wrapping rows of compact buttons */
  @media (max-width: 1024px) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.ink3};
  font-weight: 500;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 1024px) {
    flex-basis: 100%;
    margin-bottom: 2px;
  }
`;

const ViewButton = styled.button<{ active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 600 : 450)};
  transition: background 0.15s ease;
  background: ${({ active, theme }) => (active ? theme.colors.primaryTint : "transparent")};
  color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.textSecondary)};
  box-shadow: ${({ active, theme }) => (active ? `inset 2px 0 0 ${theme.colors.primary}` : "none")};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryTint};
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    font-size: 16px;
    flex-shrink: 0;
  }

  span {
    font-size: 13.5px;
  }

  /* Stacked layout: vertical list items become pills */
  @media (max-width: 1024px) {
    width: auto;
    padding: 8px 12px;
    gap: 8px;
    border: 1px solid
      ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.borderStrong)};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    box-shadow: none;
    background: ${({ active, theme }) => (active ? theme.colors.primaryTint : theme.colors.surface)};
  }
`;

const ActionButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  font-weight: 550;
  transition: background 0.15s ease;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryTint};
  }

  &:disabled {
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.ink3};
  }

  svg {
    font-size: 16px;
    flex-shrink: 0;
  }

  span {
    font-size: 13.5px;
  }

  @media (max-width: 1024px) {
    width: auto;
    margin: 0;
  }
`;

const DownloadSection = styled.div`
  position: relative;
  margin-top: 8px;
  margin-bottom: 8px;

  @media (max-width: 1024px) {
    margin: 0;
  }
`;

const DownloadButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  font-weight: 550;
  transition: background 0.15s ease;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryTint};
  }

  @media (max-width: 1024px) {
    width: auto;
    gap: 8px;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    font-size: 14px;
  }
`;

const ChevronIcon = styled.div<{ open: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};

  svg {
    font-size: 16px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  z-index: 1000;
  overflow: hidden;

  /* Stacked layout: the trigger button is compact, so size to the items */
  @media (max-width: 1024px) {
    right: auto;
    min-width: 200px;
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 0;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 500;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryTint};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const OwnerNote = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid
    ${({ $variant }) => ($variant === "generic" ? "#f1aeb5" : "#ffe08a")};
  background: ${({ $variant }) => ($variant === "generic" ? "#fdf0f1" : "#fff8e6")};
  color: ${({ $variant }) => ($variant === "generic" ? "#842029" : "#7a5a00")};

  @media (max-width: 1024px) {
    flex-basis: 100%;
    margin-top: 0;
  }
`;

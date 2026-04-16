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

type ViewType = "metadata" | "serialization" | "graph" | "score" | "statistics" | "interpretation" | "schema";

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

          {(bundleKind === "rocrate" || bundleKind === "release" || bundleKind === "dataset" || bundleKind === "schema") && (
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
`;

const SidebarContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
`;

const Section = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  color: #005f73;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #dee2e6;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ViewButton = styled.button<{ active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  background: ${({ active }) => (active ? "#005f73" : "transparent")};
  color: ${({ active }) => (active ? "white" : "#212529")};

  &:hover {
    background: ${({ active }) => (active ? "#005f73" : "#f8f9fa")};
    transform: translateX(2px);
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    font-size: 14px;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  border: 1px solid #005f73;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: white;
  color: #005f73;

  &:hover:not(:disabled) {
    background: #005f73;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    background: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    font-size: 14px;
  }
`;

const DownloadSection = styled.div`
  position: relative;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const DownloadButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #005f73;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: white;
  color: #005f73;

  &:hover {
    background: #005f73;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  color: #212529;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s;

  &:hover {
    background: #f8f9fa;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #dee2e6;
  }
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid #dee2e6;
`;

const OwnerNote = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  font-size: 12px;
  color: #856404;
  text-align: center;
`;

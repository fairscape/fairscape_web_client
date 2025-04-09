// src/components/MetadataDisplay/SubcrateCard.tsx
import React from "react";
import styled from "styled-components";
import { SubcrateSummary } from "../../utils/metadataProcessing";
import LoadingSpinner from "../common/LoadingSpinner";
import MetadataField from "./MetadataField";

interface SubcrateCardProps {
  subcrate: SubcrateSummary;
  isLoading: boolean;
  error: string | null;
}

const SubcrateSummaryStyle = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  position: relative;
`;

const SubcrateError = styled.div`
  background-color: #fff0f0;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 1px solid #ffcccb;
`;

const SubcrateTitle = styled.h3`
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const SubcrateMetadata = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MetadataItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetadataLabel = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const MetadataValue = styled.span``;

const CompactList = styled.ul`
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 4px;
  }
`;

const ViewFullLink = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  text-align: right;
`;

const ViewFullLinkAnchor = styled.a`
  display: inline-block;
  padding: 8px 15px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius};
  z-index: 1;
`;

const SubcrateCard: React.FC<SubcrateCardProps> = ({
  subcrate,
  isLoading,
  error,
}) => {
  if (error) {
    return (
      <SubcrateError>
        <SubcrateTitle>
          {subcrate.name || subcrate.id || "Error Loading Sub-Crate"}
        </SubcrateTitle>
        <p>Failed to load details:</p>
        <p>{error}</p>
        {subcrate.metadataPath && (
          <p>Attempted path: {subcrate.metadataPath}</p>
        )}
      </SubcrateError>
    );
  }

  return (
    <SubcrateSummaryStyle>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      <SubcrateTitle>{subcrate.name || "Unnamed Dataset"}</SubcrateTitle>
      <SubcrateMetadata>
        <MetadataItem>
          <MetadataLabel>ROCrate ID:</MetadataLabel>
          <MetadataValue>
            <a href={`https://fairscape.net/${subcrate.id}`}>{subcrate.id}</a>
          </MetadataValue>
        </MetadataItem>

        {subcrate.description && (
          <MetadataItem>
            <MetadataLabel>Description:</MetadataLabel>
            <MetadataValue>{subcrate.description}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.authors && (
          <MetadataItem>
            <MetadataLabel>Authors:</MetadataLabel>
            <MetadataValue>{subcrate.authors}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.date && (
          <MetadataItem>
            <MetadataLabel>Date:</MetadataLabel>
            <MetadataValue>{subcrate.date || "Not specified"}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.size && (
          <MetadataItem>
            <MetadataLabel>Size:</MetadataLabel>
            <MetadataValue>{subcrate.size}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.doi && (
          <MetadataItem>
            <MetadataLabel>DOI:</MetadataLabel>
            <MetadataValue>{subcrate.doi || "None"}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.contact && (
          <MetadataItem>
            <MetadataLabel>Contact:</MetadataLabel>
            <MetadataValue>{subcrate.contact || "Not specified"}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.license && (
          <MetadataItem>
            <MetadataLabel>License:</MetadataLabel>
            <MetadataValue>{subcrate.license}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.keywords && subcrate.keywords.length > 0 && (
          <MetadataItem>
            <MetadataLabel>Keywords:</MetadataLabel>
            <MetadataValue>
              {typeof subcrate.keywords === "string"
                ? subcrate.keywords
                : subcrate.keywords.join(", ")}
            </MetadataValue>
          </MetadataItem>
        )}

        {subcrate.funder && (
          <MetadataItem>
            <MetadataLabel>Funding:</MetadataLabel>
            <MetadataValue>{subcrate.funder}</MetadataValue>
          </MetadataItem>
        )}

        {subcrate.related_publications &&
          subcrate.related_publications.length > 0 && (
            <MetadataItem>
              <MetadataLabel>Related Publications:</MetadataLabel>
              <MetadataValue>
                <CompactList>
                  {subcrate.related_publications.map((pub, idx) => (
                    <li key={idx}>{pub}</li>
                  ))}
                </CompactList>
              </MetadataValue>
            </MetadataItem>
          )}
      </SubcrateMetadata>

      {subcrate.previewUrl && (
        <ViewFullLink>
          <ViewFullLinkAnchor
            href={subcrate.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Full Dataset Details
          </ViewFullLinkAnchor>
        </ViewFullLink>
      )}
    </SubcrateSummaryStyle>
  );
};

export default SubcrateCard;

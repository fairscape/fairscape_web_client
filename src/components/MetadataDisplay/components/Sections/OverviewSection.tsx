import React from "react";
import styled from "styled-components";
import { OverviewData } from "../../utils/metadataProcessing"; // Adjust path as needed

const SectionContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background || "#f9f9f9"};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows?.small || "none"};
  border: ${({ theme }) =>
    theme.shadows?.small
      ? "none"
      : `1px solid ${theme.colors.border || "#ddd"}`};
`;

const Header = styled.h2`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DetailsList = styled.div`
  // Changed from DetailsGrid to DetailsList
  display: flex; // Use flex for a single column layout
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm}; // Spacing between items
`;

const DetailItemWrapper = styled.div`
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;

  strong {
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || theme.colors.text};
    margin-right: ${({ theme }) =>
      theme.spacing.xs}; /* Adjusted margin for label */
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const KeywordsContainer = styled.div`
  margin-top: ${({ theme }) =>
    theme.spacing.md}; /* More space before keywords */

  strong {
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || theme.colors.text};
    display: block;
    margin-bottom: ${({ theme }) =>
      theme.spacing.sm}; /* More space for keyword label */
  }
`;

const KeywordPill = styled.span`
  display: inline-block;
  background-color: ${({ theme }) =>
    theme.colors.secondary || theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 13px;
  font-weight: 500;
  margin-right: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

interface OverviewSectionProps {
  overviewData: OverviewData;
}

const DetailDisplay: React.FC<{
  label: string;
  value: any;
  isLink?: boolean;
  href?: string;
  isEmail?: boolean;
  isArk?: boolean;
}> = ({ label, value, isLink, href, isEmail, isArk }) => {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" &&
      value.trim() === "" &&
      typeof value !== "boolean")
  ) {
    return null;
  }

  let displayValue: React.ReactNode = String(value);

  if (isArk && typeof value === "string") {
    const arkLink = value.startsWith("ark:")
      ? `https://n2t.net/${value}`
      : value.startsWith("http")
      ? value
      : null;
    if (arkLink) {
      displayValue = (
        <a href={arkLink} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    }
  } else if (isLink) {
    const targetHref =
      href ||
      (typeof value === "string" &&
      (value.startsWith("http") || value.startsWith("https"))
        ? value
        : undefined);
    if (targetHref) {
      displayValue = (
        <a href={targetHref} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    }
  } else if (isEmail && typeof value === "string") {
    displayValue = <a href={`mailto:${value}`}>{value}</a>;
  } else if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (Array.isArray(value)) {
    displayValue = (
      <div style={{ marginTop: "4px" }}>
        {value.map((item, index) => (
          <div key={index} style={{ marginLeft: "10px", marginBottom: "2px" }}>
            {typeof item === "string" &&
            (item.startsWith("http") ||
              item.startsWith("https://") ||
              item.startsWith("doi:")) ? (
              <a
                href={
                  item.startsWith("doi:")
                    ? `https://doi.org/${item.substring(4)}`
                    : item
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {item}
              </a>
            ) : (
              String(item)
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DetailItemWrapper>
      <strong>{label}:</strong> {displayValue}
    </DetailItemWrapper>
  );
};

const OverviewSection: React.FC<OverviewSectionProps> = ({ overviewData }) => {
  if (!overviewData || Object.keys(overviewData).length === 0) {
    return <p>No overview data available.</p>;
  }

  const {
    id_value,
    doi,
    externalUrl,
    release_date,
    content_size,
    description,
    authors,
    publisher,
    principal_investigator,
    contact_email,
    license_value,
    confidentiality_level,
    keywords,
    citation,
    human_subject,
    funding,
    completeness,
    related_publications,
    copyright, // Destructure copyright
  } = overviewData;

  const keywordsArray = Array.isArray(keywords)
    ? keywords
    : typeof keywords === "string"
    ? keywords
        .split(/[,;]\s*/)
        .map((k) => k.trim())
        .filter((k) => k)
    : [];

  return (
    <SectionContainer data-testid="overview-section">
      <Header>Overview</Header>
      {description && <Description>{description}</Description>}

      <DetailsList>
        <DetailDisplay label="ARK Identifier" value={id_value} isArk={true} />
        <DetailDisplay
          label="DOI"
          value={doi}
          isLink={true}
          href={doi ? `https://doi.org/${doi.replace(/^doi:/, "")}` : undefined}
        />
        <DetailDisplay label="External URL" value={externalUrl} isLink={true} />
        <DetailDisplay
          label="Release Date"
          value={
            release_date
              ? new Date(release_date).toLocaleDateString()
              : undefined
          }
        />
        <DetailDisplay label="Author(s)" value={authors} />
        <DetailDisplay label="Publisher" value={publisher} />
        <DetailDisplay
          label="Principal Investigator"
          value={principal_investigator}
        />
        <DetailDisplay
          label="Contact Email"
          value={contact_email}
          isEmail={true}
        />
        <DetailDisplay label="License" value={license_value} isLink={true} />
        <DetailDisplay label="Copyright" value={copyright} />{" "}
        {/* Added Copyright display */}
        <DetailDisplay label="Content Size" value={content_size} />
        <DetailDisplay
          label="Confidentiality Level"
          value={confidentiality_level}
        />
        <DetailDisplay label="Citation" value={citation} />
        <DetailDisplay label="Human Subject Data" value={human_subject} />
        <DetailDisplay label="Funding" value={funding} />
        <DetailDisplay label="Completeness" value={completeness} />
        <DetailDisplay
          label="Related Publications"
          value={related_publications}
        />
      </DetailsList>

      {keywordsArray.length > 0 && (
        <KeywordsContainer>
          <strong>Keywords:</strong>
          <div>
            {keywordsArray.map((keyword, index) => (
              <KeywordPill key={index}>{keyword}</KeywordPill>
            ))}
          </div>
        </KeywordsContainer>
      )}
    </SectionContainer>
  );
};

export default OverviewSection;

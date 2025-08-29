import React from "react";
import styled from "styled-components";
import { SubcrateSummary } from "../../utils/metadataProcessing";
import LoadingSpinner from "../../../common/LoadingSpinner";
import Alert from "../../../common/Alert";

const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background || "#f9f9f9"};
  border: 1px solid ${({ theme }) => theme.colors.border || "#ddd"};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) =>
    theme.shadows?.small || "0 1px 3px rgba(0,0,0,0.05)"};
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight || "#eee"};
`;

const SubcrateName = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  word-break: break-all;
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DetailItemWrapper = styled.div`
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;

  strong {
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || theme.colors.text};
    margin-right: ${({ theme }) => theme.spacing.xxs};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const KeywordsContainerStyled = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const KeywordPillSubdued = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.lightGrey || "#e9ecef"};
  color: ${({ theme }) =>
    theme.colors.textSlightlyLighter || theme.colors.text};
  padding: 3px 7px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 12px;
  font-weight: 400;
  margin-right: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#ced4da"};
`;

const SubcrateLinkButton = styled.a`
  display: inline-block;
  align-self: flex-end;
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white !important;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: bold;
  text-align: center;
  font-size: 14px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: none;
  }
`;

interface SubcrateCardProps {
  subcrate: SubcrateSummary;
  isLoading: boolean;
  error: string | null;
}

const DetailDisplay: React.FC<{
  label: string;
  value: any;
  isLink?: boolean;
  href?: string;
  isEmail?: boolean;
  isArk?: boolean;
}> = ({ label, value, isLink, href, isEmail, isArk }) => {
  const feUrl = window.location.origin + "/view/";

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
      ? `${feUrl}${value}`
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
      <div style={{ marginTop: "2px" }}>
        {value.map((item, index) => (
          <div
            key={index}
            style={{ marginLeft: "8px", marginBottom: "1px", fontSize: "13px" }}
          >
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

const SubcrateCard: React.FC<SubcrateCardProps> = ({
  subcrate,
  isLoading,
  error,
}) => {
  const feUrl = window.location.origin + "/view/";

  if (isLoading) {
    return (
      <CardContainer>
        <LoadingSpinner />
      </CardContainer>
    );
  }
  if (error || !subcrate) {
    return (
      <CardContainer>
        <Alert
          type="error"
          message={error || "Sub-crate data could not be loaded."}
        />
      </CardContainer>
    );
  }

  const {
    name,
    description,
    authors,
    date,
    size,
    doi,
    contact,
    license,
    keywords,
    funder,
    related_publications,
    previewUrl,
    id,
  } = subcrate;

  const keywordsArray = Array.isArray(keywords)
    ? keywords
    : typeof keywords === "string"
    ? keywords
        .split(/[,;]\s*/)
        .map((k) => k.trim())
        .filter((k) => k)
    : [];

  let linkForButton: string | undefined = undefined;
  let buttonText: string = "View Details";

  if (id?.startsWith("ark:")) {
    linkForButton = `${feUrl}${id}`;
    buttonText = "View on FAIRSCAPE";
  } else if (previewUrl) {
    linkForButton = previewUrl;
    buttonText = "View Details";
  } else if (id?.startsWith("http")) {
    linkForButton = id;
    buttonText = "Open Link";
  }

  return (
    <CardContainer>
      <CardContent>
        <CardHeader>
          <SubcrateName>{name || id}</SubcrateName>
        </CardHeader>
        {description && (
          <p
            style={{
              fontSize: "14px",
              margin: `0 0 ${({ theme }) => theme.spacing.sm} 0`,
              color: ({ theme }) => theme.colors.textSlightlyLighter,
            }}
          >
            {description}
          </p>
        )}
        <DetailsList>
          <DetailDisplay label="Identifier (ARK)" value={id} isArk={true} />
          <DetailDisplay label="Authors" value={authors} />
          <DetailDisplay
            label="Date Published"
            value={date ? new Date(date).toLocaleDateString() : undefined}
          />
          <DetailDisplay label="Size" value={size} />
          <DetailDisplay
            label="DOI"
            value={doi}
            isLink={true}
            href={
              doi ? `https://doi.org/${doi.replace(/^doi:/, "")}` : undefined
            }
          />
          <DetailDisplay label="Contact" value={contact} isEmail={true} />
          <DetailDisplay label="License" value={license} isLink={true} />
          <DetailDisplay label="Funder" value={funder} />
          <DetailDisplay
            label="Related Publications"
            value={related_publications}
          />
        </DetailsList>
        {keywordsArray.length > 0 && (
          <KeywordsContainerStyled>
            <DetailItemWrapper>
              <strong>Keywords:</strong>
              <div style={{ marginTop: "4px" }}>
                {keywordsArray.map((keyword, index) => (
                  <KeywordPillSubdued key={index}>{keyword}</KeywordPillSubdued>
                ))}
              </div>
            </DetailItemWrapper>
          </KeywordsContainerStyled>
        )}
      </CardContent>

      {linkForButton && (
        <SubcrateLinkButton
          href={linkForButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          {buttonText}
        </SubcrateLinkButton>
      )}
    </CardContainer>
  );
};

export default SubcrateCard;

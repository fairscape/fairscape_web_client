// src/components/DatasheetViewer/OverviewSection.jsx
import React from "react";
import styles from "./styles/OverviewSection.module.css"; 

const OverviewSection = ({ overviewData = {} }) => {
  const {
    id_value = "",
    doi = "",
    release_date = "",
    formatted_size = "N/A", 
    description = "",
    authors = "",
    publisher = "",
    principal_investigator = "",
    contact_email = "",
    license_value = "",
    confidentiality_level = "",
    keywords = "",
    citation = "",
    human_subject = "",
    funding = "",
    completeness = "",
    related_publications = [],
  } = overviewData;

  const keywordsDisplay = Array.isArray(keywords)
    ? keywords.join(", ")
    : keywords;
  const displayDOI = doi.startsWith("http") ? doi : `https://doi.org/${doi}`;
  const fairscapeBaseUrl = "https://fairscape.net/"; // Define your base URL

  return (
    <div className={styles.summarySection}>
      <h2>Release Overview</h2>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>ROCrate ID</div>
        <div className={styles.summaryValue} id="accession">
          {id_value ? (
            <a
              href={`${fairscapeBaseUrl}${id_value}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {id_value}
            </a>
          ) : (
            "N/A"
          )}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>DOI</div>
        <div className={styles.summaryValue} id="doi">
          {doi ? (
            <a href={displayDOI} target="_blank" rel="noopener noreferrer">
              {doi}
            </a>
          ) : (
            "None"
          )}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Release Date</div>
        <div className={styles.summaryValue} id="release-date">
          {release_date || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Size</div>
        <div className={styles.summaryValue} id="content-size">
          {formatted_size}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Description</div>
        <div className={styles.summaryValue} id="description">
          {description || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Authors</div>
        <div className={styles.summaryValue} id="authors">
          {authors || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Publisher</div>
        <div className={styles.summaryValue} id="publisher">
          {publisher || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Principal Investigator</div>
        <div className={styles.summaryValue} id="principal-investigator">
          {principal_investigator || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Contact Email</div>
        <div className={styles.summaryValue} id="contact-email">
          {contact_email || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>License</div>
        <div className={styles.summaryValue} id="license">
          {license_value ? (
            <a href={license_value} target="_blank" rel="noopener noreferrer">
              {license_value}
            </a>
          ) : (
            "Not specified"
          )}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Confidentiality Level</div>
        <div className={styles.summaryValue} id="confidentiality-level">
          {confidentiality_level || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Keywords</div>
        <div className={styles.summaryValue} id="keywords">
          {keywordsDisplay || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Citation</div>
        <div className={styles.summaryValue} id="citation">
          {citation || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Human Subject Data</div>
        <div className={styles.summaryValue} id="human-subject">
          {human_subject || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Funding</div>
        <div className={styles.summaryValue} id="funding">
          {funding || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Completeness</div>
        <div className={styles.summaryValue} id="completeness">
          {completeness || "N/A"}
        </div>
      </div>
      <div className={styles.summaryRow}>
        <div className={styles.summaryLabel}>Related Publications</div>
        <div className={styles.summaryValue} id="related-publications">
          {related_publications && related_publications.length > 0 ? (
            <ul className={styles.publicationsList}>
              {related_publications.map((pub, index) => (
                <li key={index}>{pub}</li>
              ))}
            </ul>
          ) : (
            "None"
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;

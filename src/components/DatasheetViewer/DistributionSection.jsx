import React from "react";
import styles from "./styles/DistributionSection.module.css";

const DistributionSection = ({ distributionData = {} }) => {
  const {
    publisher = "",
    host = "",
    license_value = "",
    doi = "",
    release_date = "",
    version = "",
  } = distributionData;

  const displayDOI =
    doi && doi.startsWith("http") ? doi : doi ? `https://doi.org/${doi}` : "";
  const hasContent =
    publisher || host || license_value || doi || release_date || version;

  if (!hasContent) {
    return null;
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2>Distribution Information</h2>
      </div>
      <div className={styles.distributionSection}>
        {publisher && (
          <div className={styles.distributionItem}>
            <div className={styles.distributionLabel}>Publisher:</div>
            <div className={styles.distributionValue}>{publisher}</div>
          </div>
        )}
        {host && (
          <div className={styles.distributionItem}>
            <div className={styles.distributionLabel}>Distribution Host:</div>
            <div className={styles.distributionValue}>{host}</div>
          </div>
        )}
        {license_value && (
          <div className={styles.distributionItem}>
            <div className={styles.distributionLabel}>License:</div>
            <div className={styles.distributionValue}>
              <a href={license_value} target="_blank" rel="noopener noreferrer">
                {license_value}
              </a>
            </div>
          </div>
        )}
        {doi && (
          <div className={styles.distributionItem}>
            <div className={styles.distributionLabel}>DOI:</div>
            <div className={styles.distributionValue}>
              <a href={displayDOI} target="_blank" rel="noopener noreferrer">
                {doi}
              </a>
            </div>
          </div>
        )}
        {release_date && (
          <div className={styles.distributionItem}>
            <div className={styles.distributionLabel}>Release Date:</div>
            <div className={styles.distributionValue}>{release_date}</div>
          </div>
        )}
        {version && (
          <div className={styles.distributionItem}>
            <div className={styles.distributionLabel}>Version:</div>
            <div className={styles.distributionValue}>{version}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default DistributionSection;

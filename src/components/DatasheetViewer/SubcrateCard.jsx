import React from "react";
import styles from "./styles/SubcrateCard.module.css";

const renderDictItems = (dict) => {
  if (!dict || Object.keys(dict).length === 0) return null;
  return Object.entries(dict)
    .map(([key, count]) => `${key} (${count})`)
    .join(", ");
};

const renderListItems = (list) => {
  if (!list || list.length === 0) return null;
  return list.join(", ");
};

const SubcrateCard = ({ subcrate }) => {
  const {
    name = "Unnamed Sub-Crate",
    id = "",
    description = "",
    authors = "",
    date = "Not specified",
    size = "N/A",
    doi = "",
    contact = "Not specified",
    license = "",
    keywords = [],
    related_publications = [],
    metadataPath = "",
    previewUrl = "#",
    error = null,

    files_count = 0,
    software_count = 0,
    instruments_count = 0,
    samples_count = 0,
    experiments_count = 0,
    computations_count = 0,
    schemas_count = 0,
    other_count = 0,
    inputs_count = 0,
    input_datasets_count = 0,

    file_formats = {},
    file_access = {},
    computation_patterns = [],
    input_datasets = {},
    experiment_patterns = [],
    cell_lines = {},
    species = {},
    experiment_types = {},
  } = subcrate;

  const keywordsDisplay = Array.isArray(keywords)
    ? keywords.join(", ")
    : keywords;
  const displayDOI =
    doi && doi.startsWith("http") ? doi : doi ? `https://doi.org/${doi}` : "";
  const fairscapeBaseUrl = "https://fairscape.net/"; // Define your base URL

  if (error) {
    return (
      <div className={`${styles.subcrateSummary} ${styles.subcrateError}`}>
        <h3 className={styles.subcrateTitle}>{name}</h3>
        <p>
          <strong>Error processing this sub-crate:</strong> {error}
        </p>
        {metadataPath && <p>Metadata path: {metadataPath}</p>}
      </div>
    );
  }

  return (
    <div className={styles.subcrateSummary}>
      <h3 className={styles.subcrateTitle}>{name}</h3>

      <div className={styles.subcrateMetadata}>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>ROCrate ID:</span>
          <span className={styles.metadataValue}>
            {id ? (
              <a
                href={`${fairscapeBaseUrl}${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {id}
              </a>
            ) : (
              "N/A"
            )}
          </span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Description:</span>
          <span className={styles.metadataValue}>{description || "N/A"}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Authors:</span>
          <span className={styles.metadataValue}>{authors || "N/A"}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Date:</span>
          <span className={styles.metadataValue}>{date}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Size:</span>
          <span className={styles.metadataValue}>{size}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>DOI:</span>
          <span className={styles.metadataValue}>
            {displayDOI ? (
              <a href={displayDOI} target="_blank" rel="noopener noreferrer">
                {doi}
              </a>
            ) : (
              "None"
            )}
          </span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Contact:</span>
          <span className={styles.metadataValue}>{contact}</span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>License:</span>
          <span className={styles.metadataValue}>
            {license ? (
              <a href={license} target="_blank" rel="noopener noreferrer">
                {license}
              </a>
            ) : (
              "Not specified"
            )}
          </span>
        </div>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Keywords:</span>
          <span className={styles.metadataValue}>
            {keywordsDisplay || "None"}
          </span>
        </div>
        {related_publications && related_publications.length > 0 && (
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Related Publications:</span>
            <span className={styles.metadataValue}>
              <ul className={styles.compactList}>
                {related_publications.map((pub, index) => (
                  <li key={index}>{pub}</li>
                ))}
              </ul>
            </span>
          </div>
        )}
      </div>

      <div className={styles.subcrateComposition}>
        <h4>Content Summary</h4>
        <div className={styles.compactGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📊</span>
              <span className={styles.cardTitle}>Files ({files_count})</span>
            </div>
            {(Object.keys(file_formats).length > 0 ||
              Object.keys(file_access).length > 0) && (
              <div className={styles.cardContent}>
                {Object.keys(file_formats).length > 0 && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Formats: </span>
                    <span className={styles.statValue}>
                      {renderDictItems(file_formats)}
                    </span>
                  </div>
                )}
                {Object.keys(file_access).length > 0 && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Access: </span>
                    <span className={styles.statValue}>
                      {renderDictItems(file_access)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>💻</span>
              <span className={styles.cardTitle}>
                Software & Instruments ({software_count + instruments_count})
              </span>
            </div>
            {(software_count > 0 || instruments_count > 0) && (
              <div className={styles.cardContent}>
                {software_count > 0 && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Software: </span>
                    <span className={styles.statValue}>{software_count}</span>
                  </div>
                )}
                {instruments_count > 0 && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Instruments: </span>
                    <span className={styles.statValue}>
                      {instruments_count}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🧪</span>
              <span className={styles.cardTitle}>Inputs ({inputs_count})</span>
            </div>
            {(samples_count > 0 || input_datasets_count > 0) && (
              <div className={styles.cardContent}>
                {samples_count > 0 && (
                  <>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Samples: </span>
                      <span className={styles.statValue}>{samples_count}</span>
                    </div>
                    {Object.keys(cell_lines).length > 0 && (
                      <div className={`${styles.statRow} ${styles.indent}`}>
                        <span className={`${styles.statValue} ${styles.small}`}>
                          {renderDictItems(cell_lines)}
                        </span>
                      </div>
                    )}
                    {Object.keys(species).length > 0 && (
                      <div className={`${styles.statRow} ${styles.indent}`}>
                        <span className={`${styles.statValue} ${styles.small}`}>
                          {renderDictItems(species)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {input_datasets_count > 0 && (
                  <>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>
                        External Datasets:{" "}
                      </span>
                      <span className={styles.statValue}>
                        {input_datasets_count}
                      </span>
                    </div>
                    {Object.keys(input_datasets).length > 0 && (
                      <div className={`${styles.statRow} ${styles.indent}`}>
                        <span className={styles.statValue}>
                          {Object.entries(input_datasets).map(
                            ([fmt, count], idx, arr) => (
                              <React.Fragment key={fmt}>
                                {fmt}{" "}
                                <span className={styles.small}>({count})</span>
                                {idx < arr.length - 1 ? ", " : ""}
                              </React.Fragment>
                            )
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>⚙️</span>
              <span className={styles.cardTitle}>Other Components</span>
            </div>
            {(experiments_count > 0 ||
              computations_count > 0 ||
              schemas_count > 0 ||
              other_count > 0) && (
              <div className={styles.cardContent}>
                {experiments_count > 0 && (
                  <>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Experiments: </span>
                      <span className={styles.statValue}>
                        {experiments_count}
                      </span>
                    </div>
                    {Object.keys(experiment_types).length > 0 && (
                      <div className={`${styles.statRow} ${styles.indent}`}>
                        <span className={`${styles.statValue} ${styles.small}`}>
                          {renderDictItems(experiment_types)}
                        </span>
                      </div>
                    )}
                    {experiment_patterns && experiment_patterns.length > 0 && (
                      <div className={`${styles.statRow} ${styles.indent}`}>
                        <span className={`${styles.statValue} ${styles.small}`}>
                          {renderListItems(experiment_patterns)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {computations_count > 0 && (
                  <>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Computations: </span>
                      <span className={styles.statValue}>
                        {computations_count}
                      </span>
                    </div>
                    {computation_patterns &&
                      computation_patterns.length > 0 && (
                        <div className={`${styles.statRow} ${styles.indent}`}>
                          <span
                            className={`${styles.statValue} ${styles.small}`}
                          >
                            {renderListItems(computation_patterns)}
                          </span>
                        </div>
                      )}
                  </>
                )}
                {schemas_count > 0 && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Schemas: </span>
                    <span className={styles.statValue}>{schemas_count}</span>
                  </div>
                )}
                {other_count > 0 && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Other: </span>
                    <span className={styles.statValue}>{other_count}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {previewUrl && previewUrl !== "#" && (
        <div className={styles.viewFullLink}>
          <a href={previewUrl} className={styles.viewFullButton}>
            View Full Dataset Details
          </a>
        </div>
      )}
    </div>
  );
};

export default SubcrateCard;

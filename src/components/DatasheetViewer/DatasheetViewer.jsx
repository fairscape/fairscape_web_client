import React from "react";
import OverviewSection from "./OverviewSection";
import UseCasesSection from "./UseCasesSection";
import DistributionSection from "./DistributionSection";
import CompositionSection from "./CompositionSection";
import styles from "./styles/DatasheetViewer.module.css";

const DatasheetViewer = ({ data }) => {
  if (!data) {
    return <div>No data provided to DatasheetViewer.</div>;
  }

  const {
    title = "Untitled RO-Crate",
    version = "",
    overview = {},
    useCases = {},
    distribution = {},
    composition = {},
  } = data;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 id="project-title">{title}</h1>
        {version && <div>Version: {version}</div>}
      </header>

      <OverviewSection overviewData={overview} />

      <UseCasesSection useCasesData={useCases} />

      <div className={styles.sectionHeader}>
        <h2>Composition (Datasets {composition?.subcrates?.length || 0})</h2>
      </div>
      <CompositionSection compositionData={composition} />

      <DistributionSection distributionData={distribution} />
    </div>
  );
};

export default DatasheetViewer;

import React from "react";
import styles from "./styles/UseCasesSection.module.css";

const UseCasesSection = ({ useCasesData = {} }) => {
  const {
    intended_uses = "",
    limitations = "",
    prohibited_uses = "",
    maintenance_plan = "",
  } = useCasesData;

  const hasContent =
    intended_uses || limitations || prohibited_uses || maintenance_plan;

  if (!hasContent) {
    return null;
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2>Use Cases and Limitations</h2>
      </div>
      <div className={styles.useCasesSection}>
        {intended_uses && (
          <div className={styles.useCasesItem}>
            <div className={styles.useCasesLabel}>Intended Uses:</div>
            <div className={styles.useCasesValue}>{intended_uses}</div>
          </div>
        )}
        {limitations && (
          <div className={styles.useCasesItem}>
            <div className={styles.useCasesLabel}>Limitations:</div>
            <div className={styles.useCasesValue}>{limitations}</div>
          </div>
        )}
        {prohibited_uses && (
          <div className={styles.useCasesItem}>
            <div className={styles.useCasesLabel}>Prohibited Uses:</div>
            <div className={styles.useCasesValue}>{prohibited_uses}</div>
          </div>
        )}
        {maintenance_plan && (
          <div className={styles.useCasesItem}>
            <div className={styles.useCasesLabel}>Maintenance Plan:</div>
            <div className={styles.useCasesValue}>{maintenance_plan}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default UseCasesSection;

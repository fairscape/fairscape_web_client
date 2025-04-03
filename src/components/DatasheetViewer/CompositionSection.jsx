import React from "react";
import SubcrateCard from "./SubcrateCard";
import styles from "./styles/CompositionSection.module.css";

const CompositionSection = ({ compositionData = {} }) => {
  const { subcrates = [] } = compositionData;

  return (
    <div className={styles.subcratesContainer}>
      {subcrates.length > 0 ? (
        subcrates.map((subcrate, index) => (
          <SubcrateCard key={subcrate.id || index} subcrate={subcrate} />
        ))
      ) : (
        <p>No subcrates found.</p>
      )}
    </div>
  );
};

export default CompositionSection;

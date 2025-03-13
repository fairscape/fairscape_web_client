import React, { useState, useEffect } from "react";
import PepList from "../components/pep/PepList";
import PepForm from "../components/pep/PepForm";
import "./BuildAPep.css";
import bioPep from "../components/pep/schemas/perturb-seq.json";
import imagingPep from "../components/pep/schemas/image-pep.json";

const BuildAPep = () => {
  const [pepSchemas, setPepSchemas] = useState([]);
  const [selectedPep, setSelectedPep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log("Loading schemas...");
      const schemas = [
        {
          id: "bio",
          name: "BioSample & SRA",
          description: "A PEP for data uploaded as a BioProject.",
          schema: bioPep,
        },
        {
          id: "imaging",
          name: "BioImage Archive PEP",
          description:
            "A PEP for BioImage Archive data following REMBI metadata model.",
          schema: imagingPep,
        },
      ];
      console.log("Schemas loaded:", schemas);
      setPepSchemas(schemas);
      setLoading(false);
    } catch (err) {
      console.error("Error loading schemas:", err);
      setError(`Failed to load PEP schemas: ${err.message}`);
      setLoading(false);
    }
  }, []);

  const handleSelectPep = (pepSchema) => {
    console.log("Selected schema:", pepSchema);
    // Pass the entire schema object to the PepForm
    setSelectedPep(pepSchema);
  };

  const handleBackToList = () => {
    setSelectedPep(null);
  };

  if (loading) {
    return <div className="loading">Loading PEP schemas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!selectedPep) {
    return <PepList pepSchemas={pepSchemas} onSelectPep={handleSelectPep} />;
  }

  return <PepForm selectedPep={selectedPep} onBackToList={handleBackToList} />;
};

export default BuildAPep;

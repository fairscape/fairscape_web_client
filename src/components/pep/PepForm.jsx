import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PepForm.css";
import CommonFieldsSection from "./CommonFieldsSection";
import ItemsSection from "./ItemsSection";
import { getUniqueFields, getCommonFields, createEmptyItem } from "./utils";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const PepForm = ({ selectedPep, onBackToList }) => {
  const [formData, setFormData] = useState({
    commonSampleFields: {},
    samples: [],
    commonSubsampleFields: {},
    subsamples: [],
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedPep && selectedPep.schema) {
      const schema = selectedPep.schema;

      const sampleUniqueFields = getUniqueFields(
        schema.properties.samples.items.properties,
        selectedPep.schema
      );
      const subsampleUniqueFields = getUniqueFields(
        schema.properties.subsamples.items.properties,
        selectedPep.schema
      );

      const sampleCommonFields = getCommonFields(
        schema.properties.samples.items.properties,
        sampleUniqueFields
      );

      const subsampleCommonFields = getCommonFields(
        schema.properties.subsamples.items.properties,
        subsampleUniqueFields
      );

      const initialData = {
        commonSampleFields: createEmptyItem(sampleCommonFields),
        samples: [createEmptyItem(sampleUniqueFields)],
        commonSubsampleFields: createEmptyItem(subsampleCommonFields),
        subsamples: [createEmptyItem(subsampleUniqueFields)],
      };

      setFormData(initialData);
    }
  }, [selectedPep]);

  const handleCommonInputChange = (section, field, value) => {
    const newFormData = { ...formData };
    newFormData[section][field] = value;
    setFormData(newFormData);
  };

  const handleInputChange = (section, index, field, value) => {
    const newFormData = { ...formData };
    newFormData[section][index][field] = value;
    setFormData(newFormData);
  };

  const addItem = (section) => {
    const schema = selectedPep.schema;
    const newFormData = { ...formData };

    if (section === "samples") {
      const sampleUniqueFields = getUniqueFields(
        schema.properties.samples.items.properties,
        selectedPep.schema
      );
      newFormData.samples.push(createEmptyItem(sampleUniqueFields));
    } else if (section === "subsamples") {
      const subsampleUniqueFields = getUniqueFields(
        schema.properties.subsamples.items.properties,
        selectedPep.schema
      );
      newFormData.subsamples.push(createEmptyItem(subsampleUniqueFields));
    }

    setFormData(newFormData);
  };

  const removeItem = (section, index) => {
    const newFormData = { ...formData };
    newFormData[section].splice(index, 1);
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Combine common fields with unique fields
      const combinedSamples = formData.samples.map((sample) => ({
        ...formData.commonSampleFields,
        ...sample,
      }));

      const combinedSubsamples = formData.subsamples.map((subsample) => ({
        ...formData.commonSubsampleFields,
        ...subsample,
      }));

      // Convert to CSV
      const samplesCSV = convertToCSV(combinedSamples);
      const subsamplesCSV = convertToCSV(combinedSubsamples);

      // Download the CSV files
      downloadCSV(samplesCSV, "samples.csv");
      downloadCSV(subsamplesCSV, "subsamples.csv");

      alert("CSV files downloaded successfully!");
    } catch (err) {
      setError(`Failed to create CSV files: ${err.message}`);
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (items) => {
    if (items.length === 0) return "";

    const headers = Object.keys(items[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(","));

    // Add data rows
    for (const item of items) {
      const values = headers.map((header) => {
        const val = item[header] || "";
        // Escape quotes and wrap in quotes if contains comma or newline
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  // Helper function to download CSV
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedPep || !selectedPep.schema) {
    return <div className="loading">Loading schema details...</div>;
  }

  const schema = selectedPep.schema;
  const sampleUniqueFields = getUniqueFields(
    schema.properties.samples.items.properties,
    selectedPep.schema
  );
  const subsampleUniqueFields = getUniqueFields(
    schema.properties.subsamples.items.properties,
    selectedPep.schema
  );
  const sampleCommonFields = getCommonFields(
    schema.properties.samples.items.properties,
    sampleUniqueFields
  );
  const subsampleCommonFields = getCommonFields(
    schema.properties.subsamples.items.properties,
    subsampleUniqueFields
  );

  return (
    <div className="build-pep-container">
      <div className="pep-header">
        <h2>Building PEP: {selectedPep.name}</h2>
        <p className="pep-description">{selectedPep.description}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Common Sample Fields */}
        <CommonFieldsSection
          title="Project Information"
          badgeText="Applies to all samples"
          fields={sampleCommonFields}
          fieldValues={formData.commonSampleFields}
          sectionKey="commonSampleFields"
          handleInputChange={handleCommonInputChange}
        />

        {/* Unique Sample Fields */}
        <ItemsSection
          title="Sample Information"
          badgeText="Unique per sample"
          uniqueFields={sampleUniqueFields}
          items={formData.samples}
          schema={schema}
          schemaPath="samples"
          sectionKey="samples"
          handleInputChange={handleInputChange}
          addItem={addItem}
          removeItem={removeItem}
          itemName="Sample"
        />

        {/* Common Subsample Fields */}
        <CommonFieldsSection
          title="Experiment Information"
          badgeText="Applies to all subsamples"
          fields={subsampleCommonFields}
          fieldValues={formData.commonSubsampleFields}
          sectionKey="commonSubsampleFields"
          handleInputChange={handleCommonInputChange}
        />

        {/* Unique Subsample Fields */}
        <ItemsSection
          title="Subsample Information"
          badgeText="Unique per subsample"
          uniqueFields={subsampleUniqueFields}
          items={formData.subsamples}
          schema={schema}
          schemaPath="subsamples"
          sectionKey="subsamples"
          handleInputChange={handleInputChange}
          addItem={addItem}
          removeItem={removeItem}
          itemName="Subsample"
        />

        <div className="submit-container">
          <button
            type="button"
            className="back-button button-with-icon"
            onClick={onBackToList}
          >
            ← Back to PEP List
          </button>
          <button type="submit" className="submit-button button-with-icon">
            💾 Download PEP
          </button>
        </div>
      </form>
    </div>
  );
};

export default PepForm;

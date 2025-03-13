import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PepForm.css";

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

  // Initialize form data based on schema
  useEffect(() => {
    if (selectedPep && selectedPep.schema) {
      const schema = selectedPep.schema;

      // Get unique fields
      const sampleUniqueFields = getUniqueFields(
        schema.properties.samples.items.properties
      );
      const subsampleUniqueFields = getUniqueFields(
        schema.properties.subsamples.items.properties
      );

      // Get common fields (all fields that are not unique)
      const sampleCommonFields = getCommonFields(
        schema.properties.samples.items.properties,
        sampleUniqueFields
      );

      const subsampleCommonFields = getCommonFields(
        schema.properties.subsamples.items.properties,
        subsampleUniqueFields
      );

      // Initialize with empty data structure based on schema
      const initialData = {
        commonSampleFields: createEmptyItem(sampleCommonFields),
        samples: [createEmptyItem(sampleUniqueFields)],
        commonSubsampleFields: createEmptyItem(subsampleCommonFields),
        subsamples: [createEmptyItem(subsampleUniqueFields)],
      };

      setFormData(initialData);
    }
  }, [selectedPep]);

  // Get fields marked as unique in the schema
  const getUniqueFields = (schemaProperties) => {
    const uniqueFields = {};

    if (schemaProperties) {
      Object.keys(schemaProperties).forEach((field) => {
        if (schemaProperties[field].unique === true) {
          uniqueFields[field] = schemaProperties[field];
        }
      });
    }

    // Always include required fields in unique fields
    if (schemaProperties) {
      Object.keys(schemaProperties).forEach((field) => {
        if (
          selectedPep.schema.properties.samples.items.required?.includes(
            field
          ) ||
          selectedPep.schema.properties.subsamples.items.required?.includes(
            field
          )
        ) {
          uniqueFields[field] = schemaProperties[field];
        }
      });
    }

    return uniqueFields;
  };

  // Get common fields (fields that are not unique)
  const getCommonFields = (schemaProperties, uniqueFields) => {
    const commonFields = {};

    if (schemaProperties) {
      Object.keys(schemaProperties).forEach((field) => {
        if (!uniqueFields[field]) {
          commonFields[field] = schemaProperties[field];
        }
      });
    }

    return commonFields;
  };

  // Create an empty item based on schema properties
  const createEmptyItem = (schemaProperties) => {
    const emptyItem = {};

    // Initialize all fields defined in the schema with empty strings
    if (schemaProperties) {
      Object.keys(schemaProperties).forEach((field) => {
        emptyItem[field] = "";
      });
    }

    return emptyItem;
  };

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
        schema.properties.samples.items.properties
      );
      newFormData.samples.push(createEmptyItem(sampleUniqueFields));
    } else if (section === "subsamples") {
      const subsampleUniqueFields = getUniqueFields(
        schema.properties.subsamples.items.properties
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
      // Combine common fields with unique fields for submission
      const combinedFormData = {
        samples: formData.samples.map((sample) => ({
          ...formData.commonSampleFields,
          ...sample,
        })),
        subsamples: formData.subsamples.map((subsample) => ({
          ...formData.commonSubsampleFields,
          ...subsample,
        })),
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/peps/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pepType: selectedPep.name,
          data: combinedFormData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert("PEP created successfully!");
      navigate("/peps");
    } catch (err) {
      setError(`Failed to submit PEP: ${err.message}`);
    }
  };

  // If no schema is selected yet, or still loading
  if (!selectedPep || !selectedPep.schema) {
    return <div className="loading">Loading schema details...</div>;
  }

  const schema = selectedPep.schema;
  const sampleUniqueFields = getUniqueFields(
    schema.properties.samples.items.properties
  );
  const subsampleUniqueFields = getUniqueFields(
    schema.properties.subsamples.items.properties
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
        <div className="section">
          <div className="section-header">
            <h3>Project Information</h3>
            <span className="section-badge">Applies to all samples</span>
          </div>
          <div className="form-fields">
            {Object.keys(sampleCommonFields).map((field) => (
              <div key={field} className="form-group">
                <label htmlFor={`common-sample-${field}`}>
                  {field.replace(/_/g, " ")}
                </label>
                <input
                  id={`common-sample-${field}`}
                  type="text"
                  value={formData.commonSampleFields[field] || ""}
                  onChange={(e) =>
                    handleCommonInputChange(
                      "commonSampleFields",
                      field,
                      e.target.value
                    )
                  }
                />
                {sampleCommonFields[field]?.description && (
                  <p className="field-description">
                    {sampleCommonFields[field].description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unique Sample Fields */}
        <div className="section">
          <div className="section-header">
            <h3>Sample Information</h3>
            <span className="section-badge">Unique per sample</span>
          </div>

          <div className="items-container">
            {formData.samples.map((sample, sampleIndex) => (
              <div key={sampleIndex} className="sample-container">
                <div className="item-header">
                  <h4>Sample {sampleIndex + 1}</h4>
                  {formData.samples.length > 1 && (
                    <button
                      type="button"
                      className="remove-button button-with-icon"
                      onClick={() => removeItem("samples", sampleIndex)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                <div className="form-fields">
                  {Object.keys(sampleUniqueFields).map((field) => (
                    <div key={field} className="form-group">
                      <label htmlFor={`sample-${sampleIndex}-${field}`}>
                        {field.replace(/_/g, " ")}
                        {schema.properties.samples.items.required?.includes(
                          field
                        ) && <span className="required">*</span>}
                      </label>
                      <input
                        id={`sample-${sampleIndex}-${field}`}
                        type="text"
                        value={sample[field] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "samples",
                            sampleIndex,
                            field,
                            e.target.value
                          )
                        }
                        required={schema.properties.samples.items.required?.includes(
                          field
                        )}
                      />
                      {sampleUniqueFields[field]?.description && (
                        <p className="field-description">
                          {sampleUniqueFields[field].description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="button-group">
            <input
              id="sample-csv-upload"
              type="file"
              accept=".csv"
              className="csv-upload-input"
              style={{ display: "none" }}
            />
            <label
              htmlFor="sample-csv-upload"
              className="csv-upload-button button-with-icon"
            >
              📄 Upload CSV
            </label>
            <button
              type="button"
              className="add-button button-with-icon"
              onClick={() => addItem("samples")}
            >
              + Add Sample
            </button>
          </div>
        </div>

        {/* Common Subsample Fields */}
        <div className="section">
          <div className="section-header">
            <h3>Experiment Information</h3>
            <span className="section-badge">Applies to all subsamples</span>
          </div>
          <div className="form-fields">
            {Object.keys(subsampleCommonFields).map((field) => (
              <div key={field} className="form-group">
                <label htmlFor={`common-subsample-${field}`}>
                  {field.replace(/_/g, " ")}
                </label>
                <input
                  id={`common-subsample-${field}`}
                  type="text"
                  value={formData.commonSubsampleFields[field] || ""}
                  onChange={(e) =>
                    handleCommonInputChange(
                      "commonSubsampleFields",
                      field,
                      e.target.value
                    )
                  }
                />
                {subsampleCommonFields[field]?.description && (
                  <p className="field-description">
                    {subsampleCommonFields[field].description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unique Subsample Fields */}
        <div className="section">
          <div className="section-header">
            <h3>Subsample Information</h3>
            <span className="section-badge">Unique per subsample</span>
          </div>

          <div className="items-container">
            {formData.subsamples.map((subsample, subsampleIndex) => (
              <div key={subsampleIndex} className="subsample-container">
                <div className="item-header">
                  <h4>Subsample {subsampleIndex + 1}</h4>
                  {formData.subsamples.length > 1 && (
                    <button
                      type="button"
                      className="remove-button button-with-icon"
                      onClick={() => removeItem("subsamples", subsampleIndex)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                <div className="form-fields">
                  {Object.keys(subsampleUniqueFields).map((field) => (
                    <div key={field} className="form-group">
                      <label htmlFor={`subsample-${subsampleIndex}-${field}`}>
                        {field.replace(/_/g, " ")}
                        {schema.properties.subsamples.items.required?.includes(
                          field
                        ) && <span className="required">*</span>}
                      </label>
                      <input
                        id={`subsample-${subsampleIndex}-${field}`}
                        type="text"
                        value={subsample[field] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "subsamples",
                            subsampleIndex,
                            field,
                            e.target.value
                          )
                        }
                        required={schema.properties.subsamples.items.required?.includes(
                          field
                        )}
                      />
                      {subsampleUniqueFields[field]?.description && (
                        <p className="field-description">
                          {subsampleUniqueFields[field].description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="button-group">
            <input
              id="subsample-csv-upload"
              type="file"
              accept=".csv"
              className="csv-upload-input"
              style={{ display: "none" }}
            />
            <label
              htmlFor="subsample-csv-upload"
              className="csv-upload-button button-with-icon"
            >
              📄 Upload CSV
            </label>
            <button
              type="button"
              className="add-button button-with-icon"
              onClick={() => addItem("subsamples")}
            >
              + Add Subsample
            </button>
          </div>
        </div>

        <div className="submit-container">
          <button
            type="button"
            className="back-button button-with-icon"
            onClick={onBackToList}
          >
            ← Back to PEP List
          </button>
          <button type="submit" className="submit-button button-with-icon">
            💾 Create PEP
          </button>
        </div>
      </form>
    </div>
  );
};

export default PepForm;

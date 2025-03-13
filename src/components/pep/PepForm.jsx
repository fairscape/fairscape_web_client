import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PepForm.css";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const PepForm = ({ selectedPep, onBackToList }) => {
  const [formData, setFormData] = useState({
    samples: [],
    subsamples: [],
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize form data based on schema
  useEffect(() => {
    if (selectedPep && selectedPep.schema) {
      const schema = selectedPep.schema;

      // Initialize with empty data structure based on schema
      const initialData = {
        samples: [createEmptyItem(schema.properties.samples.items.properties)],
        subsamples: [
          createEmptyItem(schema.properties.subsamples.items.properties),
        ],
      };

      setFormData(initialData);
    }
  }, [selectedPep]);

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

  const handleInputChange = (section, index, field, value) => {
    const newFormData = { ...formData };
    newFormData[section][index][field] = value;
    setFormData(newFormData);
  };

  const addItem = (section) => {
    const schema = selectedPep.schema;
    const newFormData = { ...formData };

    if (section === "samples") {
      newFormData.samples.push(
        createEmptyItem(schema.properties.samples.items.properties)
      );
    } else if (section === "subsamples") {
      newFormData.subsamples.push(
        createEmptyItem(schema.properties.subsamples.items.properties)
      );
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
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/peps/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pepType: selectedPep.name,
          data: formData,
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

  return (
    <div className="build-pep-container">
      <h2>Building PEP: {selectedPep.name}</h2>
      <p className="pep-description">{selectedPep.description}</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>Samples</h3>
          {formData.samples.map((sample, sampleIndex) => (
            <div key={sampleIndex} className="sample-container">
              <h4>Sample {sampleIndex + 1}</h4>
              <div className="form-fields">
                {Object.keys(schema.properties.samples.items.properties).map(
                  (field) => (
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
                      {schema.properties.samples.items.properties[field]
                        ?.description && (
                        <p className="field-description">
                          {
                            schema.properties.samples.items.properties[field]
                              .description
                          }
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
              {formData.samples.length > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeItem("samples", sampleIndex)}
                >
                  Remove Sample
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-button"
            onClick={() => addItem("samples")}
          >
            Add Sample
          </button>
        </div>

        <div className="section">
          <h3>Subsamples</h3>
          {formData.subsamples.map((subsample, subsampleIndex) => (
            <div key={subsampleIndex} className="subsample-container">
              <h4>Subsample {subsampleIndex + 1}</h4>
              <div className="form-fields">
                {Object.keys(schema.properties.subsamples.items.properties).map(
                  (field) => (
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
                      {schema.properties.subsamples.items.properties[field]
                        ?.description && (
                        <p className="field-description">
                          {
                            schema.properties.subsamples.items.properties[field]
                              .description
                          }
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
              {formData.subsamples.length > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeItem("subsamples", subsampleIndex)}
                >
                  Remove Subsample
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-button"
            onClick={() => addItem("subsamples")}
          >
            Add Subsample
          </button>
        </div>

        <div className="submit-container">
          <button type="submit" className="submit-button">
            Create PEP
          </button>
          <button type="button" className="back-button" onClick={onBackToList}>
            Back to PEP List
          </button>
        </div>
      </form>
    </div>
  );
};

export default PepForm;

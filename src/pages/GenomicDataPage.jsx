import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GenomicDataPage.css";
import FormFactory from "../components/GenomicForm/forms/FormFactory";
import FormProgress from "../components/GenomicForm/forms/FormProgress";
import FormNavigation from "../components/GenomicForm/forms/FormNavigation";

// Import schemas
import projectSchema from "../components/GenomicForm/schemas/projectSchema";
import sampleSchema from "../components/GenomicForm/schemas/sampleSchema";
import experimentSchema from "../components/GenomicForm/schemas/experimentSchema";
import outputSchema from "../components/GenomicForm/schemas/outputSchema";

const GenomicDataPage = () => {
  // Form steps
  const steps = [
    { id: "project", label: "Project" },
    { id: "samples", label: "Samples" },
    { id: "experiments", label: "Experiments" },
    { id: "outputs", label: "Outputs" },
    { id: "review", label: "Review" },
  ];

  // State for form data and current step
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    project: null,
    samples: { items: [] },
    experiments: { items: [] },
    outputs: { items: [] },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Function to format the experiment data to match the desired output structure
  const formatExperiment = (exp) => {
    return {
      accession: exp.accession || "",
      title: exp.title || "",
      study_ref: exp.study_ref || "",
      sample_ref: exp.sample_ref || "",
      design: {
        library_name: exp.library_name || "",
        library_strategy: exp.library_strategy || "",
        library_source: exp.library_source || "",
        library_selection: exp.library_selection || "",
        library_layout: exp.library_layout || "",
        nominal_length: exp.nominal_length || "",
      },
      platform: {
        type: exp.platform_type || "",
        instrument_model: exp.instrument_model || "",
      },
    };
  };

  // Function to format the biosample data to match the desired output structure
  const formatBiosample = (sample) => {
    // Extract basic properties
    const basicProps = {
      accession: sample.accession || "",
      title: sample.title || sample.sample_name || "",
      scientific_name: sample.scientific_name || "",
      taxon_id: sample.taxon_id || "",
    };

    // Create attributes object with remaining properties
    const attributes = {};
    Object.entries(sample).forEach(([key, value]) => {
      // Skip properties already included in the basic structure
      if (
        ![
          "accession",
          "title",
          "scientific_name",
          "taxon_id",
          "attributes",
        ].includes(key)
      ) {
        attributes[key] = value;
      }
    });

    // Include any existing attributes
    if (sample.attributes) {
      Object.assign(attributes, sample.attributes);
    }

    return {
      ...basicProps,
      attributes: attributes,
    };
  };

  // Function to format the output/run data to match the desired structure
  const formatOutput = (output) => {
    return {
      accession: output.accession || "",
      title: output.title || "",
      experiment_ref: output.experiment_ref || "",
      total_spots: output.total_spots || "",
      total_bases: output.total_bases || "",
      size: output.size || "",
      published: output.published || "",
      files: Array.isArray(output.files) ? output.files : [],
      nreads: output.nreads || "",
      nspots: output.nspots || "",
      base_count: output.base_count || "",
      base_composition: output.base_composition || {
        A: output.a_count || "",
        C: output.c_count || "",
        G: output.g_count || "",
        T: output.t_count || "",
        N: output.n_count || "",
      },
    };
  };

  // Function to download the data as a JSON file
  const downloadJson = (data, filename = "genomic-data.json") => {
    try {
      // Format each section according to the example structure
      const result = {
        bioproject: data.project || {},
        biosamples: (data.samples?.items || []).map(formatBiosample),
        experiments: (data.experiments?.items || []).map(formatExperiment),
        runs: (data.outputs?.items || []).map(formatOutput),
      };

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(result, null, 2);

      // Create a blob with the data
      const blob = new Blob([jsonString], { type: "application/json" });

      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      // Append to the body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the URL object
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error("Error downloading JSON:", err);
      setError(`Failed to download file: ${err.message}`);
      return false;
    }
  };

  // Update form data for a specific step
  const updateFormData = (step, data) => {
    setFormData((prevData) => ({
      ...prevData,
      [step]: data,
    }));
  };

  // Handle navigation between steps
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit the form if we're on the last step
      handleSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Construct the final GenomicData object
      const genomicData = {
        project: formData.project,
        samples: formData.samples,
        experiments: formData.experiments,
        outputs: formData.outputs,
      };

      // Log the data for debugging
      console.log("Genomic data for download:", genomicData);

      // Download the data as a JSON file
      const downloaded = downloadJson(genomicData);

      if (!downloaded) {
        throw new Error("Failed to download the file");
      }

      setIsSubmitting(false);
    } catch (err) {
      setError("Failed to submit data: " + err.message);
      setIsSubmitting(false);
    }
  };

  // Get the current schema based on step
  const getCurrentSchema = () => {
    switch (steps[currentStep].id) {
      case "project":
        return projectSchema;
      case "samples":
        return sampleSchema;
      case "experiments":
        return experimentSchema;
      case "outputs":
        return outputSchema;
      default:
        return null;
    }
  };

  // Get the current data based on step
  const getCurrentData = () => {
    const stepId = steps[currentStep].id;
    return formData[stepId];
  };

  // Render the current form step
  const renderCurrentStep = () => {
    const currentStepId = steps[currentStep].id;

    if (currentStepId === "review") {
      return (
        <div className="review-section">
          <h3>Review Genomic Data</h3>
          <div className="review-content">
            <h4>Project</h4>
            <div className="json-preview">
              <pre>{JSON.stringify(formData.project, null, 2)}</pre>
            </div>

            <h4>Samples ({formData.samples.items?.length || 0})</h4>
            <div className="json-preview">
              <pre>{JSON.stringify(formData.samples, null, 2)}</pre>
            </div>

            <h4>Experiments ({formData.experiments.items?.length || 0})</h4>
            <div className="json-preview">
              <pre>{JSON.stringify(formData.experiments, null, 2)}</pre>
            </div>

            <h4>Outputs ({formData.outputs.items?.length || 0})</h4>
            <div className="json-preview">
              <pre>{JSON.stringify(formData.outputs, null, 2)}</pre>
            </div>
          </div>

          <div className="download-section">
            <p>
              When you click "Submit" below, your data will be downloaded as a
              JSON file.
            </p>
          </div>
        </div>
      );
    }

    const schema = getCurrentSchema();
    const data = getCurrentData();

    return (
      <div className="form-wrapper" key={`form-${currentStepId}`}>
        <FormFactory
          key={currentStepId}
          schema={schema}
          data={data}
          updateData={(updatedData) =>
            updateFormData(currentStepId, updatedData)
          }
        />
      </div>
    );
  };

  return (
    <div className="genomic-data-container">
      <div className="genomic-header">
        <h1>Genomic Metadata Builder</h1>
        <p className="description">
          Complete the form to create structured genomic metadata
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <FormProgress
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      <div className="form-container">{renderCurrentStep()}</div>

      <FormNavigation
        currentStep={currentStep}
        totalSteps={steps.length - 1}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
        isSubmitting={isSubmitting}
        isLastStep={currentStep === steps.length - 1}
      />
    </div>
  );
};

export default GenomicDataPage;

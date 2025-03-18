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

      // For now, just log the data - in a real app, you'd send this to an API
      console.log("Submitting genomic data:", genomicData);

      // Example of sending to an API (commented out for now)
      // const response = await fetch('/api/genomic-data', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(genomicData)
      // });

      // Navigate to a confirmation page or show success message
      // navigate("/success");

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
        <h1>Genomic Data Builder</h1>
        <p className="description">
          Complete the form to create a Genomic Data structure
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

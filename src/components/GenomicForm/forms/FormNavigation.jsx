import React from "react";
import "./FormNavigation.css";

const FormNavigation = ({
  currentStep,
  totalSteps,
  goToNextStep,
  goToPreviousStep,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <div className="form-navigation">
      <button
        type="button"
        className="nav-button prev-button"
        onClick={goToPreviousStep}
        disabled={currentStep === 0 || isSubmitting}
      >
        ← Previous
      </button>

      <button
        type="button"
        className="nav-button next-button"
        onClick={goToNextStep}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="loading-indicator">Processing...</span>
        ) : isLastStep ? (
          "Submit"
        ) : (
          "Next →"
        )}
      </button>
    </div>
  );
};

export default FormNavigation;

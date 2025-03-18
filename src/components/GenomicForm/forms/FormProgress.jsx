import React from "react";
import "./FormProgress.css";

const FormProgress = ({ steps, currentStep, setCurrentStep }) => {
  return (
    <div className="form-progress">
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${
              index === currentStep ? "active" : ""
            } ${index < currentStep ? "completed" : ""}`}
            onClick={() => index < currentStep && setCurrentStep(index)}
          >
            <div className="step-number">
              {index < currentStep ? (
                <span className="checkmark">✓</span>
              ) : (
                index + 1
              )}
            </div>
            <div className="step-label">{step.label}</div>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormProgress;

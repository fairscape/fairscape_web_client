import React from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import styled from "styled-components";

const ProgressContainer = styled.div`
  width: 100%;
  padding: 1rem 0;
`;

const ProgressBarContainer = styled.div`
  background-color: #282828;
  border-radius: 25px;
  height: 50px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: ${(props) =>
    props.failed ? "#dc3545" : "linear-gradient(to right, #007bff, #28a745)"};
  width: ${(props) => {
    if (props.failed) return "100%";
    if (props.currentStep === -1) return "0%";
    return `${(props.currentStep * 100) / (props.totalSteps - 1)}%`;
  }};
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
`;

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
`;

const Step = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${(props) => (props.active ? "#ffffff" : "#aaaaaa")};
  z-index: 2;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StepInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StepLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => {
    if (props.status === "completed") return "#10b981";
    if (props.status === "current") return "#3b82f6";
    if (props.status === "error") return "#dc3545";
    return "#9ca3af";
  }};
`;

const StepDescription = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
`;

const PublishProgress = ({
  steps,
  currentStep,
  error = false,
  errorMessage,
}) => {
  const getStepStatus = (stepIndex) => {
    if (error && stepIndex === currentStep) return "error";
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "pending";
  };

  const getStepIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      case "current":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return (
          <div className="h-6 w-6 rounded-full border-2 border-gray-400" />
        );
    }
  };

  return (
    <ProgressContainer>
      <ProgressBarContainer>
        <ProgressBar
          currentStep={currentStep}
          totalSteps={steps.length}
          failed={error}
        />
        <StepContainer>
          {steps.map((step, index) => (
            <Step key={step.id} active={index <= currentStep && !error}>
              {index + 1}. {step.label}
            </Step>
          ))}
        </StepContainer>
      </ProgressBarContainer>
      <StepsList>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <StepItem key={step.id}>
              {getStepIcon(status)}
              <StepInfo>
                <StepLabel status={status}>{step.label}</StepLabel>
                {step.description && (
                  <StepDescription>{step.description}</StepDescription>
                )}
                {status === "error" && errorMessage && (
                  <ErrorMessage>{errorMessage}</ErrorMessage>
                )}
              </StepInfo>
            </StepItem>
          );
        })}
      </StepsList>
    </ProgressContainer>
  );
};

export default PublishProgress;

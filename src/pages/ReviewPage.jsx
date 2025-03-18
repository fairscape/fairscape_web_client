import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ReviewPage.css";

const ReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get the genomic data from location state
  const genomicData = location.state?.genomicData;

  if (!genomicData) {
    return (
      <div className="review-container">
        <div className="review-header">
          <h1>No Data to Review</h1>
        </div>
        <p>
          No genomic data was provided for review. Please go back and complete
          the form.
        </p>
        <div className="review-actions">
          <button className="back-button" onClick={() => navigate("/")}>
            Return to Form
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Here you would make an API call to submit the data
      // Example:
      // const response = await fetch('/api/genomic-data', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(genomicData)
      // });

      // if (!response.ok) {
      //   throw new Error(`Server responded with ${response.status}`);
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Data submitted successfully:", genomicData);
      setSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      setError(`Failed to submit data: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  // Render success message if submission was successful
  if (success) {
    return (
      <div className="review-container">
        <div className="success-message">
          <h2>Submission Successful!</h2>
          <p>Your genomic data has been successfully submitted.</p>
          <button
            className="new-submission-button"
            onClick={() => navigate("/")}
          >
            Create New Submission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-container">
      <div className="review-header">
        <h1>Review Your Submission</h1>
        <p>Please review your genomic data before final submission</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="review-sections">
        <div className="review-section">
          <h2>Project</h2>
          <div className="json-preview">
            <pre>{JSON.stringify(genomicData.project, null, 2)}</pre>
          </div>
        </div>

        <div className="review-section">
          <h2>Samples ({genomicData.samples.items.length})</h2>
          <div className="json-preview">
            <pre>{JSON.stringify(genomicData.samples, null, 2)}</pre>
          </div>
        </div>

        <div className="review-section">
          <h2>Experiments ({genomicData.experiments.items.length})</h2>
          <div className="json-preview">
            <pre>{JSON.stringify(genomicData.experiments, null, 2)}</pre>
          </div>
        </div>

        <div className="review-section">
          <h2>Outputs ({genomicData.outputs.items.length})</h2>
          <div className="json-preview">
            <pre>{JSON.stringify(genomicData.outputs, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="review-actions">
        <button
          className="back-button"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back to Edit
        </button>
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Confirm & Submit"}
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;

import React from "react";
import { Button, Card } from "react-bootstrap";

const steps = [
  {
    text: "Create an RO-Crate",
    action: { command: "1: Create" },
  },
  {
    text: "Add datasets or software to an RO-Crate",
    action: { command: "2: Add", subCommand: "add" },
  },
  {
    text: "Register a computation, dataset, or software",
    action: { command: "2: Add", subCommand: "register" },
  },
  {
    text: "Package an RO-Crate for upload",
    action: { command: "3: Package" },
  },
  {
    text: "Upload an RO-Crate",
    action: { command: "4: Upload" },
  },
];

function Questionnaire({ onStepSelect }) {
  return (
    <div className="questionnaire-container" style={{ padding: "20px" }}>
      <h2>What would you like to do?</h2>
      <p>Select the step you're currently at:</p>
      {steps.map((step, index) => (
        <Card key={index} style={{ marginBottom: "10px" }}>
          <Card.Body>
            <Card.Title>{`Step ${index + 1}: ${step.text}`}</Card.Title>
            <Button variant="primary" onClick={() => onStepSelect(step.action)}>
              Select this step
            </Button>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default Questionnaire;

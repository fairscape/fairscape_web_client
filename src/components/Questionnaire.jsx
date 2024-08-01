import React from "react";
import { Button, Card, Row, Col } from "react-bootstrap";

const steps = [
  {
    text: "Prep Folder for RO-Crate Initialization",
    description:
      "Copy all files you want included in the RO-Crate to the same directory before starting.",
    action: null,
  },
  {
    text: "Initialize an RO-Crate",
    action: {
      command: "1: Init",
      subCommand: "init",
    },
  },
  {
    text: "Register files in your RO-Crate",
    action: { command: "2: Register", subCommand: "dataset" },
  },
  {
    text: "Package an RO-Crate for upload",
    action: { command: "3: Package", subCommand: "zip" },
  },
  {
    text: "Upload an RO-Crate",
    action: {
      command: "4: Upload",
      subCommand: "rocrate",
    },
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
            <Row className="align-items-center">
              <Col xs={9}>
                <Card.Title
                  style={{ margin: 0 }}
                >{`Step ${index}: ${step.text}`}</Card.Title>
                {step.description && <Card.Text>{step.description}</Card.Text>}
              </Col>
              <Col xs={3} className="text-right">
                {step.action ? (
                  <Button
                    variant="primary"
                    onClick={() => onStepSelect(step.action)}
                  >
                    Select
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    Prep Step
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default Questionnaire;

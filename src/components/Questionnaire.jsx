import React from "react";
import { Button, Card, Row, Col } from "react-bootstrap";

const steps = [
  {
    text: "Create an RO-Crate",
    action: {
      command: "1: Create",
      subCommand: "create",
      subsubCommand: "create",
    },
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
    action: { command: "3: Package", subCommand: "zip", subsubCommand: "zip" },
  },
  {
    text: "Upload an RO-Crate",
    action: {
      command: "4: Upload",
      subCommand: "rocrate",
      subsubCommand: "rocrate",
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
                <Card.Title style={{ margin: 0 }}>{`Step ${index + 1}: ${
                  step.text
                }`}</Card.Title>
              </Col>
              <Col xs={3} className="text-right">
                <Button
                  variant="primary"
                  onClick={() => onStepSelect(step.action)}
                >
                  Select
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default Questionnaire;

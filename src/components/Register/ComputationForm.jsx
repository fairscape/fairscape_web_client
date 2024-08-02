import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Form, Button, ListGroup } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  register_computation,
  get_registered_files,
} from "../../rocrate/rocrate";

const StyledForm = styled(Form)`
  background-color: #282828;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 10px;
  text-align: center;
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 20px;
`;

const StyledLabel = styled(Form.Label)`
  color: #ffffff;
  font-weight: bold;
`;

const StyledInput = styled(Form.Control)`
  background-color: #3e3e3e;
  border: 1px solid #555;
  color: #ffffff;
  &:focus {
    background-color: #3e3e3e;
    color: #ffffff;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const StyledTextArea = styled(StyledInput)`
  resize: vertical;
  min-height: 100px;
  width: 100%;
  padding: 5px;
`;

const StyledButton = styled(Button)`
  background-color: #007bff;
  margin-top: 10px;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
  margin-right: 10px;
`;

const StyledListGroup = styled(ListGroup)`
  background-color: #3e3e3e;
  height: 300px;
  overflow-y: auto;
  border: 1px solid #555;
  border-radius: 4px;
`;

const StyledListItem = styled(ListGroup.Item)`
  background-color: #3e3e3e;
  color: #ffffff;
  border-color: #555;
  &:hover {
    background-color: #4e4e4e;
  }
`;

const ColumnHeader = styled.h4`
  color: #ffffff;
  margin-bottom: 10px;
`;

function ComputationForm({ rocratePath, onComplete, onSkip }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    "date-created": "",
    "run-by": "",
    description: "",
    keywords: "",
  });
  const [fileColumns, setFileColumns] = useState({
    allFiles: [],
    inputs: [],
    outputs: [],
    software: [],
  });

  useEffect(() => {
    const loadRegisteredFiles = async () => {
      const files = await get_registered_files(rocratePath);
      setFileColumns((prevState) => ({
        ...prevState,
        allFiles: files,
      }));
    };
    loadRegisteredFiles();
  }, [rocratePath]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = fileColumns[source.droppableId];
    const destColumn = fileColumns[destination.droppableId];

    if (source.droppableId === destination.droppableId) {
      const newColumn = Array.from(sourceColumn);
      const [reorderedItem] = newColumn.splice(source.index, 1);
      newColumn.splice(destination.index, 0, reorderedItem);

      setFileColumns({
        ...fileColumns,
        [source.droppableId]: newColumn,
      });
    } else {
      const sourceItems = Array.from(sourceColumn);
      const destItems = Array.from(destColumn);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      setFileColumns({
        ...fileColumns,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });
    }
  };

  const handleSubmit = () => {
    const options = {
      ...formData,
      guid: `computation-${formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`,
      command: "", // You might want to add this to the form if needed
      "used-software": fileColumns.software.map((file) => file.guid),
      "used-dataset": fileColumns.inputs.map((file) => file.guid),
      generated: fileColumns.outputs.map((file) => file.guid),
    };

    console.log("used-software:", options["used-software"]);
    console.log("used-dataset:", options["used-dataset"]);
    console.log("generated:", options.generated);

    const result = register_computation(
      rocratePath,
      options.name,
      options["run-by"],
      options["date-created"],
      options.description,
      options.keywords,
      options.guid,
      options.command,
      options["used-software"],
      options["used-dataset"],
      options.generated
    );

    console.log(result);
    // Reset form and file columns
    setFormData({
      name: "",
      "date-created": "",
      "run-by": "",
      description: "",
      keywords: "",
    });
    setFileColumns((prevState) => ({
      ...prevState,
      inputs: [],
      outputs: [],
      software: [],
    }));
    setShowForm(false);
    onComplete();
  };

  const renderColumn = (columnId, columnName) => (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div>
          <ColumnHeader>{columnName}</ColumnHeader>
          <StyledListGroup {...provided.droppableProps} ref={provided.innerRef}>
            {fileColumns[columnId].map((file, index) => (
              <Draggable key={file.guid} draggableId={file.guid} index={index}>
                {(provided) => (
                  <StyledListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {file.name}
                  </StyledListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledListGroup>
        </div>
      )}
    </Droppable>
  );

  if (!showForm) {
    return (
      <StyledForm>
        <FormTitle>Record Computations</FormTitle>
        <p style={{ color: "#ffffff" }}>
          Would you like to record any computations that were run to create the
          files?
        </p>
        <StyledButton onClick={() => setShowForm(true)}>Yes</StyledButton>
        <StyledButton onClick={onSkip} variant="secondary">
          No
        </StyledButton>
      </StyledForm>
    );
  }

  return (
    <StyledForm>
      <FormTitle>Record Computation</FormTitle>

      <StyledFormGroup>
        <StyledLabel>Computation Name</StyledLabel>
        <StyledInput
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </StyledFormGroup>

      <StyledFormGroup>
        <StyledLabel>Date Created</StyledLabel>
        <StyledInput
          type="date"
          name="date-created"
          value={formData["date-created"]}
          onChange={handleInputChange}
          required
        />
      </StyledFormGroup>

      <StyledFormGroup>
        <StyledLabel>Run By</StyledLabel>
        <StyledInput
          type="text"
          name="run-by"
          value={formData["run-by"]}
          onChange={handleInputChange}
          placeholder="Last, First"
          required
        />
      </StyledFormGroup>

      <StyledFormGroup>
        <StyledLabel>Description</StyledLabel>
        <StyledTextArea
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </StyledFormGroup>

      <StyledFormGroup>
        <StyledLabel>Keywords</StyledLabel>
        <StyledInput
          type="text"
          name="keywords"
          value={formData.keywords}
          onChange={handleInputChange}
          placeholder="python, machine learning, genetics"
          required
        />
      </StyledFormGroup>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="row">
          <div className="col-md-3">
            {renderColumn("allFiles", "All Files")}
          </div>
          <div className="col-md-3">{renderColumn("inputs", "Inputs")}</div>
          <div className="col-md-3">{renderColumn("outputs", "Outputs")}</div>
          <div className="col-md-3">
            {renderColumn("software", "Software Used")}
          </div>
        </div>
      </DragDropContext>

      <StyledButton onClick={handleSubmit}>Register Computation</StyledButton>
      <StyledButton onClick={onSkip} variant="secondary">
        Cancel
      </StyledButton>
    </StyledForm>
  );
}

export default ComputationForm;

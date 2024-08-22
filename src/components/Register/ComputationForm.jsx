import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  register_computation,
  get_registered_files,
} from "../../rocrate/rocrate";
import {
  StyledForm,
  FormTitle,
  StyledButton,
  FormField,
  TextAreaField,
  JsonLdPreview,
  StyledListGroup,
  StyledListItem,
  ColumnHeader,
} from "./SharedComponents";

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
  const [jsonLdPreview, setJsonLdPreview] = useState({});

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

  useEffect(() => {
    updateJsonLdPreview();
  }, [formData, fileColumns]);

  const handleChange = (e) => {
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

  const updateJsonLdPreview = () => {
    const guid = `computation-${formData.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}`;
    const preview = {
      "@context": {
        "@vocab": "https://schema.org/",
        EVI: "https://w3id.org/EVI#",
      },
      "@id": guid,
      "@type": "https://w3id.org/EVI#Computation",
      name: formData.name,
      description: formData.description,
      keywords: formData.keywords.split(",").map((k) => k.trim()),
      runBy: formData["run-by"],
      dateCreated: formData["date-created"],
      usedSoftware: fileColumns.software.map((file) => file.guid),
      usedDataset: fileColumns.inputs.map((file) => file.guid),
      generated: fileColumns.outputs.map((file) => file.guid),
    };
    setJsonLdPreview(preview);
  };

  const handleSubmit = () => {
    const options = {
      ...formData,
      guid: `computation-${formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`,
      command: "",
      "used-software": fileColumns.software.map((file) => file.guid),
      "used-dataset": fileColumns.inputs.map((file) => file.guid),
      generated: fileColumns.outputs.map((file) => file.guid),
    };

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
      <Row>
        <Col md={8}>
          <Row>
            <Col md={6}>
              <FormField
                label="Computation Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormField
                label="Date Created"
                name="date-created"
                value={formData["date-created"]}
                onChange={handleChange}
                type="date"
                required
              />
              <FormField
                label="Run By"
                name="run-by"
                value={formData["run-by"]}
                onChange={handleChange}
                placeholder="First Last, First Last..."
                required
              />
              <FormField
                label="Keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="python, machine learning, genetics"
                required
              />
            </Col>
            <Col md={6}>
              <TextAreaField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>
        </Col>
        <Col md={4}>
          <JsonLdPreview jsonLdData={jsonLdPreview} />
        </Col>
      </Row>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Row>
          <Col md={3}>{renderColumn("allFiles", "All Available Objects")}</Col>
          <Col md={3}>{renderColumn("inputs", "Input Datasets")}</Col>
          <Col md={3}>{renderColumn("outputs", "Output Datasets")}</Col>
          <Col md={3}>{renderColumn("software", "Software Used")}</Col>
        </Row>
      </DragDropContext>

      <StyledButton onClick={handleSubmit}>Register Computation</StyledButton>
      <StyledButton onClick={onSkip} variant="secondary">
        Cancel
      </StyledButton>
    </StyledForm>
  );
}

export default ComputationForm;

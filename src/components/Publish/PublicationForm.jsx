import React from "react";
import FormField from "./FormField";
import { StyledForm, FormTitle, Button } from "./PublishStyles";

const PublicationForm = ({ formData, onInputChange, onSubmit, publishing }) => (
  <div className="space-y-6">
    <FormField
      label="Title"
      name="name"
      value={formData.name}
      onChange={onInputChange}
      placeholder="Enter title"
    />

    <FormField
      label="Authors"
      name="author"
      value={formData.author}
      onChange={onInputChange}
      placeholder="1st Author First Last, 2nd Author First Last, ..."
    />

    <FormField
      label="Description"
      type="textarea"
      name="description"
      value={formData.description}
      onChange={onInputChange}
      placeholder="Enter description"
    />

    <FormField
      label="Keywords"
      name="keywords"
      value={formData.keywords}
      onChange={onInputChange}
      placeholder="genetics, vital signs, heart rate"
    />

    <FormField
      label="Publication Date"
      type="date"
      name="datePublished"
      value={formData.datePublished}
      onChange={onInputChange}
    />

    <div className="flex gap-4 mt-8">
      <Button type="submit" disabled={publishing}>
        {publishing ? "Publishing..." : "Publish to Dataverse"}
      </Button>
    </div>
  </div>
);

export default PublicationForm;

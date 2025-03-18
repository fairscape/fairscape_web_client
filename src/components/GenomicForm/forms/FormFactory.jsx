import React from "react";
import SimpleForm from "./SimpleForm";
import ListForm from "./ListForm";

// FormFactory determines which form component to use based on the schema
const FormFactory = ({ schema, data, updateData }) => {
  // Check if this is a list form (has items array and possibly common fields)
  const isListForm =
    schema.properties.items && schema.properties.items.type === "array";

  if (isListForm) {
    return <ListForm schema={schema} data={data} updateData={updateData} />;
  } else {
    return <SimpleForm schema={schema} data={data} updateData={updateData} />;
  }
};

export default FormFactory;

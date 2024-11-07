import React from "react";
import { Label, Input, TextArea, FormGroup } from "./PublishStyles";

const FormField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = true,
  placeholder = "",
}) => {
  const inputProps = {
    name,
    value,
    onChange,
    required,
    id: name,
    placeholder,
  };

  return (
    <FormGroup>
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      {type === "textarea" ? (
        <TextArea {...inputProps} />
      ) : (
        <Input type={type} {...inputProps} />
      )}
    </FormGroup>
  );
};

export default FormField;

import React from "react";
import { Form, Col, Row } from "react-bootstrap";
import {
  FormRow,
  FormLabel,
  FormValue,
  StyledFormControl,
} from "./SharedComponents"; // Import styled components

interface KeywordsFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  name: string;
  value?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const KeywordsField: React.FC<KeywordsFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  ...props
}) => {
  return (
    <FormRow
      controlId={`form-${name}`}
      style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}
    >
      <FormLabel>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </FormLabel>
      <FormValue>
        <StyledFormControl
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
        <Form.Text
          className="text-muted"
          style={{ display: "block", marginTop: "5px" }}
        >
          Enter keywords separated by commas.
        </Form.Text>
      </FormValue>
    </FormRow>
  );
};

export default KeywordsField;

import React, { useState, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import {
  FormSection,
  FormSectionTitle,
  StyledButton,
  FormField,
  TextAreaField,
  JsonLdPreview,
  ButtonContainer,
} from "./SharedComponents";

// Interface matching CLI options more closely
interface CrateMetadata {
  name: string;
  description: string;
  organizationName: string;
  projectName: string;
  keywords: string; // Comma-separated string from form input
  license: string;
  author: string;
  version: string;
  datePublished?: string; // Optional
  associatedPublication?: string; // Optional
  conditionsOfAccess?: string; // Optional
  copyrightNotice?: string; // Optional
  // Custom properties could be added here, perhaps as a JSON string input later
  [key: string]: unknown; // Allow extra properties if needed
}

interface CrateMetadataFormProps {
  initialData?: Partial<CrateMetadata>;
  onSave: (data: CrateMetadata) => void;
}

const CrateMetadataForm: React.FC<CrateMetadataFormProps> = ({
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<CrateMetadata>({
    name: "",
    description: "",
    organizationName: "",
    projectName: "",
    keywords: "", // Start empty
    license: "https://creativecommons.org/licenses/by/4.0/", // Default
    author: "",
    version: "1.0", // Default
    datePublished: new Date().toISOString().split("T")[0], // Default to today
    associatedPublication: "",
    conditionsOfAccess: "",
    copyrightNotice: "",
    ...initialData, // Apply initial data if provided
  });

  const [jsonLdPreview, setJsonLdPreview] = useState<Record<string, any>>({});

  // Update JSON-LD preview whenever form data changes
  useEffect(() => {
    const preview: Record<string, any> = {
      "@id": "./", // RO-Crate root identifier
      "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"],
      name: formData.name || "(Not specified)",
      description: formData.description || "(Not specified)",
      keywords: formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean), // Split and clean keywords
      license: formData.license ? { "@id": formData.license } : undefined,
      author: formData.author ? { name: formData.author } : undefined,
      version: formData.version || undefined,
      publisher: formData.organizationName
        ? { "@type": "Organization", name: formData.organizationName }
        : undefined,
      isPartOf: formData.projectName
        ? [{ "@type": "CreativeWork", name: formData.projectName }]
        : [],
      datePublished: formData.datePublished || undefined,
      associatedPublication: formData.associatedPublication || undefined,
      conditionsOfAccess: formData.conditionsOfAccess || undefined,
      copyrightHolder: formData.copyrightNotice
        ? { name: formData.copyrightNotice }
        : undefined, // Using copyrightHolder for notice
      hasPart: [], // Will be populated later
    };
    // Remove undefined properties for cleaner preview
    Object.keys(preview).forEach(
      (key) => preview[key] === undefined && delete preview[key]
    );
    if (preview.keywords && preview.keywords.length === 0)
      delete preview.keywords;
    if (preview.isPartOf && preview.isPartOf.length === 0)
      delete preview.isPartOf;

    setJsonLdPreview(preview);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Basic validation for required fields
    if (
      !formData.name ||
      !formData.organizationName ||
      !formData.projectName ||
      !formData.author ||
      !formData.description || // Added description as required based on CLI
      !formData.keywords // Added keywords as required based on CLI
    ) {
      alert(
        "Please fill in all required fields: Crate Name, Description, Organization, Project, Author, and Keywords."
      );
      return;
    }
    onSave(formData);
  };

  return (
    <FormSection as={Form} onSubmit={handleSubmit}>
      <FormSectionTitle>RO-Crate Root Metadata</FormSectionTitle>
      <Row>
        {/* Left Column for Form Fields */}
        <Col md={8}>
          <FormField
            label="Crate Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., My Research Project Crate"
            required
          />
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A brief description of the research object crate"
            required
          />
          <FormField
            label="Organization Name"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="e.g., University of Example"
            required
          />
          <FormField
            label="Project Name"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="e.g., Cancer Genomics Study"
            required
          />
          <FormField
            label="Author(s)"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="e.g., Jane Doe (ORCID or Name)"
            required
          />
          <FormField
            label="Keywords (comma-separated)"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="e.g., genomics, analysis, dataset"
            required
          />
          <FormField
            label="License URL"
            name="license"
            value={formData.license}
            onChange={handleChange}
            required
          />
          <FormField
            label="Version"
            name="version"
            value={formData.version}
            onChange={handleChange}
            required
          />
          <FormField
            label="Date Published"
            name="datePublished"
            type="date" // Use date input type
            value={formData.datePublished}
            onChange={handleChange}
            required={false} // Optional based on CLI
          />
          <FormField
            label="Associated Publication (URL/ID)"
            name="associatedPublication"
            value={formData.associatedPublication}
            onChange={handleChange}
            required={false} // Optional based on CLI
          />
          <FormField
            label="Conditions of Access"
            name="conditionsOfAccess"
            value={formData.conditionsOfAccess}
            onChange={handleChange}
            required={false} // Optional based on CLI
          />
          <FormField
            label="Copyright Notice/Holder"
            name="copyrightNotice"
            value={formData.copyrightNotice}
            onChange={handleChange}
            required={false} // Optional based on CLI
          />
        </Col>
        {/* Right Column for JSON-LD Preview */}
        <Col md={4}>
          <JsonLdPreview jsonLdData={jsonLdPreview} />
        </Col>
      </Row>
      <ButtonContainer>
        <StyledButton type="submit">Save Crate Metadata</StyledButton>
      </ButtonContainer>
    </FormSection>
  );
};

export default CrateMetadataForm;

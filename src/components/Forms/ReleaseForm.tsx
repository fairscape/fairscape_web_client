import React, { useState, useRef } from "react";
import styled from "styled-components";
import { FiDownload, FiEye, FiEyeOff } from "react-icons/fi";

const FormContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const SummarySection = styled.div`
  background-color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SummaryRow = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SummaryLabel = styled.div`
  width: 220px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const SummaryValue = styled.div`
  flex: 1;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px solid #3e7aa8;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f8fcff;

  &::placeholder {
    color: #789ab0;
    font-style: italic;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(30, 100, 150, 0.2);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 2px solid #3e7aa8;
  border-radius: 4px;
  min-height: 100px;
  font-size: 14px;
  background-color: #f8fcff;

  &::placeholder {
    color: #789ab0;
    font-style: italic;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(30, 100, 150, 0.2);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 40px;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #1e64a6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #13517a;
  }
`;

const PreviewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4a566e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #394053;
  }
`;

const SectionHeader = styled.div`
  margin: 25px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #3e7aa8;
  color: ${({ theme }) => theme.colors.primary};
`;

const SectionHeaderTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 0;
`;

const PreviewContainer = styled.div`
  margin-top: 30px;
  border-top: 2px solid #3e7aa8;
  padding-top: 20px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
`;

const PreviewTitle = styled.h2`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 20px;
`;

const PreviewSection = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const PreviewSectionTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 15px;
`;

const PreviewRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
`;

const PreviewLabel = styled.div`
  width: 220px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const PreviewValue = styled.div`
  flex: 1;
`;

const ReleaseForm = () => {
  // Use refs for form inputs instead of controlled components
  const formRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});

  const placeholders = {
    name: "Cell Maps for Artificial Intelligence - Data Release",
    description:
      "This dataset is a Data Release of Cell Maps for Artificial Intelligence (CM4AI)...",
    id_value: "ark:59852/your-dataset-id",
    principal_investigator: "Enter PI name",
    contact_email: "contact@example.org",
    version: "1.0",
    release_date: "YYYY-MM-DD",
    content_size: "e.g., 12.53 GB",
    license_value: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    confidentiality_level: "e.g., HL7 Unrestricted",
    human_subject: "Yes/No",
    intended_uses:
      "AI-ready datasets to support research in functional genomics...",
    prohibited_uses:
      "These laboratory data are not to be used in clinical decision-making...",
    maintenance_plan: "Dataset will be regularly updated and augmented...",
    limitations: "This is an interim release. It does not contain...",
  };

  const togglePreview = () => {
    if (!showPreview) {
      // Update preview data when showing preview
      const formData = new FormData(formRef.current);
      const data = {};

      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      setPreviewData(data);
    }

    setShowPreview(!showPreview);
  };

  const generateJson = () => {
    const formData = new FormData(formRef.current);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Default values for empty fields
    const defaults = {
      id_value: data.id_value || "ark:59852/cm4ai-dataset-" + Date.now(),
      license_value:
        data.license_value ||
        "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      human_subject: data.human_subject || "No",
    };

    const finalData = {
      ...defaults,
      ...Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== "")
      ),
    };

    const json = {
      "@context": {
        "@vocab": "https://schema.org/",
        EVI: "https://w3id.org/EVI#",
      },
      "@graph": [
        {
          "@id": "ro-crate-metadata.json",
          "@type": "CreativeWork",
          conformsTo: {
            "@id": "https://w3id.org/ro/crate/1.2-DRAFT",
          },
          about: {
            "@id": finalData.id_value,
          },
        },
        {
          "@id": finalData.id_value,
          "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"],
          name: finalData.name,
          description: finalData.description,
          version: finalData.version,
          license: finalData.license_value,
          datePublished: finalData.release_date,
          contentSize: finalData.content_size,
          principalInvestigator: finalData.principal_investigator,
          contactEmail: finalData.contact_email,
          confidentialityLevel: finalData.confidentiality_level,
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Intended Use",
              value: finalData.intended_uses,
            },
            {
              "@type": "PropertyValue",
              name: "Prohibited Uses",
              value: finalData.prohibited_uses,
            },
            {
              "@type": "PropertyValue",
              name: "Maintenance Plan",
              value: finalData.maintenance_plan,
            },
            {
              "@type": "PropertyValue",
              name: "Limitations",
              value: finalData.limitations,
            },
            {
              "@type": "PropertyValue",
              name: "Human Subject",
              value: finalData.human_subject,
            },
          ],
        },
      ],
    };

    return JSON.stringify(json, null, 2);
  };

  const downloadJson = () => {
    const json = generateJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ro-crate-metadata.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const InputField = ({ label, field, placeholder, multiline = false }) => (
    <SummaryRow>
      <SummaryLabel>{label}</SummaryLabel>
      <SummaryValue>
        {multiline ? (
          <StyledTextarea
            name={field}
            defaultValue=""
            placeholder={placeholder}
          />
        ) : (
          <StyledInput
            type="text"
            name={field}
            defaultValue=""
            placeholder={placeholder}
          />
        )}
      </SummaryValue>
    </SummaryRow>
  );

  const PreviewField = ({ label, value, placeholder }) => (
    <PreviewRow>
      <PreviewLabel>{label}</PreviewLabel>
      <PreviewValue>{value || placeholder}</PreviewValue>
    </PreviewRow>
  );

  return (
    <FormContainer>
      <form ref={formRef}>
        <SummarySection>
          <SectionTitle>Overview</SectionTitle>

          <InputField
            label="Dataset Name"
            field="name"
            placeholder={placeholders.name}
          />

          <InputField
            label="Description"
            field="description"
            placeholder={placeholders.description}
            multiline={true}
          />

          <InputField
            label="ROCrate ID"
            field="id_value"
            placeholder={placeholders.id_value}
          />

          <InputField
            label="Principal Investigator"
            field="principal_investigator"
            placeholder={placeholders.principal_investigator}
          />

          <InputField
            label="Contact Email"
            field="contact_email"
            placeholder={placeholders.contact_email}
          />

          <InputField
            label="Version"
            field="version"
            placeholder={placeholders.version}
          />

          <InputField
            label="Release Date"
            field="release_date"
            placeholder={placeholders.release_date}
          />

          <InputField
            label="Size"
            field="content_size"
            placeholder={placeholders.content_size}
          />

          <InputField
            label="License"
            field="license_value"
            placeholder={placeholders.license_value}
          />

          <InputField
            label="Confidentiality Level"
            field="confidentiality_level"
            placeholder={placeholders.confidentiality_level}
          />

          <InputField
            label="Human Subject Data"
            field="human_subject"
            placeholder={placeholders.human_subject}
          />
        </SummarySection>

        <SectionHeader>
          <SectionHeaderTitle>Use Cases and Limitations</SectionHeaderTitle>
        </SectionHeader>

        <SummarySection>
          <InputField
            label="Intended Uses"
            field="intended_uses"
            placeholder={placeholders.intended_uses}
            multiline={true}
          />

          <InputField
            label="Prohibited Uses"
            field="prohibited_uses"
            placeholder={placeholders.prohibited_uses}
            multiline={true}
          />

          <InputField
            label="Maintenance Plan"
            field="maintenance_plan"
            placeholder={placeholders.maintenance_plan}
            multiline={true}
          />

          <InputField
            label="Limitations"
            field="limitations"
            placeholder={placeholders.limitations}
            multiline={true}
          />
        </SummarySection>
      </form>

      <ButtonContainer>
        <PreviewButton onClick={togglePreview}>
          {showPreview ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </PreviewButton>

        <DownloadButton onClick={downloadJson}>
          <FiDownload size={20} />
          Download Metadata JSON
        </DownloadButton>
      </ButtonContainer>

      {showPreview && (
        <PreviewContainer>
          <PreviewTitle>Preview</PreviewTitle>

          <PreviewSection>
            <PreviewSectionTitle>Overview</PreviewSectionTitle>

            <PreviewField
              label="Dataset Name"
              value={previewData.name}
              placeholder={placeholders.name}
            />

            <PreviewField
              label="Description"
              value={previewData.description}
              placeholder={placeholders.description}
            />

            <PreviewField
              label="ROCrate ID"
              value={previewData.id_value}
              placeholder={placeholders.id_value}
            />

            <PreviewField
              label="Principal Investigator"
              value={previewData.principal_investigator}
              placeholder={placeholders.principal_investigator}
            />

            <PreviewField
              label="Contact Email"
              value={previewData.contact_email}
              placeholder={placeholders.contact_email}
            />

            <PreviewField
              label="Version"
              value={previewData.version}
              placeholder={placeholders.version}
            />

            <PreviewField
              label="Release Date"
              value={previewData.release_date}
              placeholder={placeholders.release_date}
            />

            <PreviewField
              label="Size"
              value={previewData.content_size}
              placeholder={placeholders.content_size}
            />

            <PreviewField
              label="License"
              value={previewData.license_value}
              placeholder={placeholders.license_value}
            />

            <PreviewField
              label="Confidentiality Level"
              value={previewData.confidentiality_level}
              placeholder={placeholders.confidentiality_level}
            />

            <PreviewField
              label="Human Subject Data"
              value={previewData.human_subject}
              placeholder={placeholders.human_subject}
            />
          </PreviewSection>

          <SectionHeader>
            <SectionHeaderTitle>Use Cases and Limitations</SectionHeaderTitle>
          </SectionHeader>

          <PreviewSection>
            <PreviewField
              label="Intended Uses"
              value={previewData.intended_uses}
              placeholder={placeholders.intended_uses}
            />

            <PreviewField
              label="Prohibited Uses"
              value={previewData.prohibited_uses}
              placeholder={placeholders.prohibited_uses}
            />

            <PreviewField
              label="Maintenance Plan"
              value={previewData.maintenance_plan}
              placeholder={placeholders.maintenance_plan}
            />

            <PreviewField
              label="Limitations"
              value={previewData.limitations}
              placeholder={placeholders.limitations}
            />
          </PreviewSection>
        </PreviewContainer>
      )}
    </FormContainer>
  );
};

export default ReleaseForm;

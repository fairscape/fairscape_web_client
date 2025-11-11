import React, { useState } from "react";
import { IssueFormData } from "../types/issue.types";
import { ALLOWED_PROJECTS } from "../utils/constants";
import { useFileUpload } from "../hooks/useFileUpload";
import { CreateInfoBanner } from "../components/InfoBanner";
import { FileUploadSection } from "../components/FileUploadSection";
import {
  FormField,
  URLFieldExpandedHelp,
  InstructionsFieldExpandedHelp,
} from "../components/FormField";
import {
  PageHeader,
  BackButton,
  Title,
  Subtitle,
  Section,
  FormGroup,
  LabelRow,
  Label,
  Select,
  ButtonGroup,
  CancelButton,
  SubmitButton,
} from "../styles/D4DAssistant.styles";

interface CreateIssueViewProps {
  onBack: () => void;
  onSubmit: (formData: IssueFormData) => Promise<void>;
  loading: boolean;
}

export const CreateIssueView: React.FC<CreateIssueViewProps> = ({
  onBack,
  onSubmit,
  loading,
}) => {
  const { files, handleFileSelect } = useFileUpload();
  const [project, setProject] = useState("");
  const [urls, setUrls] = useState("");
  const [instructions, setInstructions] = useState("");

  const [expandedHelp, setExpandedHelp] = useState({
    files: false,
    urls: false,
    instructions: false,
  });

  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp({ ...expandedHelp, [section]: !expandedHelp[section] });
  };

  const handleSubmit = async () => {
    await onSubmit({ project, urls, instructions, files });
  };

  return (
    <>
      <PageHeader>
        <BackButton onClick={onBack}>← Back</BackButton>
        <Title>Create New D4D</Title>
        <Subtitle>Work with an AI assistant to create your datasheet</Subtitle>
      </PageHeader>

      <CreateInfoBanner />

      <Section>
        <FormGroup>
          <LabelRow>
            <Label>Project *</Label>
          </LabelRow>
          <Select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="">-- Select a project --</option>
            {ALLOWED_PROJECTS.map((proj) => (
              <option key={proj} value={proj}>
                {proj.toUpperCase()}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FileUploadSection
          files={files}
          onFileSelect={handleFileSelect}
          expanded={expandedHelp.files}
          onToggleHelp={() => toggleHelp("files")}
        />

        <FormField
          label="Documentation URLs"
          value={urls}
          onChange={setUrls}
          rows={5}
          placeholder="https://example.com/dataset&#10;https://doi.org/10.1234/example&#10;https://github.com/org/dataset-repo"
          helpText="Provide URLs to dataset documentation, papers, or repositories. One URL per line."
          expanded={expandedHelp.urls}
          onToggleHelp={() => toggleHelp("urls")}
          expandedContent={<URLFieldExpandedHelp />}
        />

        <FormField
          label="Instructions for AI Assistant (Optional)"
          value={instructions}
          onChange={setInstructions}
          rows={8}
          placeholder="Example: Look in the Smith2024.pdf file for data collection methods (pages 3-5). The ethical considerations are described in the IRB approval document. Please emphasize the use cases for clinical research and include the limitations discussed in section 4."
          helpText="Tell the AI where to find specific information or what to emphasize. The more specific you are, the better the results."
          expanded={expandedHelp.instructions}
          onToggleHelp={() => toggleHelp("instructions")}
          expandedContent={<InstructionsFieldExpandedHelp />}
        />

        <ButtonGroup>
          <CancelButton onClick={onBack}>Cancel</CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create D4D Issue"}
          </SubmitButton>
        </ButtonGroup>
      </Section>
    </>
  );
};

import React from "react";
import { FiInfo } from "react-icons/fi";
import {
  FormGroup,
  LabelRow,
  Label,
  InfoIcon,
  HelpText,
  Textarea,
  ExpandedHelp,
  ExpandedHelpTitle,
  ExpandedHelpText,
  ExpandedHelpList,
  ExpandedHelpExample,
} from "../styles/D4DAssistant.styles";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  helpText?: string;
  expanded?: boolean;
  onToggleHelp?: () => void;
  expandedContent?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  helpText,
  expanded,
  onToggleHelp,
  expandedContent,
}) => {
  return (
    <FormGroup>
      <LabelRow>
        <Label>{label}</Label>
        {onToggleHelp && (
          <InfoIcon onClick={onToggleHelp}>
            <FiInfo size={18} />
          </InfoIcon>
        )}
      </LabelRow>

      {helpText && <HelpText dangerouslySetInnerHTML={{ __html: helpText }} />}

      {expanded && expandedContent}

      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormGroup>
  );
};

export const URLFieldExpandedHelp = () => (
  <ExpandedHelp>
    <ExpandedHelpTitle>What URLs are helpful?</ExpandedHelpTitle>
    <ExpandedHelpList>
      <li>
        <strong>Dataset landing pages</strong> (e.g., Dataverse, Zenodo,
        institutional repositories)
      </li>
      <li>
        <strong>Published papers</strong> (DOI links, PubMed, bioRxiv)
      </li>
      <li>
        <strong>GitHub repositories</strong> with README files or documentation
      </li>
      <li>
        <strong>Project websites</strong> with dataset descriptions
      </li>
      <li>
        <strong>API documentation</strong> or data dictionaries
      </li>
      <li>
        <strong>Protocol registries</strong> (e.g., protocols.io)
      </li>
    </ExpandedHelpList>
    <ExpandedHelpExample>
      <strong>Example:</strong>
      <br />
      https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/ABC123
      <br />
      https://doi.org/10.1101/2024.01.15.123456
      <br />
      https://github.com/yourorg/dataset-repo
    </ExpandedHelpExample>
  </ExpandedHelp>
);

export const InstructionsFieldExpandedHelp = () => (
  <ExpandedHelp>
    <ExpandedHelpTitle>How to write effective instructions</ExpandedHelpTitle>
    <ExpandedHelpText>
      Use this field to guide the AI through your materials. Be specific about:
    </ExpandedHelpText>
    <ExpandedHelpList>
      <li>
        <strong>Where to find information:</strong> "Look in Smith2024.pdf pages
        3-5 for data collection methods"
      </li>
      <li>
        <strong>What documents contain:</strong> "The ethical considerations are
        in the IRB approval document"
      </li>
      <li>
        <strong>What to emphasize:</strong> "Please emphasize the use cases for
        clinical research"
      </li>
      <li>
        <strong>Specific sections:</strong> "Include the limitations discussed
        in section 4 of the paper"
      </li>
      <li>
        <strong>Tables or figures:</strong> "Sample demographics are in Table 2
        of methods.pdf"
      </li>
      <li>
        <strong>Text you want included:</strong> "Use the abstract from the main
        paper as the dataset description"
      </li>
    </ExpandedHelpList>
    <ExpandedHelpTitle>Example instructions</ExpandedHelpTitle>
    <ExpandedHelpExample>
      "Please pull information from the publications list at
      https://cm4ai.org/publications/. Download the papers you think are most
      relevant for understanding data collection methods, use cases, and ethical
      considerations. Pay special attention to the main consortium paper (Clark
      et al.) for overall dataset description. The IRB approval details are in
      ethics_review.pdf section 3."
    </ExpandedHelpExample>
  </ExpandedHelp>
);

import React, { useRef } from "react";
import { FiUpload, FiFile, FiInfo } from "react-icons/fi";
import {
  FormGroup,
  LabelRow,
  Label,
  InfoIcon,
  HelpText,
  FileInputWrapper,
  HiddenInput,
  UploadButton,
  FilesList,
  FileItem,
  FileName,
  FileSize,
  ExpandedHelp,
  ExpandedHelpTitle,
  ExpandedHelpList,
  ExpandedHelpText,
  ExpandedHelpExample,
} from "../styles/D4DAssistant.styles";

interface FileUploadSectionProps {
  files: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  expanded: boolean;
  onToggleHelp: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  onFileSelect,
  expanded,
  onToggleHelp,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <FormGroup>
      <LabelRow>
        <Label>Upload Documentation (PDFs, HTML)</Label>
        <InfoIcon
          title="Upload any PUBLIC documents that describe your dataset"
          onClick={onToggleHelp}
        >
          <FiInfo size={18} />
        </InfoIcon>
      </LabelRow>

      <HelpText>
        Upload any <strong>PUBLIC documents</strong> that describe your dataset.
        The AI will extract metadata from these files.
      </HelpText>

      {expanded && (
        <ExpandedHelp>
          <ExpandedHelpTitle>
            What types of documents should you upload?
          </ExpandedHelpTitle>
          <ExpandedHelpList>
            <li>
              <strong>Research papers</strong> describing data collection
              methods and analysis
            </li>
            <li>
              <strong>Ethical review documents</strong> (IRB approvals, ethics
              protocols)
            </li>
            <li>
              <strong>Data use agreements</strong> or data sharing policies
            </li>
            <li>
              <strong>Grant proposals</strong> or funding documents with dataset
              descriptions
            </li>
            <li>
              <strong>Protocol documents</strong> detailing data collection
              procedures
            </li>
            <li>
              <strong>Technical documentation</strong> about data formats,
              schemas, or APIs
            </li>
          </ExpandedHelpList>
          <ExpandedHelpTitle>What will the AI extract?</ExpandedHelpTitle>
          <ExpandedHelpText>
            The AI analyzes these documents to identify:
          </ExpandedHelpText>
          <ExpandedHelpList>
            <li>Data collection methods and procedures</li>
            <li>Ethical considerations and IRB approvals</li>
            <li>Dataset composition and size</li>
            <li>Intended use cases and limitations</li>
            <li>Data formats and access information</li>
            <li>Citation information and contributors</li>
          </ExpandedHelpList>
          <ExpandedHelpExample>
            <strong>Example files:</strong> research_protocol.pdf,
            irb_approval.pdf, data_collection_methods.pdf,
            Smith2024_dataset_paper.pdf
          </ExpandedHelpExample>
        </ExpandedHelp>
      )}

      <FileInputWrapper>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept=".pdf,.html,.htm"
          multiple
          onChange={onFileSelect}
        />
        <UploadButton onClick={() => fileInputRef.current?.click()}>
          <FiUpload size={20} />
          Select Files
        </UploadButton>
      </FileInputWrapper>

      {files.length > 0 && (
        <FilesList>
          {files.map((file, idx) => (
            <FileItem key={idx}>
              <FiFile />
              <FileName>{file.name}</FileName>
              <FileSize>{(file.size / 1024 / 1024).toFixed(2)} MB</FileSize>
            </FileItem>
          ))}
        </FilesList>
      )}
    </FormGroup>
  );
};

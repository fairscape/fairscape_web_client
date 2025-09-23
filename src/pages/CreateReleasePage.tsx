import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  FiDownload,
  FiUpload,
  FiChevronRight,
  FiChevronDown,
  FiFile,
  FiChevronLeft,
  FiInfo,
} from "react-icons/fi";
import releaseFormConfig from "../components/Forms/config/releaseFormConfig.json";
import {
  PageContainer,
  Card,
  StyledButton,
  FormField,
  TextAreaField,
} from "../components/Forms/ReleaseComponents";
import {
  parseRoCrateMetadata,
  generateReleaseJson,
  mockLLMCall,
} from "../components/Forms/utils/releaseUtils";
import SubCrateManager from "../components/Forms/SubCrateManager";

interface FormData {
  [key: string]: any;
}

interface UploadedFile {
  name: string;
  content: string;
}

interface CollapsedSections {
  [key: string]: boolean;
}

const CreateRelease: React.FC = () => {
  const [mode, setMode] = useState<"choice" | "new" | "edit" | "form">(
    "choice"
  );
  const [formData, setFormData] = useState<FormData>({});
  const [uploadedCrate, setUploadedCrate] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<UploadedFile[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>(
    () =>
      releaseFormConfig.sections.reduce(
        (acc, section) => ({ ...acc, [section.id]: true }),
        {}
      )
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const crateInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "new" || mode === "form") {
      if (!formData.hasPart || !formData.subCrates) {
        const defaults: FormData = {};
        releaseFormConfig.sections.forEach((section) => {
          section.fields.forEach((field) => {
            if (!formData.hasOwnProperty(field.name)) {
              if (field.defaultValue === "today") {
                defaults[field.name] = new Date().toISOString().split("T")[0];
              } else if (field.defaultValue) {
                defaults[field.name] = field.defaultValue;
              } else {
                defaults[field.name] = "";
              }
            }
          });
        });
        setFormData((prev) => ({
          ...prev,
          ...defaults,
          hasPart: prev.hasPart || [],
          subCrates: prev.subCrates || [],
        }));
      }
    }
  }, [mode]);

  const handleModeSelection = (selectedMode: "new" | "edit") => {
    setMode(selectedMode);
    if (selectedMode === "new") {
      const defaults: FormData = {};
      releaseFormConfig.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.defaultValue === "today") {
            defaults[field.name] = new Date().toISOString().split("T")[0];
          } else if (field.defaultValue) {
            defaults[field.name] = field.defaultValue;
          } else {
            defaults[field.name] = "";
          }
        });
      });
      defaults.hasPart = [];
      defaults.subCrates = [];
      setFormData(defaults);
    }
  };

  const handleCrateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = parseRoCrateMetadata(content);
        setFormData(parsedData);
        setUploadedCrate(file);
        setMode("form");
      } catch (error) {
        console.error("Error parsing RO-Crate:", error);
        alert(
          "Failed to parse RO-Crate metadata. Please check the file format."
        );
      }
    };
    reader.readAsText(file);
  };

  const handleSupportingDocsUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const newDocs: UploadedFile[] = [];

    for (const file of files) {
      const content = await file.text();
      newDocs.push({ name: file.name, content });
    }

    setSupportingDocs([...supportingDocs, ...newDocs]);
  };

  const handleLLMAssist = async () => {
    setIsLoadingLLM(true);
    try {
      const suggestedData = await mockLLMCall(supportingDocs);
      setFormData((prev) => ({
        ...prev,
        ...suggestedData,
        hasPart: prev.hasPart || [],
        subCrates: prev.subCrates || [],
      }));
      setMode("form");
    } catch (error) {
      console.error("LLM assist error:", error);
    } finally {
      setIsLoadingLLM(false);
    }
  };

  const handleSkipToManual = () => {
    const defaults: FormData = {};
    releaseFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.defaultValue === "today") {
          defaults[field.name] = new Date().toISOString().split("T")[0];
        } else if (field.defaultValue) {
          defaults[field.name] = field.defaultValue;
        } else {
          defaults[field.name] = "";
        }
      });
    });
    defaults.hasPart = [];
    defaults.subCrates = [];
    setFormData(defaults);
    setMode("form");
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubCratesChange = (subCrates: any[]) => {
    setFormData((prev) => ({ ...prev, subCrates }));
  };

  const handleHasPartChange = (hasPart: any[]) => {
    setFormData((prev) => ({ ...prev, hasPart }));
  };

  const handleDownload = () => {
    const jsonOutput = generateReleaseJson(formData);
    const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ro-crate-metadata.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const jsonPreview = generateReleaseJson(formData);

  const getSectionProgress = (section: any) => {
    const totalFields = section.fields.length;
    const requiredFields = section.fields.filter((f: any) => f.required).length;

    const filledFields = section.fields.filter(
      (f: any) => formData[f.name] && formData[f.name].toString().trim() !== ""
    ).length;

    const filledRequired = section.fields.filter(
      (f: any) =>
        f.required &&
        formData[f.name] &&
        formData[f.name].toString().trim() !== ""
    ).length;

    return { filledFields, totalFields, filledRequired, requiredFields };
  };

  return (
    <PageContainer>
      <PageTitle>Create Release RO-Crate</PageTitle>

      {mode === "choice" && (
        <ChoiceContainer>
          <ChoiceCard onClick={() => handleModeSelection("new")}>
            <ChoiceIcon>📝</ChoiceIcon>
            <ChoiceTitle>Start New Release</ChoiceTitle>
            <ChoiceDescription>
              Create a new release from scratch with optional AI assistance
            </ChoiceDescription>
          </ChoiceCard>

          <ChoiceCard onClick={() => crateInputRef.current?.click()}>
            <ChoiceIcon>📁</ChoiceIcon>
            <ChoiceTitle>Edit Existing Release</ChoiceTitle>
            <ChoiceDescription>
              Upload and modify an existing ro-crate-metadata.json file
            </ChoiceDescription>
          </ChoiceCard>

          <input
            ref={crateInputRef}
            type="file"
            accept=".json"
            onChange={handleCrateUpload}
            style={{ display: "none" }}
          />
        </ChoiceContainer>
      )}

      {mode === "new" && (
        <Card>
          <SectionTitle>
            Optional: Add Supporting Documents for AI Assistance
          </SectionTitle>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Upload documents that describe your dataset to get AI-suggested
            metadata
          </p>

          {supportingDocs.length > 0 && (
            <>
              <DocumentList>
                {supportingDocs.map((doc, idx) => (
                  <DocumentItem key={idx}>
                    <FiFile /> {doc.name}
                  </DocumentItem>
                ))}
              </DocumentList>
              <ButtonGroup>
                <StyledButton onClick={handleLLMAssist} disabled={isLoadingLLM}>
                  {isLoadingLLM ? "Processing..." : "Generate Suggestions"}
                </StyledButton>
                <StyledButton
                  variant="secondary"
                  onClick={() => setSupportingDocs([])}
                >
                  Clear Documents
                </StyledButton>
              </ButtonGroup>
            </>
          )}

          {supportingDocs.length === 0 && (
            <ButtonGroup>
              <StyledButton onClick={() => docsInputRef.current?.click()}>
                <FiUpload /> Add Documents
              </StyledButton>
              <StyledButton variant="secondary" onClick={handleSkipToManual}>
                Skip to Manual Entry
              </StyledButton>
            </ButtonGroup>
          )}

          <input
            ref={docsInputRef}
            type="file"
            multiple
            accept=".txt,.md,.pdf,.json"
            onChange={handleSupportingDocsUpload}
            style={{ display: "none" }}
          />
        </Card>
      )}

      {mode === "form" && (
        <MainContent>
          <FormColumn>
            {releaseFormConfig.sections.map((section) => {
              const progress = getSectionProgress(section);
              return (
                <FormSection key={section.id}>
                  <SectionHeader
                    onClick={() => toggleSection(section.id)}
                    collapsed={collapsedSections[section.id]}
                  >
                    {collapsedSections[section.id] ? (
                      <FiChevronRight />
                    ) : (
                      <FiChevronDown />
                    )}
                    {section.title} ({progress.filledFields}/
                    {progress.totalFields} filled, {progress.filledRequired}/
                    {progress.requiredFields} required)
                  </SectionHeader>

                  {!collapsedSections[section.id] && (
                    <SectionContent>
                      {section.fields.map((field: any) => (
                        <FieldWrapper key={field.name}>
                          {field.description && (
                            <InfoIconWrapper>
                              <InfoIcon
                                onMouseEnter={() =>
                                  setActiveTooltip(field.name)
                                }
                                onMouseLeave={() => setActiveTooltip(null)}
                              >
                                <FiInfo />
                              </InfoIcon>
                              {activeTooltip === field.name && (
                                <Tooltip>{field.description}</Tooltip>
                              )}
                            </InfoIconWrapper>
                          )}
                          {field.type === "textarea" ? (
                            <TextAreaField
                              label={field.label}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                handleFieldChange(field.name, e.target.value)
                              }
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          ) : (
                            <FormField
                              label={field.label}
                              name={field.name}
                              type={field.type}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                handleFieldChange(field.name, e.target.value)
                              }
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          )}
                        </FieldWrapper>
                      ))}
                    </SectionContent>
                  )}
                </FormSection>
              );
            })}

            <SubCrateManager
              subCrates={formData.subCrates || []}
              onSubCratesChange={handleSubCratesChange}
              existingHasPart={formData.hasPart || []}
              onHasPartChange={handleHasPartChange}
            />

            <ButtonGroup style={{ marginTop: "30px" }}>
              <StyledButton onClick={handleDownload} variant="primary">
                <FiDownload /> Download Release Metadata
              </StyledButton>
              <StyledButton
                variant="secondary"
                onClick={() => {
                  setMode("choice");
                  setFormData({});
                  setSupportingDocs([]);
                  setCollapsedSections(
                    releaseFormConfig.sections.reduce(
                      (acc, section) => ({ ...acc, [section.id]: true }),
                      {}
                    )
                  );
                }}
              >
                Start Over
              </StyledButton>
            </ButtonGroup>
          </FormColumn>

          <PreviewColumn showPreview={showPreview}>
            <PreviewToggle
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Collapse preview" : "Expand preview"}
            >
              {showPreview ? <FiChevronRight /> : <FiChevronLeft />}
            </PreviewToggle>
            {showPreview && (
              <>
                <PreviewHeader>JSON Preview</PreviewHeader>
                <PreviewContent>
                  <pre>{JSON.stringify(jsonPreview, null, 2)}</pre>
                </PreviewContent>
              </>
            )}
          </PreviewColumn>
        </MainContent>
      )}
    </PageContainer>
  );
};

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #3e7aa8;
  text-align: center;
  margin-bottom: 30px;
`;

const ChoiceContainer = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-top: 50px;
`;

const ChoiceCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 40px;
  width: 300px;
  text-align: center;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3e7aa8;
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(62, 122, 168, 0.2);
  }
`;

const ChoiceIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const ChoiceTitle = styled.h3`
  color: #3e7aa8;
  margin-bottom: 10px;
`;

const ChoiceDescription = styled.p`
  color: #666;
  font-size: 14px;
`;

const MainContent = styled.div`
  display: flex;
  gap: 30px;
  align-items: flex-start;
`;

const FormColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

const PreviewColumn = styled.div<{ showPreview: boolean }>`
  width: ${(props) => (props.showPreview ? "450px" : "40px")};
  position: sticky;
  top: 20px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
`;

const PreviewToggle = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  background: #3e7aa8;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1;

  &:hover {
    background: #2c5f8d;
  }
`;

const FormSection = styled(Card)`
  margin-bottom: 20px;
  overflow: hidden;
`;

const SectionTitle = styled.h3`
  color: #3e7aa8;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const SectionHeader = styled.div<{ collapsed?: boolean }>`
  color: #3e7aa8;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: ${(props) => (props.collapsed ? "0" : "10px")};
  margin-bottom: ${(props) => (props.collapsed ? "0" : "20px")};
  border-bottom: ${(props) => (props.collapsed ? "none" : "2px solid #e0e0e0")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }

  svg {
    transition: transform 0.3s;
  }
`;

const SectionContent = styled.div`
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FieldWrapper = styled.div`
  position: relative;
`;

const InfoIconWrapper = styled.div`
  position: absolute;
  right: 5px;
  top: 8px;
  z-index: 10;
`;

const InfoIcon = styled.div`
  width: 16px;
  height: 16px;
  cursor: help;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #3e7aa8;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  right: 25px;
  top: -5px;
  background: #333;
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 13px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  line-height: 1.4;

  &::after {
    content: "";
    position: absolute;
    right: -8px;
    top: 12px;
    width: 0;
    height: 0;
    border-left: 8px solid #333;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
`;

const PreviewHeader = styled.div`
  background: #3e7aa8;
  color: white;
  padding: 15px 15px 15px 55px;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
`;

const PreviewContent = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(100vh - 180px);

  pre {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #333;
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const DocumentList = styled.div`
  margin: 20px 0;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #666;
`;

export default CreateRelease;

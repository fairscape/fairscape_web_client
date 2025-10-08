import React, { useState } from "react";
import styled from "styled-components";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { Card, FormField, TextAreaField } from "../ReleaseComponents";

interface EditConfig {
  type: string;
  sections: Array<{
    id: string;
    title: string;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      required?: boolean;
      readonly?: boolean;
      placeholder?: string;
    }>;
  }>;
}

interface EditFormManagerProps {
  config: EditConfig;
  formData: any;
  onFieldChange: (fieldName: string, value: any) => void;
}

const EditFormManager: React.FC<EditFormManagerProps> = ({
  config,
  formData,
  onFieldChange,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>(
    config.sections.reduce(
      (acc, section) => ({ ...acc, [section.id]: false }),
      {}
    )
  );

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

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
    <>
      {config.sections.map((section) => {
        const progress = getSectionProgress(section);

        return (
          <FormSection key={section.id}>
            <SectionHeader
              onClick={() => toggleSection(section.id)}
              collapsed={collapsedSections[section.id]}
            >
              <HeaderLeft>
                {collapsedSections[section.id] ? (
                  <FiChevronRight />
                ) : (
                  <FiChevronDown />
                )}
                {section.title} ({progress.filledFields}/{progress.totalFields}{" "}
                filled, {progress.filledRequired}/{progress.requiredFields}{" "}
                required)
              </HeaderLeft>
            </SectionHeader>

            {!collapsedSections[section.id] && (
              <SectionContent>
                {section.fields.map((field: any) => (
                  <FieldWrapper key={field.name}>
                    {field.type === "textarea" ? (
                      <TextAreaField
                        label={field.label}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          onFieldChange(field.name, e.target.value)
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
                          onFieldChange(field.name, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                    {field.readonly && (
                      <ReadonlyNote>This field cannot be edited</ReadonlyNote>
                    )}
                  </FieldWrapper>
                ))}
              </SectionContent>
            )}
          </FormSection>
        );
      })}
    </>
  );
};

const FormSection = styled(Card)`
  margin-bottom: 20px;
  overflow: hidden;
`;

const SectionHeader = styled.div<{ collapsed?: boolean }>`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
  font-weight: 600;
  padding-bottom: ${(props) => (props.collapsed ? "0" : "10px")};
  margin-bottom: ${(props) => (props.collapsed ? "0" : "20px")};
  border-bottom: ${(props) =>
    props.collapsed ? "none" : `2px solid ${props.theme.colors.border}`};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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
  margin-bottom: 20px;
`;

const ReadonlyNote = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  font-style: italic;
`;

export default EditFormManager;

import React, { useState } from "react";
import styled from "styled-components";
import { FiChevronRight, FiChevronDown, FiInfo } from "react-icons/fi";
import { Card, FormField, TextAreaField } from "../ReleaseComponents";
import KeywordSelector from "../Release/KeywordSelector";

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
      description?: string;
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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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

  const renderField = (field: any) => {
    if (field.type === "keywords") {
      return (
        <KeywordSelector
          key={field.name}
          value={formData[field.name] || ""}
          onChange={(value) => onFieldChange(field.name, value)}
          required={field.required}
        />
      );
    }

    const commonProps = {
      label: field.label,
      name: field.name,
      value: formData[field.name] || "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => onFieldChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
    };

    if (field.type === "textarea") {
      return <TextAreaField {...commonProps} />;
    }

    if (field.type === "identifier_list") {
      return <FormField {...commonProps} type="text" />;
    }

    return <FormField {...commonProps} type={field.type} />;
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
                    {field.description && (
                      <InfoIconWrapper>
                        <InfoIcon
                          onMouseEnter={() => setActiveTooltip(field.name)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <FiInfo />
                        </InfoIcon>
                        {activeTooltip === field.name && (
                          <Tooltip>{field.description}</Tooltip>
                        )}
                      </InfoIconWrapper>
                    )}
                    {renderField(field)}
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

export default EditFormManager;

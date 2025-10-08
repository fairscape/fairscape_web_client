import React, { useState } from "react";
import styled from "styled-components";
import {
  FiChevronRight,
  FiChevronDown,
  FiInfo,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import releaseFormConfig from "../config/releaseFormConfig.json";
import {
  Card,
  FormField,
  TextAreaField,
  SelectField,
} from "./ReleaseComponents";
import SubCrateManager from "./SubCrateManager";
import KeywordSelector from "./KeywordSelector";

interface FormManagerProps {
  formData: any;
  onFieldChange: (fieldName: string, value: any) => void;
  reviewState?: any;
  isReviewRequired?: boolean;
  isReviewMode?: boolean;
  onSectionReview?: (sectionId: string) => void;
}

const FormManager: React.FC<FormManagerProps> = ({
  formData,
  onFieldChange,
  reviewState = {},
  isReviewRequired = false,
  isReviewMode = false,
  onSectionReview,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>(
    releaseFormConfig.sections.reduce(
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

  const handleSubCratesChange = (subCrates: any[]) => {
    onFieldChange("subCrates", subCrates);
  };

  const handleHasPartChange = (hasPart: any[]) => {
    onFieldChange("hasPart", hasPart);
  };

  return (
    <>
      {releaseFormConfig.sections.map((section) => {
        const progress = getSectionProgress(section);
        const sectionReviewState = reviewState[section.id];
        const isReviewed = sectionReviewState?.reviewed || false;

        return (
          <FormSection
            key={section.id}
            reviewed={isReviewed}
            needsReview={isReviewRequired && !isReviewed}
          >
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
              <HeaderRight>
                {isReviewRequired && (
                  <>
                    {isReviewed ? (
                      <ReviewedBadge>
                        <FiCheck /> Reviewed
                      </ReviewedBadge>
                    ) : (
                      <PendingBadge>
                        <FiAlertCircle /> Review Required
                      </PendingBadge>
                    )}
                  </>
                )}
              </HeaderRight>
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
                    {field.name === "keywords" ? (
                      <KeywordSelector
                        value={formData[field.name] || ""}
                        onChange={(value) => onFieldChange(field.name, value)}
                        required={field.required}
                      />
                    ) : field.type === "textarea" ? (
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
                    ) : field.type === "select" ? (
                      <SelectField
                        label={field.label}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          onFieldChange(field.name, e.target.value)
                        }
                        options={field.options || []}
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
                  </FieldWrapper>
                ))}

                {isReviewRequired && !isReviewed && (
                  <ReviewButtonContainer>
                    <ReviewButton onClick={() => onSectionReview?.(section.id)}>
                      I have reviewed this section and confirm the information
                      is accurate
                    </ReviewButton>
                  </ReviewButtonContainer>
                )}
              </SectionContent>
            )}
          </FormSection>
        );
      })}

      <SubCrateSection
        reviewed={reviewState.subCrates?.reviewed || false}
        needsReview={isReviewRequired && !reviewState.subCrates?.reviewed}
      >
        <SubCrateManager
          subCrates={formData.subCrates || []}
          onSubCratesChange={handleSubCratesChange}
          existingHasPart={formData.hasPart || []}
          onHasPartChange={handleHasPartChange}
        />
        {isReviewRequired && !reviewState.subCrates?.reviewed && (
          <ReviewButtonContainer>
            <ReviewButton onClick={() => onSectionReview?.("subCrates")}>
              I have reviewed this section and confirm the information is
              accurate
            </ReviewButton>
          </ReviewButtonContainer>
        )}
      </SubCrateSection>
    </>
  );
};

const FormSection = styled(Card)<{ reviewed?: boolean; needsReview?: boolean }>`
  margin-bottom: 20px;
  overflow: hidden;
  border: ${(props) =>
    props.reviewed
      ? "2px solid #28a745"
      : props.needsReview
      ? "2px solid #ffc107"
      : "1px solid #e0e0e0"};
  position: relative;
`;

const SubCrateSection = styled.div<{
  reviewed?: boolean;
  needsReview?: boolean;
}>`
  border: ${(props) =>
    props.reviewed
      ? "2px solid #28a745"
      : props.needsReview
      ? "2px solid #ffc107"
      : "1px solid #e0e0e0"};
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 24px;
  background: white;
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

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ReviewedBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #28a745;
  font-size: 14px;
  font-weight: 600;
`;

const PendingBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffc107;
  font-size: 14px;
  font-weight: 600;
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

const ReviewButtonContainer = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
`;

const ReviewButton = styled.button`
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #e0a800;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
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

export default FormManager;

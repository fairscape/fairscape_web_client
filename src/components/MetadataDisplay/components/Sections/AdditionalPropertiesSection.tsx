import React from "react";
import styled from "styled-components";
import { SectionContainer, SectionHeader } from "../../shared.styles";

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PropertyItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 18px;
    color: ${({ theme }) => theme.colors.primary};
    margin-top: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    padding-bottom: ${({ theme }) => theme.spacing.xs};
    border-bottom: 1px solid
      ${({ theme }) => theme.colors.secondary || theme.colors.primary};
  }

  .value-content {
    font-size: 15px;
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || theme.colors.text};

    p {
      margin-top: 0;
      margin-bottom: ${({ theme }) => theme.spacing.xs};
      &:last-child {
        margin-bottom: 0;
      }
    }
    ul,
    ol {
      margin-top: 0;
      margin-bottom: ${({ theme }) => theme.spacing.xs};
      padding-left: 20px;
    }
    li {
      margin-bottom: ${({ theme }) => theme.spacing.xxs};
    }
  }
`;

interface AdditionalProperty {
  name: string;
  value: string | string[];
}

interface AdditionalPropertiesSectionProps {
  properties?: AdditionalProperty[];
}

const AdditionalPropertiesSection: React.FC<
  AdditionalPropertiesSectionProps
> = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <SectionContainer data-testid="additional-properties-section">
      <SectionHeader>Additional Properties</SectionHeader>
      {properties.map((prop, index) => (
        <PropertyItem key={index}>
          <h3>{prop.name}</h3>
          {Array.isArray(prop.value) ? (
            <div className="value-content">
              <ul>
                {prop.value.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    dangerouslySetInnerHTML={{ __html: String(item) }}
                  />
                ))}
              </ul>
            </div>
          ) : (
            <div
              className="value-content"
              dangerouslySetInnerHTML={{ __html: String(prop.value) }}
            />
          )}
        </PropertyItem>
      ))}
    </SectionContainer>
  );
};

export default AdditionalPropertiesSection;

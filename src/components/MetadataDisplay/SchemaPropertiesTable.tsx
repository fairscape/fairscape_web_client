import React from "react";
import styled from "styled-components";
import { useTheme } from "styled-components";

const PropertiesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top;
    word-wrap: break-word;
  }

  th {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    font-weight: bold;
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 25%;
  }
  th:nth-child(2),
  td:nth-child(2) {
    width: 15%;
    min-width: 100px;
  }
  th:nth-child(3),
  td:nth-child(3) {
    width: 50%;
  }
  th:nth-child(4),
  td:nth-child(4) {
    width: 10%;
    text-align: center;
  }

  td:nth-child(3) {
    max-height: 50px;
    overflow: hidden;
  }
`;

const InfoButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.textAlt};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textAlt};
  cursor: pointer;
  padding: 0;
  margin: 0 auto;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8em;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

interface SchemaPropertiesTableProps {
  properties: { [key: string]: any };
  onExpandProperty: (propDetails: any, propName: string) => void;
}

const SchemaPropertiesTable: React.FC<SchemaPropertiesTableProps> = ({
  properties,
  onExpandProperty,
}) => {
  const theme = useTheme();

  if (!properties || Object.keys(properties).length === 0) {
    return <p>No properties defined for this schema.</p>;
  }

  return (
    <PropertiesTable>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Description</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(properties).map(
          ([propName, propDetails]: [string, any]) => {
            const descriptionText = propDetails.description || "No description";
            const valueUrl = propDetails.valueUrl;

            const defLink = valueUrl ? (
              <StyledLink
                href={valueUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft:
                    descriptionText !== "No description" ? "4px" : "0",
                }}
              >
                (Def)
              </StyledLink>
            ) : null;

            return (
              <tr key={propName}>
                <td>{propName}</td>
                <td>{propDetails.type || "N/A"}</td>
                <td>
                  {descriptionText}
                  {defLink}
                </td>
                <td>
                  <InfoButton
                    onClick={() => onExpandProperty(propDetails, propName)}
                  >
                    i
                  </InfoButton>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </PropertiesTable>
  );
};

export default SchemaPropertiesTable;

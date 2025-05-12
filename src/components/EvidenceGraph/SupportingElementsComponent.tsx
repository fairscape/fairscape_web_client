// src/components/GraphViewer/SupportingElementsComponent.tsx
import React, { useState } from "react"; // Removed useEffect
import styled from "styled-components";
// Removed axios import
import { Link } from "react-router-dom";

// Keep styled components as they are...
const Container = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CollapsibleSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
`;

const SectionContent = styled.div<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? "2000px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background};
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: 500;
  font-size: 0.9rem;
`;

const TableRow = styled.tr`
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: top;
  font-size: 0.9rem;
`;

const DescriptionCell = styled(TableCell)`
  max-width: 400px;
  line-height: 1.4;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NoDataMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
`;

interface SupportingElement {
  "@id": string;
  name: string;
  description: string;
  "@type": string;
}

interface SupportData {
  datasets: SupportingElement[];
  software: SupportingElement[];
  computations: SupportingElement[];
  samples: SupportingElement[];
  experiments: SupportingElement[];
  instruments: SupportingElement[];
}

// --- New Props Interface ---
interface SupportingElementsComponentProps {
  data: SupportData | null;
}

const SupportingElementsComponent: React.FC<
  SupportingElementsComponentProps
> = ({ data: supportData }) => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    datasets: false,
    software: false,
    computations: false,
    samples: false,
    experiments: false,
    instruments: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const extractArkIdentifier = (url: string) => {
    const match = url.match(/(ark:.+)/);
    return match ? match[1] : url;
  };

  const hasSupportingElements =
    supportData &&
    Object.values(supportData).some((arr) => arr && arr.length > 0);

  if (!supportData || !hasSupportingElements) {
    return (
      <Container>
        <SectionTitle>Supporting Elements</SectionTitle>
        <NoDataMessage>
          No supporting elements found for this graph.
        </NoDataMessage>
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle>Supporting Elements</SectionTitle>

      {Object.keys(supportData).map((section) => {
        const elements = supportData[section as keyof SupportData];

        if (!elements || elements.length === 0) return null;

        return (
          <CollapsibleSection key={section}>
            <SectionHeader onClick={() => toggleSection(section)}>
              <span>
                {section.charAt(0).toUpperCase() + section.slice(1)} (
                {elements.length})
              </span>
              <span>{expandedSections[section] ? "▲" : "▼"}</span>
            </SectionHeader>
            <SectionContent isOpen={expandedSections[section]}>
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Description</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <tbody>
                    {elements.map((element) => (
                      <TableRow key={element["@id"]}>
                        <TableCell>
                          <StyledLink
                            to={`/view/${extractArkIdentifier(element["@id"])}`}
                          >
                            {element.name || element["@id"]}{" "}
                          </StyledLink>
                        </TableCell>
                        <DescriptionCell>
                          {element.description || "No description provided."}{" "}
                        </DescriptionCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SectionContent>
          </CollapsibleSection>
        );
      })}
    </Container>
  );
};

export default SupportingElementsComponent;

export type { SupportData, SupportingElement };

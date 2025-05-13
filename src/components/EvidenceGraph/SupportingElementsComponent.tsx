// src/components/GraphViewer/SupportingElementsComponent.tsx
import React, { useState, useMemo, ReactNode } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { findPathInFullGraph } from "../../utils/pathfindingUtils";

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

const SearchInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
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

// MODIFIED TableHead styling
const TableHead = styled.thead`
  // Assuming theme.colors.surface is distinct from theme.colors.background
  // Use a light grey or a specific header background from your theme if available
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary}; // Prominent bottom border
`;

// MODIFIED TableHeaderCell styling
const TableHeaderCell = styled.th`
  padding: ${({ theme }) =>
    theme.spacing.sm}; // Increased padding for better spacing
  text-align: left;
  font-weight: bold; // Bolded text
  font-size: 0.95rem; // Slightly larger font size for emphasis
  color: ${({ theme }) =>
    theme.colors.primary}; // Use primary color for header text
  // text-transform: uppercase; // Optional: if you want uppercase headers
  // letter-spacing: 0.5px; // Optional: for a bit more refined look
`;

const TableRow = styled.tr`
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

// MODIFIED TableCell styling
const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.sm}; // Consistent padding with header
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle; // Center content vertically by default
  font-size: 0.9rem;
`;

// MODIFIED DescriptionCell styling
const DescriptionCell = styled(TableCell)`
  max-width: 400px; // Or adjust as needed
  line-height: 1.4;
  vertical-align: top; // Keep description text aligned to the top
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

const RelationshipButton = styled.button`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 8px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const HighlightSpan = styled.span`
  background-color: yellow;
  font-weight: bold;
  color: black;
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

interface SupportingElementsComponentProps {
  data: SupportData | null;
  evidenceGraphData?: any;
  onShowRelationshipPath: (pathNodeIds: string[] | null) => void;
}

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getHighlightedText = (text: string, highlight: string): ReactNode[] => {
  if (!text) return [text];
  if (!highlight.trim()) {
    return [text];
  }
  const escapedHighlight = escapeRegExp(highlight);
  const parts = text.split(new RegExp(`(${escapedHighlight})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <HighlightSpan key={`${part}-${index}`}>{part}</HighlightSpan>
    ) : (
      part
    )
  );
};

const SupportingElementsComponent: React.FC<
  SupportingElementsComponentProps
> = ({ data: supportData, evidenceGraphData, onShowRelationshipPath }) => {
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
  const [searchTerm, setSearchTerm] = useState("");

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

  const showRelationship = (elementId: string) => {
    if (!evidenceGraphData) {
      console.warn("Evidence graph data is not available for pathfinding.");
      onShowRelationshipPath(null);
      return;
    }

    const path = findPathInFullGraph(evidenceGraphData, elementId);

    if (path && path.length > 0) {
      onShowRelationshipPath(path);
    } else {
      onShowRelationshipPath(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredSupportData = useMemo(() => {
    if (!supportData) return null;
    if (!searchTerm.trim()) return supportData;

    const lowerSearchTerm = searchTerm.toLowerCase();
    const result: SupportData = {
      datasets: [],
      software: [],
      computations: [],
      samples: [],
      experiments: [],
      instruments: [],
    };

    (Object.keys(supportData) as Array<keyof SupportData>).forEach((key) => {
      const sectionElements = supportData[key];
      if (sectionElements && Array.isArray(sectionElements)) {
        result[key] = sectionElements.filter(
          (element) =>
            (element.name &&
              element.name.toLowerCase().includes(lowerSearchTerm)) ||
            (element.description &&
              element.description.toLowerCase().includes(lowerSearchTerm))
        );
      } else {
        result[key] = [];
      }
    });
    return result;
  }, [supportData, searchTerm]);

  const hasAnyOriginalElements =
    supportData &&
    Object.values(supportData).some((arr) => arr && arr.length > 0);

  if (!supportData || !hasAnyOriginalElements) {
    return (
      <Container>
        <SectionTitle>Supporting Elements</SectionTitle>
        <NoDataMessage>
          No supporting elements found for this graph.
        </NoDataMessage>
      </Container>
    );
  }

  const hasFilteredElements =
    filteredSupportData &&
    Object.values(filteredSupportData).some((arr) => arr && arr.length > 0);

  return (
    <Container>
      <SectionTitle>Supporting Elements</SectionTitle>

      <SearchInputContainer>
        <SearchInput
          type="text"
          placeholder="Search elements by name or description..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </SearchInputContainer>

      {!hasFilteredElements && searchTerm.trim() ? (
        <NoDataMessage>
          No supporting elements match your search criteria.
        </NoDataMessage>
      ) : (
        (
          Object.keys(filteredSupportData || {}) as Array<keyof SupportData>
        ).map((sectionKey) => {
          if (!filteredSupportData) return null;

          const elements = filteredSupportData[sectionKey];

          if (!elements || elements.length === 0) return null;

          return (
            <CollapsibleSection key={sectionKey}>
              <SectionHeader onClick={() => toggleSection(sectionKey)}>
                <span>
                  {sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} (
                  {elements.length})
                </span>
                <span>{expandedSections[sectionKey] ? "▲" : "▼"}</span>
              </SectionHeader>
              <SectionContent isOpen={expandedSections[sectionKey]}>
                <div style={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <tr>
                        <TableHeaderCell>Name</TableHeaderCell>
                        <TableHeaderCell>Description</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <tbody>
                      {elements.map((element) => (
                        <TableRow key={element["@id"]}>
                          <TableCell>
                            <StyledLink
                              to={`/view/${extractArkIdentifier(
                                element["@id"]
                              )}`}
                            >
                              {getHighlightedText(
                                element.name || element["@id"],
                                searchTerm
                              )}
                            </StyledLink>
                          </TableCell>
                          <DescriptionCell>
                            {getHighlightedText(
                              element.description || "No description provided.",
                              searchTerm
                            )}
                          </DescriptionCell>
                          <TableCell>
                            <RelationshipButton
                              onClick={() => showRelationship(element["@id"])}
                            >
                              Show Relationship
                            </RelationshipButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SectionContent>
            </CollapsibleSection>
          );
        })
      )}
    </Container>
  );
};

export default SupportingElementsComponent;
export type { SupportData, SupportingElement };

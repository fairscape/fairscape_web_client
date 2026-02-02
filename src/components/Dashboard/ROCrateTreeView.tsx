import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import axios from "axios";
import TreeNode from "./TreeNode";

const API_URL = window.API_URL;

const TableContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: 600;
  font-size: 14px;
`;

const TableRow = styled.tr<{ expanded?: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  vertical-align: top;
`;

const ExpandCell = styled(TableCell)`
  width: 40px;
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  user-select: none;
`;

const ExpandIcon = styled.span<{ expanded: boolean }>`
  display: inline-block;
  transition: transform 0.2s;
  transform: ${({ expanded }) => (expanded ? "rotate(90deg)" : "rotate(0deg)")};
  font-size: 12px;
`;

const NameCell = styled(TableCell)`
  width: 20%;
  min-width: 150px;
  max-width: 250px;
`;

const NameLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

const DescriptionCell = styled(TableCell)`
  width: 50%;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  line-height: 1.4;
`;

const DetailsCell = styled(TableCell)`
  width: 30%;
  max-width: 200px;
  color: ${({ theme }) => theme.colors.textSecondary || "#858585"};
  font-size: 12px;
  line-height: 1.3;
  word-wrap: break-word;
`;

const TreeContainer = styled.td`
  padding: 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TreeContent = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  padding-left: 60px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary || "#858585"};
  font-size: 13px;
`;

interface ContentSummaryItem {
  "@id": string;
  name: string;
  "@type"?: string;
}

interface CategoryCounts {
  datasets: number;
  software: number;
  computations: number;
  schemas: number;
  samples: number;
  mlModels: number;
  rocrates: number;
  other: number;
  total: number;
}

interface ContentSummary {
  datasets: ContentSummaryItem[];
  software: ContentSummaryItem[];
  computations: ContentSummaryItem[];
  schemas: ContentSummaryItem[];
  samples: ContentSummaryItem[];
  mlModels: ContentSummaryItem[];
  rocrates: ContentSummaryItem[];
  other: ContentSummaryItem[];
  counts: CategoryCounts;
  summaryAvailable: boolean;
}

interface RoCrate {
  "@id": string;
  name: string;
  description: string;
  counts?: CategoryCounts;
}

interface CategoryState {
  items: ContentSummaryItem[];
  offset: number;
  loading: boolean;
}

interface CrateState {
  summary: ContentSummary | null;
  expanded: boolean;
  loading: boolean;
  categories: {
    [key: string]: CategoryState;
  };
}

interface ROCrateTreeViewProps {
  rocrates: RoCrate[];
}

const ROCrateTreeView: React.FC<ROCrateTreeViewProps> = ({ rocrates }) => {
  const [crateStates, setCrateStates] = useState<{
    [crateId: string]: CrateState;
  }>({});

  const extractArkIdentifier = (url: string) => {
    const match = url.match(/(ark:.+)/);
    return match ? match[1] : "";
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      datasets: "Datasets",
      software: "Software",
      computations: "Computations",
      schemas: "Schemas",
      samples: "Samples",
      mlModels: "ML Models",
      rocrates: "Nested RO-Crates",
      other: "Other",
    };
    return labels[category] || category;
  };

  const formatCountsDetails = (counts?: CategoryCounts): string => {
    if (!counts || counts.total === 0) {
      return "No items";
    }

    const parts: string[] = [];
    if (counts.datasets > 0) parts.push(`${counts.datasets} datasets`);
    if (counts.software > 0) parts.push(`${counts.software} software`);
    if (counts.computations > 0) parts.push(`${counts.computations} computations`);
    if (counts.schemas > 0) parts.push(`${counts.schemas} schemas`);
    if (counts.samples > 0) parts.push(`${counts.samples} samples`);
    if (counts.mlModels > 0) parts.push(`${counts.mlModels} ML models`);
    if (counts.rocrates > 0) parts.push(`${counts.rocrates} nested crates`);
    if (counts.other > 0) parts.push(`${counts.other} other`);

    return parts.join(", ");
  };

  const fetchSummary = async (crateId: string, limit: number = 5) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const arkId = extractArkIdentifier(crateId);
      const response = await axios.get(
        `${API_URL}/rocrate/summary/${arkId}?limit=${limit}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching summary:", error);
      return null;
    }
  };

  const loadMoreItems = async (
    crateId: string,
    category: string,
    offset: number
  ) => {
    const arkId = extractArkIdentifier(crateId);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Set loading state
    setCrateStates((prev) => ({
      ...prev,
      [crateId]: {
        ...prev[crateId],
        categories: {
          ...prev[crateId]?.categories,
          [category]: {
            ...prev[crateId]?.categories?.[category],
            loading: true,
          },
        },
      },
    }));

    try {
      const response = await axios.get(
        `${API_URL}/rocrate/summary/${arkId}?limit=5&offset=${offset}`,
        { headers }
      );

      const newItems = response.data[category] || [];

      setCrateStates((prev) => {
        const currentItems = prev[crateId]?.categories?.[category]?.items || [];
        return {
          ...prev,
          [crateId]: {
            ...prev[crateId],
            categories: {
              ...prev[crateId]?.categories,
              [category]: {
                items: [...currentItems, ...newItems],
                offset: offset + 5,
                loading: false,
              },
            },
          },
        };
      });
    } catch (error) {
      console.error("Error loading more items:", error);
      setCrateStates((prev) => ({
        ...prev,
        [crateId]: {
          ...prev[crateId],
          categories: {
            ...prev[crateId]?.categories,
            [category]: {
              ...prev[crateId]?.categories?.[category],
              loading: false,
            },
          },
        },
      }));
    }
  };

  const handleToggleExpand = async (crateId: string) => {
    const currentState = crateStates[crateId];
    const isExpanded = currentState?.expanded || false;

    // If collapsing, just toggle
    if (isExpanded) {
      setCrateStates((prev) => ({
        ...prev,
        [crateId]: {
          ...prev[crateId],
          expanded: false,
        },
      }));
      return;
    }

    // If expanding and already loaded, just toggle
    if (currentState?.summary) {
      setCrateStates((prev) => ({
        ...prev,
        [crateId]: {
          ...prev[crateId],
          expanded: true,
        },
      }));
      return;
    }

    // Otherwise, fetch data
    setCrateStates((prev) => ({
      ...prev,
      [crateId]: {
        ...prev[crateId],
        loading: true,
        expanded: true,
      },
    }));

    const summary = await fetchSummary(crateId, 5);

    if (summary) {
      const categories: { [key: string]: CategoryState } = {};
      Object.keys(summary).forEach((key) => {
        if (Array.isArray(summary[key])) {
          categories[key] = {
            items: summary[key],
            offset: 5,
            loading: false,
          };
        }
      });

      setCrateStates((prev) => ({
        ...prev,
        [crateId]: {
          summary,
          expanded: true,
          loading: false,
          categories,
        },
      }));
    } else {
      setCrateStates((prev) => ({
        ...prev,
        [crateId]: {
          ...prev[crateId],
          loading: false,
        },
      }));
    }
  };

  const handleCrateExpand = async (crateId: string) => {
    if (crateStates[crateId]?.summary) {
      return;
    }

    setCrateStates((prev) => ({
      ...prev,
      [crateId]: {
        ...prev[crateId],
        loading: true,
        expanded: true,
      },
    }));

    const summary = await fetchSummary(crateId, 5);

    if (summary) {
      const categories: { [key: string]: CategoryState } = {};
      Object.keys(summary).forEach((key) => {
        if (Array.isArray(summary[key])) {
          categories[key] = {
            items: summary[key],
            offset: 5,
            loading: false,
          };
        }
      });

      setCrateStates((prev) => ({
        ...prev,
        [crateId]: {
          summary,
          expanded: true,
          loading: false,
          categories,
        },
      }));
    } else {
      setCrateStates((prev) => ({
        ...prev,
        [crateId]: {
          ...prev[crateId],
          loading: false,
        },
      }));
    }
  };

  const renderCategory = (
    crateId: string,
    category: string,
    count: number,
    level: number
  ) => {
    const state = crateStates[crateId];
    const categoryState = state?.categories?.[category];
    const items = categoryState?.items || [];
    const hasMore = items.length < count;

    if (count === 0) {
      return null;
    }

    return (
      <TreeNode
        key={category}
        label={getCategoryLabel(category)}
        nodeType="category"
        level={level}
        count={count}
        expandable={count > 0}
        defaultExpanded={false}
        hasMore={hasMore}
        loading={categoryState?.loading}
        onLoadMore={() => loadMoreItems(crateId, category, categoryState?.offset || 5)}
      >
        {items.map((item) => {
          const isNestedRocrate = category === "rocrates";
          return (
            <TreeNode
              key={item["@id"]}
              label={item.name}
              nodeType={isNestedRocrate ? "rocrate" : "file"}
              level={level + 1}
              linkTo={`/view/${extractArkIdentifier(item["@id"])}`}
              expandable={isNestedRocrate}
              onExpand={isNestedRocrate ? () => handleCrateExpand(item["@id"]) : undefined}
            >
              {isNestedRocrate && renderCrateContents(item["@id"], level + 1)}
            </TreeNode>
          );
        })}
      </TreeNode>
    );
  };

  const renderCrateContents = (crateId: string, level: number) => {
    const state = crateStates[crateId];

    if (!state?.summary) {
      return null;
    }

    const { counts } = state.summary;
    const categories = [
      "datasets",
      "software",
      "computations",
      "schemas",
      "samples",
      "mlModels",
      "rocrates",
      "other",
    ];

    return (
      <>
        {categories.map((category) =>
          renderCategory(crateId, category, counts[category], level)
        )}
      </>
    );
  };

  if (rocrates.length === 0) {
    return (
      <TableContainer>
        <EmptyMessage>No RO-Crates found.</EmptyMessage>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell style={{ width: "40px" }}></TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Contents</TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {rocrates.map((crate) => {
            const isExpanded = crateStates[crate["@id"]]?.expanded || false;

            return (
              <React.Fragment key={crate["@id"]}>
                <TableRow expanded={isExpanded}>
                  <ExpandCell onClick={() => handleToggleExpand(crate["@id"])}>
                    <ExpandIcon expanded={isExpanded}>▶</ExpandIcon>
                  </ExpandCell>
                  <NameCell>
                    <NameLink to={`/view/${extractArkIdentifier(crate["@id"])}`}>
                      {crate.name}
                    </NameLink>
                  </NameCell>
                  <DescriptionCell>{crate.description}</DescriptionCell>
                  <DetailsCell>
                    {formatCountsDetails(crate.counts)}
                  </DetailsCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TreeContainer colSpan={4}>
                      <TreeContent>
                        {renderCrateContents(crate["@id"], 0)}
                      </TreeContent>
                    </TreeContainer>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default ROCrateTreeView;

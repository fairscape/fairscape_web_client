import { render, screen, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import MetadataComponent from "./MetadataComponent";
import { ROCrateProperties, DatasetProperties } from "./metadataProperties";

// Mock the child components
vi.mock("./TableRow", () => ({
  default: ({ property, value }) => (
    <tr data-testid="mocked-table-row">
      <td>{property}</td>
      <td>{value === "N/A" ? value : JSON.stringify(value)}</td>
    </tr>
  ),
}));

vi.mock("./SimpleTableRowComponent", () => ({
  default: ({ property, value }) => (
    <tr data-testid="mocked-simple-row">
      <td>{property}</td>
      <td>{value === "N/A" ? value : JSON.stringify(value)}</td>
    </tr>
  ),
}));

describe("MetadataComponent", () => {
  const mockROCrateMetadata = {
    "@id": "ark:12345/abc",
    name: "Test ROCrate",
    description: "A test ROCrate",
    author: "Test Author",
    sourceOrganization: "Test Org",
    "@graph": ["item1", "item2"],
    extraProperty: "extra value",
  };

  const mockDatasetMetadata = {
    "@id": "ark:12345/dataset",
    name: "Test Dataset",
    description: "A test dataset",
    author: "Test Author",
    owner: "Test Owner",
    schema: "test-schema",
    datePublished: "2024-01-01",
    extraProperty: "extra value",
  };

  describe("Property Rendering by Type", () => {
    it("renders ROCrate properties correctly", () => {
      render(
        <MetadataComponent metadata={mockROCrateMetadata} type="ROCrate" />
      );

      // Check for properties defined in ROCrateProperties
      ROCrateProperties.forEach((prop) => {
        expect(screen.getByText(prop.name)).toBeInTheDocument();
      });

      // Verify some specific values
      const tableRows = screen.getAllByTestId("mocked-table-row");
      const rowContent = tableRows.map((row) => row.textContent);

      expect(
        rowContent.some((content) => content.includes("Test ROCrate"))
      ).toBeTruthy();
      expect(
        rowContent.some((content) => content.includes("ark:12345/abc"))
      ).toBeTruthy();
    });

    it("renders Dataset properties correctly", () => {
      render(
        <MetadataComponent metadata={mockDatasetMetadata} type="Dataset" />
      );

      // Check for properties defined in DatasetProperties
      DatasetProperties.forEach((prop) => {
        expect(screen.getByText(prop.name)).toBeInTheDocument();
      });

      // Verify specific Dataset values
      const tableRows = screen.getAllByTestId("mocked-table-row");
      const rowContent = tableRows.map((row) => row.textContent);

      expect(
        rowContent.some((content) => content.includes("Test Dataset"))
      ).toBeTruthy();
      expect(
        rowContent.some((content) => content.includes("Test Owner"))
      ).toBeTruthy();
    });

    it("handles unknown type gracefully", () => {
      render(
        <MetadataComponent metadata={mockROCrateMetadata} type="UnknownType" />
      );

      expect(screen.getByText("Property")).toBeInTheDocument();
      expect(screen.getByText("Value")).toBeInTheDocument();
      expect(screen.queryAllByTestId("mocked-table-row")).toHaveLength(0);
    });
  });
});

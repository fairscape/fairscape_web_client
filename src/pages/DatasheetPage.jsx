// src/pages/DatasheetPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import DatasheetViewer from "../components/DatasheetViewer/DatasheetViewer";
import {
  processRootCrate,
  findSubCrateRefs,
  processSubCrateSummary,
} from "../utils/datasheetUtils";

// Import the static ROOT data
import rootMetadataJson from "../data/ro-crate-metadata.json";

const DatasheetPage = () => {
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();
  const ark = params["*"];

  // Use useCallback to memoize the fetch function if needed, though less critical for static data
  const loadAndProcessData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setProcessedData(null); // Clear previous data

      // --- Process Root Crate ---
      const processedRoot = processRootCrate(rootMetadataJson);
      if (!processedRoot) {
        throw new Error("Failed to process root crate metadata.");
      }

      // --- Find and Process Sub-Crates ---
      const subCrateRefs = findSubCrateRefs(rootMetadataJson);
      const processedSubcrates = [];

      for (const ref of subCrateRefs) {
        if (!ref.metadataPath) {
          console.warn(
            `Sub-crate ref ${ref.id || "unknown"} missing metadata path.`
          );
          processedSubcrates.push({
            id: ref.id || ref.metadataPath || `missing-path-${Date.now()}`, // Ensure unique key fallback
            name: ref.name || ref.id || "Unknown Sub-Crate",
            error: "Missing metadata path",
            metadataPath: ref.metadataPath || "N/A",
            // Add defaults for error display
            authors: "",
            keywords: [],
            date: "",
            size: "N/A",
            doi: "",
            contact: "",
            license: "",
            confidentiality: "",
            files_count: 0,
            software_count: 0,
            instruments_count: 0,
            samples_count: 0,
            experiments_count: 0,
            computations_count: 0,
            schemas_count: 0,
            other_count: 0,
            file_formats: {},
            file_access: {},
            software_formats: {},
            software_access: {},
            computation_patterns: [],
            input_datasets: {},
            input_datasets_count: 0,
            inputs_count: 0,
            experiment_patterns: [],
            cell_lines: {},
            species: {},
            experiment_types: {},
            related_publications: [],
            previewUrl: "#",
          });
          continue; // Skip to next ref
        }

        // Construct the dynamic import path relative to the 'src' directory
        // Vite requires paths like this for dynamic imports
        const dynamicPath = `/src/data/${ref.metadataPath}`;

        try {
          // Dynamically import the sub-crate JSON
          const subMetadataModule = await import(
            /* @vite-ignore */ dynamicPath
          );
          const subMetadataJson = subMetadataModule.default; // Assuming default export

          if (!subMetadataJson || !subMetadataJson["@graph"]) {
            throw new Error(`Invalid metadata format in ${ref.metadataPath}`);
          }

          // Calculate preview URL based on the metadata path
          const subcrateDir = ref.metadataPath.substring(
            0,
            ref.metadataPath.lastIndexOf("/")
          );
          // Assuming the DatasheetPage is at a route like /datasheet/ark:...
          // and preview HTML is relative to the *build* output, not source.
          // This might need adjustment based on your build setup and routing.
          // A simple relative link might work if structure is preserved.
          const previewUrl = `/${subcrateDir}/ro-crate-preview.html`;

          const processedSub = processSubCrateSummary(
            subMetadataJson,
            ref.metadataPath
          );
          processedSubcrates.push({ ...processedSub, previewUrl });
        } catch (subError) {
          console.error(
            `Error loading/processing sub-crate ${ref.metadataPath}:`,
            subError
          );
          let errorMessage = "Failed to load or process";
          if (
            subError.message.includes(
              "Failed to fetch dynamically imported module"
            ) ||
            subError.message.includes("Cannot find module")
          ) {
            errorMessage = `Metadata file not found at expected path: src/data/${ref.metadataPath}`;
          } else if (subError instanceof Error) {
            errorMessage = subError.message;
          }
          processedSubcrates.push({
            id: ref.id || ref.metadataPath || `error-${Date.now()}`, // Ensure unique key fallback
            name: ref.name || ref.id || "Error Loading Sub-Crate",
            error: errorMessage,
            metadataPath: ref.metadataPath,
            // Add defaults for error display
            authors: "",
            keywords: [],
            date: "",
            size: "N/A",
            doi: "",
            contact: "",
            license: "",
            confidentiality: "",
            files_count: 0,
            software_count: 0,
            instruments_count: 0,
            samples_count: 0,
            experiments_count: 0,
            computations_count: 0,
            schemas_count: 0,
            other_count: 0,
            file_formats: {},
            file_access: {},
            software_formats: {},
            software_access: {},
            computation_patterns: [],
            input_datasets: {},
            input_datasets_count: 0,
            inputs_count: 0,
            experiment_patterns: [],
            cell_lines: {},
            species: {},
            experiment_types: {},
            related_publications: [],
            previewUrl: "#",
          });
        }
      }

      // --- Combine Processed Data ---
      const datasheetStructure = {
        title: processedRoot.overview.title,
        version: processedRoot.overview.version,
        overview: processedRoot.overview,
        useCases: processedRoot.useCases,
        distribution: processedRoot.distribution,
        composition: {
          subcrates: processedSubcrates,
        },
      };

      setProcessedData(datasheetStructure);
    } catch (err) {
      console.error("Error loading or processing datasheet:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty array: Load static data once on mount

  useEffect(() => {
    loadAndProcessData(); // Call the processing function
  }, [loadAndProcessData]); // Rerun if the function itself changes (it shouldn't here)

  useEffect(() => {
    if (processedData?.title) {
      document.title = `${processedData.title} - RO-Crate Datasheet`;
    } else if (!loading) {
      document.title = `RO-Crate Datasheet`;
    }
  }, [processedData, loading]);

  if (loading) {
    return <div className="page-content container">Loading Datasheet...</div>;
  }

  if (error || !processedData) {
    return (
      <div className="page-content container">
        Error loading datasheet:{" "}
        {error ? error.message : "Data processing failed"}
      </div>
    );
  }

  return (
    <div className="page-content">
      <DatasheetViewer data={processedData} />
    </div>
  );
};

export default DatasheetPage;

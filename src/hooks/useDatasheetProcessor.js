// src/hooks/useDatasheetProcessor.js
import { useState, useCallback } from "react";
import axios from "axios";
import {
  processRootCrate,
  processSubCrateSummary,
  findSubCrateRefs,
  formatSize,
} from "../utils/datasheetUtils";

const useDatasheetProcessor = (apiUrl) => {
  const [datasheetData, setDatasheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatasheetData = useCallback(
    async (rootArk) => {
      setLoading(true);
      setError(null);
      setDatasheetData(null);

      const rootMetadataUrl = `${apiUrl}/${rootArk.replace(
        /\/$/,
        ""
      )}/ro-crate-metadata.json`;
      const baseCratePath = rootArk.replace(/\/$/, "");

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const rootResponse = await axios.get(rootMetadataUrl, { headers });
        const rootMetadata = rootResponse.data;

        if (!rootMetadata || !rootMetadata["@graph"]) {
          throw new Error("Invalid root RO-Crate metadata format.");
        }

        const processedRoot = processRootCrate(rootMetadata);
        const subCrateRefs = findSubCrateRefs(rootMetadata);

        const subcratePromises = subCrateRefs.map(async (ref) => {
          if (!ref.metadataPath) {
            console.warn(
              `Sub-crate ref ${ref.id || "unknown"} missing metadata path.`
            );
            return {
              ...ref,
              error: "Missing metadata path",
              name: ref.id || "Unknown ID",
            };
          }

          let subcrateMetadataUrl;
          if (
            ref.metadataPath.startsWith("http://") ||
            ref.metadataPath.startsWith("https://") ||
            ref.metadataPath.startsWith("ark:")
          ) {
            const subArkOrUrl = ref.metadataPath.includes(
              "ro-crate-metadata.json"
            )
              ? ref.metadataPath.split("/ro-crate-metadata.json")[0]
              : ref.metadataPath; 
            subcrateMetadataUrl = `${apiUrl}/${subArkOrUrl.replace(
              /\/$/,
              ""
            )}/ro-crate-metadata.json`;
          } else {
            // Relative path: resolve based on the root crate's path
            const subcrateRelativePath = ref.metadataPath.startsWith("/")
              ? ref.metadataPath.substring(1)
              : ref.metadataPath;
            subcrateMetadataUrl = `${apiUrl}/${baseCratePath}/${subcrateRelativePath}`;
          }

          try {
            const subResponse = await axios.get(subcrateMetadataUrl, {
              headers,
            });
            const subMetadata = subResponse.data;
            if (!subMetadata || !subMetadata["@graph"]) {
              throw new Error("Invalid sub-crate metadata format.");
            }

            const subcrateBasePath = subcrateMetadataUrl
              .substring(apiUrl.length + 1)
              .split("/ro-crate-metadata.json")[0];
            const previewUrl = `/${subcrateBasePath}/ro-crate-preview.html`; // Assuming preview exists

            return {
              ...processSubCrateSummary(subMetadata, ref.metadataPath),
              previewUrl: previewUrl, // Add link to detailed preview
            };
          } catch (subError) {
            console.error(
              `Error fetching sub-crate ${ref.id || ref.metadataPath}:`,
              subError
            );
            let errorMessage = "Failed to fetch or process";
            if (
              axios.isAxiosError(subError) &&
              subError.response?.status === 404
            ) {
              errorMessage = "Metadata file not found";
            } else if (subError instanceof Error) {
              errorMessage = subError.message;
            }
            return {
              id: ref.id || ref.metadataPath,
              name: ref.name || ref.id || "Unknown Sub-Crate",
              description: `Error: ${errorMessage}`,
              metadataPath: ref.metadataPath,
              error: errorMessage,
              // Add default empty fields to prevent render errors
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
            };
          }
        });

        const resolvedSubcrates = await Promise.all(subcratePromises);

        setDatasheetData({
          title: processedRoot.overview.title,
          version: processedRoot.overview.version,
          overview: processedRoot.overview,
          useCases: processedRoot.useCases,
          distribution: processedRoot.distribution,
          composition: {
            subcrates: resolvedSubcrates,
          },
        });
      } catch (err) {
        console.error("Error fetching datasheet data:", err);
        let message = "Failed to fetch or process root crate";
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          message = "Root metadata file not found";
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError({ message });
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  return { datasheetData, loading, error, fetchDatasheetData };
};

export default useDatasheetProcessor;

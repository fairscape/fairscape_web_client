import { useState } from "react";
import { IssueDetail, D4DConversionResult } from "../types/issue.types";
import { extractD4DYamlUrl } from "../utils/d4dUrlExtractor";
import { convertD4DToROCrate } from "../api/d4dConversionApi";

export const useD4DConversion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertIssue = async (
    issue: IssueDetail,
  ): Promise<D4DConversionResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const yamlUrl = extractD4DYamlUrl(issue.comments);

      if (!yamlUrl) {
        setError("D4D YAML URL not found in comments");
        setLoading(false);
        return null;
      }

      const rocrate = await convertD4DToROCrate(yamlUrl);

      setLoading(false);
      return {
        rocrate,
        issueNumber: issue.number,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setLoading(false);
      return null;
    }
  };

  return { convertIssue, loading, error };
};

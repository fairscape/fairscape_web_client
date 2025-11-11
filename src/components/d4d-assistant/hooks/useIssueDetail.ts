import { useState } from "react";
import { IssueDetail } from "../types/issue.types";
import { fetchIssueDetail } from "../api/issuesApi";

export const useIssueDetail = () => {
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIssue = async (issueNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIssueDetail(issueNumber);
      setIssue(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issue");
    } finally {
      setLoading(false);
    }
  };

  return { issue, loading, error, loadIssue };
};
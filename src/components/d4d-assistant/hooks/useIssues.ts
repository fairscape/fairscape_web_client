import { useState, useEffect } from "react";
import { Issue } from "../types/issue.types";
import { fetchIssues } from "../api/issuesApi";

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIssues("open");
      setIssues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  return { issues, loading, error, refetch: loadIssues };
};

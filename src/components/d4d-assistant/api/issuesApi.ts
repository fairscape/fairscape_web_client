import { API_URL } from "../utils/constants";
import { Issue, IssueDetail } from "../types/issue.types";

export const fetchIssues = async (state: string = "open"): Promise<Issue[]> => {
  const response = await fetch(`${API_URL}/issues?state=${state}`);
  if (!response.ok) throw new Error("Failed to fetch issues");
  const data = await response.json();
  return data.issues || [];
};

export const fetchIssueDetail = async (
  issueNumber: number
): Promise<IssueDetail> => {
  const response = await fetch(`${API_URL}/issues/${issueNumber}`);
  if (!response.ok) throw new Error("Failed to fetch issue details");
  return await response.json();
};

export const createIssue = async (
  title: string,
  body: string,
  labels: string[],
  files: File[]
): Promise<any> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  labels.forEach((label) => formData.append("labels", label));
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${API_URL}/issues`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to create issue");
  return await response.json();
};

export const addComment = async (
  issueNumber: number,
  body: string
): Promise<any> => {
  const response = await fetch(`${API_URL}/issues/${issueNumber}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) throw new Error("Failed to add comment");
  return await response.json();
};

export const updateIssue = async (
  issueNumber: number,
  updates: { state?: string; title?: string; body?: string; labels?: string[] }
): Promise<any> => {
  const response = await fetch(`${API_URL}/issues/${issueNumber}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error("Failed to update issue");
  return await response.json();
};

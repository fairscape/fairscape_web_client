import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIssues } from "../components/d4d-assistant/hooks/useIssues";
import { useIssueDetail } from "../components/d4d-assistant/hooks/useIssueDetail";
import { useStatusMessage } from "../components/d4d-assistant/hooks/useStatusMessage";
import { IssueFormData } from "../components/d4d-assistant/types/issue.types";
import {
  createIssue,
  addComment,
} from "../components/d4d-assistant/api/issuesApi";
import { IssueListView } from "../components/d4d-assistant/views/IssueListView";
import { CreateIssueView } from "../components/d4d-assistant/views/CreateIssueView";
import { IssueDetailView } from "../components/d4d-assistant/views/IssueDetailView";
import { StatusMessage } from "../components/d4d-assistant/components/StatusMessage";
import { PageContainer } from "../components/d4d-assistant/styles/D4DAssistant.styles";

type View = "list" | "create" | "detail";

const extractYamlUrlFromComments = (comments: any[]): string => {
  for (const comment of comments) {
    if (comment.user === "d4dassistant") {
      const match = comment.body.match(
        /Datasheet available at:\s*(https:\/\/\S+\.yaml)/,
      );
      if (match) return match[1];
    }
  }
  throw new Error("YAML URL not found in issue comments");
};

const D4DAssistantPage = () => {
  const [view, setView] = useState<View>("list");
  const [reviewLoading, setReviewLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    issues,
    loading: issuesLoading,
    refetch: refetchIssues,
  } = useIssues();
  const { issue, loading: issueLoading, loadIssue } = useIssueDetail();
  const { message, type, showStatus } = useStatusMessage();

  useEffect(() => {
    const state = location.state as any;
    if (state?.fromCreateRelease) {
      if (state.issueNumber) {
        loadIssue(state.issueNumber);
        setView("detail");
      } else {
        setView("create");
      }
    }
  }, [location.state]);

  const handleIssueClick = async (issueNumber: number) => {
    await loadIssue(issueNumber);
    setView("detail");
  };

  const handleCreateIssue = async (formData: IssueFormData) => {
    if (!formData.project) {
      showStatus("Please select a project", "error");
      return;
    }

    try {
      const body = `@d4dassistant Create a new D4D for ${formData.project}

Documentation URLs:
${formData.urls || "No URLs provided"}

Additional Instructions:
${formData.instructions || "No additional instructions"}`;

      await createIssue(
        `D4D for ${formData.project}`,
        body,
        ["d4d-assistant"],
        formData.files,
      );

      showStatus("Issue created successfully!", "success");
      await refetchIssues();
      navigate("/review");
    } catch (error) {
      showStatus(
        `Error creating issue: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error",
      );
    }
  };

  const handleAddComment = async (comment: string) => {
    if (!issue) return;

    try {
      await addComment(issue.number, comment);
      showStatus("Comment added!", "success");
      await loadIssue(issue.number);
    } catch (error) {
      showStatus(
        `Error adding comment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error",
      );
    }
  };

  const handleReview = async () => {
    if (!issue) return;

    setReviewLoading(true);

    try {
      const issueUrl = (issue as any).html_url || (issue as any).url;
      if (!issueUrl) {
        throw new Error("Issue URL not available");
      }

      const response = await fetch("/api/llmassist/from-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue_number: issue.number,
          issue_title: issue.title,
          issue_body: issue.body,
          issue_comments: issue.comments,
          yaml_url: extractYamlUrlFromComments(issue.comments),
          issue_url: issueUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to process D4D");

      const { rocrate, provenance } = await response.json();

      showStatus("D4D ready for review!", "success");
      navigate("/review", {
        state: {
          fromD4D: true,
          rocrate,
          provenance,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      showStatus(`Error: ${message}`, "error");
    }
    setReviewLoading(false);
  };

  const handleBack = () => {
    navigate("/review");
  };

  return (
    <PageContainer>
      <StatusMessage message={message} type={type} />

      {view === "list" && (
        <IssueListView
          issues={issues}
          loading={issuesLoading}
          onIssueClick={handleIssueClick}
          onCreateClick={() => setView("create")}
        />
      )}

      {view === "create" && (
        <CreateIssueView
          onBack={handleBack}
          onSubmit={handleCreateIssue}
          loading={issuesLoading}
        />
      )}

      {view === "detail" && issue && (
        <IssueDetailView
          issue={issue}
          onBack={handleBack}
          onAddComment={handleAddComment}
          onReview={handleReview}
          loading={issueLoading || reviewLoading}
        />
      )}
    </PageContainer>
  );
};

export default D4DAssistantPage;

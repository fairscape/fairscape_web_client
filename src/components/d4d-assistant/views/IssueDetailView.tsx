import React, { useState } from "react";
import { IssueDetail } from "../types/issue.types";
import { DetailInfoBanner } from "../components/InfoBanner";
import { CommentSection } from "../components/CommentSection";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  PageHeader,
  BackButton,
  Title,
  IssueMetadata,
} from "../styles/D4DAssistant.styles";

interface IssueDetailViewProps {
  issue: IssueDetail;
  onBack: () => void;
  onAddComment: (comment: string) => Promise<void>;
  onReview: () => Promise<void>;
  loading: boolean;
}

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({
  issue,
  onBack,
  onAddComment,
  onReview,
  loading,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReview = async () => {
    await onReview();
    setShowConfirm(false);
  };

  return (
    <>
      <PageHeader>
        <BackButton onClick={onBack}>← Back</BackButton>
        <Title>
          #{issue.number} {issue.title}
        </Title>
        <IssueMetadata>
          Opened by {issue.user} on{" "}
          {new Date(issue.created_at).toLocaleDateString()}
        </IssueMetadata>
      </PageHeader>

      <DetailInfoBanner />

      <CommentSection
        issueBody={issue.body}
        issueUser={issue.user}
        issueCreatedAt={issue.created_at}
        comments={issue.comments}
        onAddComment={onAddComment}
        onReviewClick={() => setShowConfirm(true)}
        loading={loading}
      />

      <ConfirmDialog
        show={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleReview}
        loading={loading}
      />
    </>
  );
};

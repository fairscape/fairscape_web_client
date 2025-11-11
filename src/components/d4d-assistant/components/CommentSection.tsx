import React, { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Comment as CommentType } from "../types/issue.types";
import {
  Section,
  SectionTitle,
  HelpText,
  Textarea,
  ButtonGroup,
  ReviewButton,
  SubmitButton,
  Comment,
  CommentHeader,
  CommentAuthor,
  CommentDate,
  CommentBody,
  IssueBody,
} from "../styles/D4DAssistant.styles";
import {
  extractD4DYamlUrl,
  generateUrlRequestMessage,
} from "../utils/d4dUrlExtractor";

interface CommentSectionProps {
  issueBody: string;
  issueUser: string;
  issueCreatedAt: string;
  comments: CommentType[];
  onAddComment: (comment: string) => Promise<void>;
  onReviewClick: () => void;
  loading: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  issueBody,
  issueUser,
  issueCreatedAt,
  comments,
  onAddComment,
  onReviewClick,
  loading,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment("");
  };

  const hasD4DUrl = extractD4DYamlUrl(comments) !== null;

  const handleReviewClick = () => {
    if (!hasD4DUrl) {
      setNewComment(generateUrlRequestMessage());
    } else {
      onReviewClick();
    }
  };

  return (
    <>
      <Section>
        <IssueBody>
          <CommentHeader>
            <CommentAuthor>{issueUser}</CommentAuthor>
            <CommentDate>
              {new Date(issueCreatedAt).toLocaleString()}
            </CommentDate>
          </CommentHeader>
          <CommentBody>{issueBody}</CommentBody>
        </IssueBody>
      </Section>

      {comments.length > 0 && (
        <Section>
          <SectionTitle>Comments</SectionTitle>
          {comments.map((comment) => (
            <Comment key={comment.id}>
              <CommentHeader>
                <CommentAuthor>{comment.user}</CommentAuthor>
                <CommentDate>
                  {new Date(comment.created_at).toLocaleString()}
                </CommentDate>
              </CommentHeader>
              <CommentBody>{comment.body}</CommentBody>
            </Comment>
          ))}
        </Section>
      )}

      <Section>
        <SectionTitle>Add Comment</SectionTitle>
        <HelpText style={{ marginBottom: "10px" }}>
          Request changes, ask questions, or provide additional context to the
          AI assistant.
        </HelpText>
        <Textarea
          rows={6}
          placeholder="Example: Please add information about the sample size and data collection timeline. Also, can you include details about the ethical review process mentioned in ethics_approval.pdf?"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <ButtonGroup>
          <ReviewButton onClick={handleReviewClick} disabled={loading}>
            <FiCheckCircle size={18} />
            {hasD4DUrl ? "Review Created D4D" : "Request D4D Link"}
          </ReviewButton>
          <SubmitButton onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Comment"}
          </SubmitButton>
        </ButtonGroup>
      </Section>
    </>
  );
};

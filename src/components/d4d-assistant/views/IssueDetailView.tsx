import React, { useState } from "react";
import styled from "styled-components";
import {
  PageContainer,
  PageHeader,
  BackButton,
  Title,
  IssueMetadata,
  TwoColumnLayout,
  LeftColumn,
  RightColumn,
  Section,
  SectionTitle,
  IssueBody,
  Comment,
  CommentHeader,
  CommentAuthor,
  CommentDate,
  CommentBody,
  FormGroup,
  Label,
  Textarea,
  SubmitButton,
  ReviewButton,
} from "../styles/D4DAssistant.styles";
import { CheckCircle } from "lucide-react";

interface Issue {
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
  };
  comments: Array<{
    id: number;
    user: {
      login: string;
    };
    created_at: string;
    body: string;
  }>;
}

interface IssueDetailViewProps {
  issue: Issue;
  onBack: () => void;
  onAddComment: (comment: string) => void;
  onReview: () => void;
  loading: boolean;
}

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({
  issue,
  onBack,
  onAddComment,
  onReview,
  loading,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>← Back</BackButton>
        <Title>{issue.title}</Title>
        <IssueMetadata>
          Issue #{issue.number} • Created by {issue.user.login} on{" "}
          {new Date(issue.created_at).toLocaleDateString()}
        </IssueMetadata>
      </PageHeader>

      <TwoColumnLayout>
        <LeftColumn>
          <Section>
            <SectionTitle>Description</SectionTitle>
            <IssueBody>{issue.body}</IssueBody>
          </Section>

          <Section>
            <SectionTitle>Comments ({issue.comments.length})</SectionTitle>
            {issue.comments.map((comment) => (
              <Comment key={comment.id}>
                <CommentHeader>
                  <CommentAuthor>{comment.user.login}</CommentAuthor>
                  <CommentDate>
                    {new Date(comment.created_at).toLocaleString()}
                  </CommentDate>
                </CommentHeader>
                <CommentBody>{comment.body}</CommentBody>
              </Comment>
            ))}

            <FormGroup style={{ marginTop: 30 }}>
              <Label htmlFor="newComment">Add a comment</Label>
              <Textarea
                id="newComment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={5}
              />
            </FormGroup>

            <SubmitButton
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Add Comment
            </SubmitButton>
          </Section>
        </LeftColumn>

        <RightColumn>
          <StickySidebar>
            <SidebarCard>
              <SidebarTitle>Actions</SidebarTitle>
              <SidebarText>
                Run an automated pass and convert this issue to an RO-Crate.
              </SidebarText>

              <FullWidthReviewButton onClick={onReview} disabled={loading}>
                <CheckCircle size={18} />
                {loading ? "Processing..." : "Review & Convert to RO-Crate"}
              </FullWidthReviewButton>
            </SidebarCard>
          </StickySidebar>
        </RightColumn>
      </TwoColumnLayout>
    </PageContainer>
  );
};

/* ---- Minimal, page-matching sidebar styles ---- */

const StickySidebar = styled.aside`
  position: sticky;
  top: 20px;
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SidebarTitle = styled.h3`
  font-size: 1.2rem;
  color: #3e7aa8;
  margin: 0 0 12px 0;
`;

const SidebarText = styled.p`
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const FullWidthReviewButton = styled(ReviewButton)`
  width: 100%;
  justify-content: center;
`;

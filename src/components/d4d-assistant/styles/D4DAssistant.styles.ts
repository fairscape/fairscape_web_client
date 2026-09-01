import styled from "styled-components";

export const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
`;

export const PageHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  position: relative;
`;

export const BackButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  padding: 10px 20px;
  background: #51626b;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  color: #3e7aa8;
  margin-bottom: 10px;
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
`;

export const IssueMetadata = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-top: 10px;
`;

export const InfoBanner = styled.div`
  background: #ebf2f4;
  border: 2px solid #3e7aa8;
  border-radius: 2px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
`;

export const InfoBannerIcon = styled.div`
  color: #3e7aa8;
  flex-shrink: 0;
`;

export const InfoBannerContent = styled.div`
  flex: 1;
`;

export const InfoBannerTitle = styled.h3`
  font-size: 1.3rem;
  color: #3e7aa8;
  margin: 0 0 15px 0;
`;

export const InfoBannerText = styled.p`
  color: #333;
  line-height: 1.6;
  margin: 0 0 15px 0;
`;

export const InfoBannerList = styled.ul`
  margin: 0 0 15px 20px;
  padding: 0;
  color: #333;
  line-height: 1.8;

  li {
    margin-bottom: 5px;
  }
`;

export const InfoBannerWarning = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 2px;
  padding: 12px 15px;
  color: #856404;
  margin-top: 15px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    color: #856404;
  }
`;

export const AIInteractionBanner = styled.div`
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
`;

export const AIBannerIcon = styled.div`
  color: #4caf50;
  flex-shrink: 0;
`;

export const AIBannerContent = styled.div`
  flex: 1;
`;

export const AIBannerTitle = styled.h3`
  font-size: 1.3rem;
  color: #2e7d32;
  margin: 0 0 15px 0;
`;

export const AIBannerText = styled.p`
  color: #333;
  line-height: 1.6;
  margin: 0 0 15px 0;
`;

export const AIBannerSection = styled.div`
  margin: 20px 0;
`;

export const AIBannerSectionTitle = styled.h4`
  font-size: 1rem;
  color: #2e7d32;
  margin: 0 0 10px 0;
  font-weight: 600;
`;

export const AIBannerList = styled.ul`
  margin: 0 0 0 20px;
  padding: 0;
  color: #333;
  line-height: 1.8;

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #2e7d32;
  }
`;

export const AIBannerLink = styled.a`
  color: #2e7d32;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  margin-top: 10px;

  &:hover {
    text-decoration: underline;
  }
`;

export const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 30px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div``;

export const RightColumn = styled.div``;

export const Section = styled.div`
  background: white;
  border-radius: 2px;
  padding: 30px;
  margin-bottom: 20px;
`;

export const CreateCard = styled.div`
  background: white;
  border-radius: 2px;
  padding: 50px 40px;

  @media (max-width: 768px) {
    padding: 32px 20px;
  }
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

export const CreateIcon = styled.div`
  color: #3e7aa8;
  opacity: 0.3;
`;

export const CreateTitle = styled.h2`
  font-size: 1.8rem;
  color: #3e7aa8;
  margin: 0;
`;

export const CreateDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 2px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;

  &:hover {
    background: #218838;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #3e7aa8;
  margin: 0 0 20px 0;
`;

export const IssuesTable = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

export const TableBody = styled.div``;

export const StyledIssueRow = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f7f9f9;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const IssueTitle = styled.div`
  font-weight: 600;
  color: #3e7aa8;
  margin-bottom: 8px;
`;

export const IssueMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const IssueDate = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

export const IssueComments = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

export const Labels = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

export const IssueLabel = styled.span`
  background: #e7f3ff;
  color: #0366d6;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 0.75rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 25px;
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

export const InfoIcon = styled.div`
  color: #3e7aa8;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #2c5f8d;
  }
`;

export const HelpText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 8px 0;
  line-height: 1.5;

  strong {
    color: #333;
  }
`;

export const ExpandedHelp = styled.div`
  background: #f7f9f9;
  border-left: 3px solid #3e7aa8;
  padding: 20px;
  margin: 15px 0;
  border-radius: 2px;
`;

export const ExpandedHelpTitle = styled.h4`
  font-size: 1rem;
  color: #3e7aa8;
  margin: 0 0 10px 0;
  font-weight: 600;
`;

export const ExpandedHelpText = styled.p`
  font-size: 0.9rem;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.6;
`;

export const ExpandedHelpList = styled.ul`
  margin: 0 0 15px 20px;
  padding: 0;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.8;

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #3e7aa8;
  }
`;

export const ExpandedHelpExample = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  padding: 12px;
  margin-top: 10px;
  border-radius: 2px;
  font-size: 0.85rem;
  color: #333;
  font-family: monospace;
  line-height: 1.6;

  strong {
    color: #3e7aa8;
    font-family: inherit;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #3e7aa8;
  border-radius: 2px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2c5f8d;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #3e7aa8;
  border-radius: 2px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2c5f8d;
  }
`;

export const FileInputWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 2px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2c5f8d;
  }
`;

export const FilesList = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: #f7f9f9;
  border-radius: 2px;
`;

export const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #333;

  svg {
    color: #3e7aa8;
  }
`;

export const FileName = styled.span`
  font-weight: 500;
  flex: 1;
`;

export const FileSize = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

export const CancelButton = styled.button`
  padding: 12px 24px;
  background: white;
  color: #3e7aa8;
  border: 2px solid #3e7aa8;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f7fb;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SubmitButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 2px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #2c5a7a;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ReviewButton = styled.button`
  padding: 12px 24px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 2px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #2c5a7a;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const IssueBody = styled.div`
  background: #f7f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  padding: 20px;
`;

export const Comment = styled.div`
  background: #f7f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  padding: 20px;
  margin-bottom: 15px;
`;

export const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
`;

export const CommentAuthor = styled.div`
  font-weight: 600;
  color: #3e7aa8;
`;

export const CommentDate = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

export const CommentBody = styled.div`
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
`;

export const StatusMessage = styled.div<{ status: string }>`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 6px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  ${(props) =>
    props.status === "success" &&
    `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `}

  ${(props) =>
    props.status === "error" &&
    `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 15px;
`;

export const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3e7aa8;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingText = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  color: #ccc;
  margin-bottom: 15px;
`;

export const EmptyText = styled.div`
  font-size: 1rem;
  color: #666;
  font-weight: 600;
`;

export const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DialogOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

export const DialogContent = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

export const DialogTitle = styled.h3`
  font-size: 1.2rem;
  color: #3e7aa8;
  margin: 0;
`;

export const DialogBody = styled.div`
  margin-bottom: 25px;
`;

export const DialogText = styled.p`
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

export const DialogNote = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f0f8ff;
  border: 1px solid #3e7aa8;
  border-radius: 2px;
  margin-bottom: 12px;

  svg {
    animation: spin 2s linear infinite;
    color: #3e7aa8;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const DialogActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

export const DialogCancelButton = styled.button`
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

export const DialogConfirmButton = styled.button`
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

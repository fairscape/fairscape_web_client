import styled from "styled-components";

export const Header = styled.h2`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const DetailItemWrapper = styled.div`
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;

  strong {
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || theme.colors.text};
    margin-right: ${({ theme }) => theme.spacing.xs};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const KeywordsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};

  strong {
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || theme.colors.text};
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

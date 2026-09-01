import styled from "styled-components";

export const SectionHeader = styled.div`
  margin: 25px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.primary};
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.ink};
  margin-top: 0;
  margin-bottom: 0;
`;

export const SubcratesContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

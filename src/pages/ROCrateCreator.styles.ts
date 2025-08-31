import styled from "styled-components";

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  min-height: 100vh;
`;

export const Header = styled.header`
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
`;

export const PageTitle = styled.h1`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-weight: 600;
`;

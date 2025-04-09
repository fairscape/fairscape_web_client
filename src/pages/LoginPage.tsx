import React from "react";
import styled from "styled-components";
import Login from "../components/Auth/Login";

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const LoginPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle>Welcome to FAIRSCAPE</PageTitle>
      <Login />
    </PageContainer>
  );
};

export default LoginPage;

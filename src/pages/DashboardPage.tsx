import React from "react";
import styled from "styled-components";
import Dashboard from "../components/Dashboard/Dashboard";

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`;

const DashboardPage: React.FC = () => {
  return (
    <PageContainer>
      <Dashboard />
    </PageContainer>
  );
};

export default DashboardPage;

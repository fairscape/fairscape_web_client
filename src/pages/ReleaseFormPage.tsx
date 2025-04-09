import React from "react";
import styled from "styled-components";
import ReleaseForm from "../components/Forms/ReleaseForm";

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const Title = styled.h1`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  max-width: 800px;
  margin: 0 auto;
`;

const ReleaseFormPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <Title>Create RO-Crate Metadata</Title>
        <Description>
          Use this form to create metadata for your dataset. The form will
          generate a proper RO-Crate metadata JSON file that you can download
          and include with your dataset.
        </Description>
      </PageHeader>

      <ReleaseForm />
    </PageContainer>
  );
};

export default ReleaseFormPage;

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

const InstructionsContainer = styled.div`
  background-color: #f0f8ff;
  border-left: 4px solid #3e7aa8;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const InstructionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 10px;
`;

const InstructionList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const InstructionItem = styled.li`
  margin-bottom: 5px;
`;

const ReleaseFormPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <Title>Create RO-Crate Collection</Title>
        <Description>
          Use this form to create a collection of RO-Crate metadata. Upload your
          existing RO-Crate files, and the form will generate a comprehensive
          collection metadata file that includes all your datasets.
        </Description>
      </PageHeader>

      <InstructionsContainer>
        <InstructionTitle>How to use this form:</InstructionTitle>
        <InstructionList>
          <InstructionItem>
            Upload one or more RO-Crate metadata files (ro-crate-metadata.json)
          </InstructionItem>
          <InstructionItem>
            The form will automatically populate with aggregated information
            from your uploads
          </InstructionItem>
          <InstructionItem>
            Review and adjust the information as needed
          </InstructionItem>
          <InstructionItem>
            Download the collection metadata file
          </InstructionItem>
        </InstructionList>
      </InstructionsContainer>

      <ReleaseForm />
    </PageContainer>
  );
};

export default ReleaseFormPage;

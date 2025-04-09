import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Upload from "../components/Upload/Upload";

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

const PageDescription = styled.p`
  text-align: center;
  max-width: 700px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UploadPage: React.FC = () => {
  const { type } = useParams();

  return (
    <PageContainer>
      <PageTitle>RO-Crate Upload</PageTitle>
      <PageDescription>
        Upload your RO-Crate package to make your scientific data FAIR
        (Findable, Accessible, Interoperable, and Reusable).
      </PageDescription>
      <Upload />
    </PageContainer>
  );
};

export default UploadPage;

// src/components/Layout/Footer.tsx
import React from "react";
import styled from "styled-components";

const StyledFooter = styled.footer`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl}; // Ensure space above footer
  text-align: center;
  font-size: 0.9rem;
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; // Allow wrapping on smaller screens
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap; // Allow wrapping on smaller screens
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FooterLink = styled.a`
  color: white;
  text-decoration: underline;
  &:hover {
    color: #e0e0e0; // Lighter shade on hover
  }
`;

const Copyright = styled.div``;

const Notice = styled.div`
  font-style: italic;
  text-align: center;
  @media (max-width: 768px) {
    order: 2;
  }
`;

const Links = styled.div``;

const Footer: React.FC = () => {
  return (
    <StyledFooter>
      <FooterContent>
        <Copyright>
          © {new Date().getFullYear()} University of Virginia. All rights
          reserved.
        </Copyright>
        <Notice>
          This repository is under review for potential modification in
          compliance with Administration directives.
        </Notice>
        <Links>
          <FooterLink
            href="https://github.com/fairscape/"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </FooterLink>
        </Links>
      </FooterContent>
    </StyledFooter>
  );
};

export default Footer;

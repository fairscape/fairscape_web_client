// src/pages/HomePage.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const HeroSection = styled.section`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.primaryLight} 100%
  );
  color: white;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) =>
  theme.spacing.lg};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  margin-top 1;
`;

const HeroTitle = styled.h1`
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 2.8rem;
  font-weight: 700;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg} auto;
  opacity: 0.9;
`;

const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
`;

const StatNumber = styled.span`
  font-weight: bold;
  font-size: 1.4rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  padding-top 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OverviewSection = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
  height: 100%;
  display: flex;
  flex-direction: column;

  h2 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.8rem;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    padding-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    line-height: 1.6;
  }

  sup {
    font-size: 0.7rem;
    vertical-align: super;
  }

  .footnote-ref {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.secondary};
  }

  .external-link {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
    &:hover {
      color: ${({ theme }) => theme.colors.secondaryDark};
    }
  }
`;

const FeaturesSection = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
  height: 100%;
  display: flex;
  flex-direction: column;

  h2 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.8rem;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    padding-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const FeatureItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.secondary};
  }

  a {
    text-decoration: none;
    color: inherit;
    font-weight: 600;
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

interface FeatureDetailsProps {
  expanded: boolean;
}

const FeatureDetails = styled.div<FeatureDetailsProps>`
  opacity: ${({ expanded }) => (expanded ? 1 : 0.8)};
  max-height: ${({ expanded }) => (expanded ? "500px" : "auto")};
  transition: opacity 0.3s ease;
  line-height: 1.6;
  margin-top: ${({ theme }) => theme.spacing.xs};
  padding-left: ${({ theme }) => theme.spacing.sm};
  border-left: 3px solid
    ${({ theme, expanded }) =>
      expanded ? theme.colors.secondary : "transparent"};
  font-size: 0.95rem;
`;

const CtaSection = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const CtaButton = styled.a`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  border-radius: ${({ theme }) => theme.borderRadius};
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    text-decoration: none;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const HomePage: React.FC = () => {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const features = [
    {
      title: "FAIRSCAPE CLI",
      details:
        "A data validation and packaging utility for the FAIRSCAPE ecosystem. Provides a command line interface that allows client-side remote teams to create RO-Crates, structuring data for AI applications.",
      link: "https://fairscape.github.io/fairscape-cli/",
    },
    {
      title: "FAIRSCAPE GUI Client",
      details:
        "The FAIRSCAPE Electron App provides a user-friendly interface for packaging research objects and validating metadata, making it easier than ever to ensure your research data is FAIR (Findable, Accessible, Interoperable, and Reusable).",
      link: "https://github.com/fairscape/FairscapeGUIClient/releases/tag/1.0",
    },
    {
      title: "FAIRSCAPE MDS",
      details:
        "The Metadata Service (MDS) of the FAIRSCAPE application, is the core backend service responsible for metadata management. MDS is a RESTfull API implemented in python with the fastAPI framework. This service provides persistent globally unique identifiers (guids) as ARKS for many types of digital objects and maintains provenance metadata crucial for the AI-Readiness and explainability of the data science life-cycle.",
      link: "https://github.com/fairscape/mds_python",
    },
  ];

  return (
    <div>
      <HeroSection>
        <HeroTitle>Build AI-Ready Datasets with FAIRSCAPE</HeroTitle>
        <HeroSubtitle>
          FAIRSCAPE provides a comprehensive framework to ensure your scientific
          data is not only FAIR but also prepared for AI/ML applications,
          underpinned by complete provenance through Evidence Graphs for
          enhanced explainability.
        </HeroSubtitle>
        <HeroStats>
          <StatItem>
            <StatNumber>AI-Ready</StatNumber>
            <StatLabel>Primed for ML & Analytics</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>FAIR Foundation</StatNumber>
            <StatLabel>Findable, Accessible, Interoperable, Reusable</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>Evidence Graphs</StatNumber>
            <StatLabel>For XAI & Reproducibility</StatLabel>
          </StatItem>
        </HeroStats>
      </HeroSection>

      <MainContent>
        <OverviewSection>
          <h2>Framework Overview</h2>
          <p>
            FAIRSCAPE
            <sup id="fnref:1">
              <a className="footnote-ref" href="#fn:1">
                1
              </a>
            </sup>{" "}
            is a computational framework written in Python that supports the AI
            Ready Criteria{" "}
            <a
              href="https://www.biorxiv.org/content/10.1101/2024.10.23.619844v4.full.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              as detailed here
            </a>
            <sup id="fnref:2">
              <a className="footnote-ref" href="#fn:2">
                2
              </a>
            </sup>
            . It helps prepare components such as datasets, software,
            computations, runtime parameters, environment, and personnel
            involved in a computational analysis for AI/ML applications. It
            generates rich evidence supporting the AI-Readiness and
            explainability of the analysis by recording formal representations
            of the components and their interactions in the form of a graph
            called an Evidence Graph. For every computational result, FAIRSCAPE
            creates a machine-interpretable Evidence Graph whose nodes and edges
            may contain persistent identifiers with metadata resolvable to the
            underlying components, enhancing transparency and trust in AI-driven
            insights.
          </p>
          <p>
            FAIRSCAPE provides a command line client tool to package and
            validate the components with metadata, a schema generation and
            validation component for the datasets, and a REST API to perform
            various operations on the server-side.
          </p>
        </OverviewSection>

        <FeaturesSection>
          <h2>Key Features</h2>
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              onMouseEnter={() => setExpandedFeature(index)}
              onMouseLeave={() => setExpandedFeature(null)}
            >
              <h3>
                <a
                  href={feature.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {feature.title}
                </a>
              </h3>
              <FeatureDetails expanded={expandedFeature === index}>
                {feature.details}
              </FeatureDetails>
            </FeatureItem>
          ))}
        </FeaturesSection>
      </MainContent>

      <CtaSection>
        <h2>Get Started with Fairscape</h2>
        <p>
          Join the Fairscape community today and start making your scientific
          data AI-Ready and FAIR. Explore our documentation to learn more about
          how to get started.
        </p>
        <CtaButton
          href="https://github.com/fairscape/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit our GitHub
        </CtaButton>
      </CtaSection>
    </div>
  );
};

export default HomePage;

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  SectionHeader,
  TypeTag,
  Mono,
  CtaButton,
} from "../components/shared/DirectionA";

const Hero = styled.section`
  background-color: ${({ theme }) => theme.colors.hero};
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.07) 1px,
    transparent 1px
  );
  background-size: 26px 26px;
  color: white;
  padding: 64px 48px 0;
  text-align: left;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    padding: 40px 24px 0;
  }
`;

const HeroTitle = styled.h1`
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: clamp(2.2rem, 4.5vw, 3.4rem);
  line-height: 1.06;
  font-weight: 700;
  letter-spacing: -0.03em;
  max-width: 780px;
`;

const HeroSubtitle = styled.p`
  font-size: 17px;
  line-height: 1.65;
  max-width: 620px;
  margin: 24px 0 36px;
  color: ${({ theme }) => theme.colors.heroSub};
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  margin-top: 48px;
  padding: 28px 0 44px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.heroAccent};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #e4edef;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl} 48px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const OverviewSection = styled.section`
  display: flex;
  flex-direction: column;

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-size: 15px;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  sup {
    font-size: 0.7rem;
    vertical-align: super;
  }

  .footnote-ref {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary};
  }

  .external-link {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    &:hover {
      color: ${({ theme }) => theme.colors.primaryDark};
    }
  }
`;

const FeaturesSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const FeatureRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }

  h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0;
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;

    &:hover {
      color: ${({ theme }) => theme.colors.primaryDark};
    }
  }
`;

const FeatureIndex = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.ink3};
  padding-top: 3px;
`;

const FeatureDetails = styled.div`
  line-height: 1.6;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GetStartedSection = styled.section`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};

  h2 {
    font-size: 26px;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ReleasesSection = styled.section`
  max-width: 1600px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl} 48px;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const ReleaseGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ReleaseCard = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 24px 26px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background-color: ${({ theme }) => theme.colors.primaryTint};
  }
`;

const ReleaseCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ReleaseTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.ink};
`;

const ReleaseArk = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.ink3};
  word-break: break-all;
  margin-bottom: 12px;
`;

const ReleaseDescription = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReleaseLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-bottom: 14px;

  a {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 12.5px;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const ReleaseCta = styled.span`
  margin-top: auto;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const FEATURED_RELEASES = [
  {
    ark: "ark:59853/rocrate-cell-maps-for-artificial-intelligence-June-2026-data-release",
    title:
      "Cell Maps for Artificial Intelligence — June 2026 Data Release (Beta)",
    version: "1.0",
    doi: "https://doi.org/10.18130/V3/HIGT4C",
    releaseDate: "2026-06-29",
    contentSize: "19.9 TB",
    description:
      "The June 2026 Data Release of Cell Maps for Artificial Intelligence (CM4AI; CM4AI.org), the Functional Genomics Grand Challenge in the NIH Bridge2AI program. This Beta release includes perturb-seq data in undifferentiated KOLF2.1J iPSCs; SEC-MS data in iPSCs and iPSC-derived NPCs, neurons, and cardiomyocytes; AP-MS data in MDA-MB-468 breast cancer cells under chemotherapy; and IF images in MDA-MB-468 cells with and without chemotherapy — all packaged with provenance graphs and rich metadata as AI-ready RO-Crates via the FAIRSCAPE framework.",
  },
  {
    ark: "ark:59853/rocrate-cm4ai-u2os-cell-map-release",
    title:
      "Cell Maps for Artificial Intelligence (CM4AI) — U2OS Cell Map Release",
    version: "1.0",
    doi: "https://doi.org/10.18130/V3/164SI1",
    releaseDate: "2026-07-08",
    contentSize: "11.43 GB",
    description:
      "An AI-ready, provenance-tracked reconstruction of a multi-scale cell map for the human U2OS cell line, integrating protein subcellular localization from HPA immunofluorescence imaging with protein–protein interactions from BioPlex AP-MS, following Schaffer, Hu, Qian et al. (Nature, 2025). The release is a chain of FAIRSCAPE RO-Crates spanning image/PPI download, embedding, MUSE co-embedding, HiDeF hierarchy generation, and enrichment-based evaluation.",
  },
];

const FEATURES = [
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

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Hero>
        <HeroTitle>Build AI-Ready Datasets with FAIRSCAPE</HeroTitle>
        <HeroSubtitle>
          FAIRSCAPE provides a comprehensive framework to ensure your scientific
          data is not only FAIR but also prepared for AI/ML applications,
          underpinned by complete provenance through Evidence Graphs for
          enhanced explainability.
        </HeroSubtitle>
        <HeroStats>
          <StatItem>
            <StatLabel>AI-Ready</StatLabel>
            <StatValue>Primed for ML &amp; Analytics</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>FAIR Foundation</StatLabel>
            <StatValue>Findable, Accessible, Interoperable, Reusable</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Evidence Graphs</StatLabel>
            <StatValue>For XAI &amp; Reproducibility</StatValue>
          </StatItem>
        </HeroStats>
      </Hero>

      <ReleasesSection>
        <SectionHeader title="Featured Releases" />
        <ReleaseGrid>
          {FEATURED_RELEASES.map((release) => (
            <ReleaseCard
              key={release.ark}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/view/${release.ark}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/view/${release.ark}`);
                }
              }}
            >
              <ReleaseCardHeader>
                <TypeTag>Release</TypeTag>
                <Mono>v{release.version}</Mono>
                {release.releaseDate && <Mono>{release.releaseDate}</Mono>}
                {release.contentSize && <Mono>{release.contentSize}</Mono>}
              </ReleaseCardHeader>
              <ReleaseTitle>{release.title}</ReleaseTitle>
              <ReleaseArk>{release.ark}</ReleaseArk>
              <ReleaseDescription>{release.description}</ReleaseDescription>
              <ReleaseLinks>
                <a
                  href={release.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {release.doi.replace("https://doi.org/", "DOI ")}
                </a>
              </ReleaseLinks>
              <ReleaseCta>View release →</ReleaseCta>
            </ReleaseCard>
          ))}
        </ReleaseGrid>
      </ReleasesSection>

      <MainContent>
        <OverviewSection>
          <SectionHeader index="01" title="Framework Overview" />
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
          <p>
            Every release produced by FAIRSCAPE is an RO-Crate that conforms to
            the{" "}
            <a
              href="https://w3id.org/fairscape/profile/0.1"
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              Fairscape Release RO-Crate Profile v0.1
            </a>
            , a versioned specification built on RO-Crate 1.2, the EVI ontology,
            PROV-O, Schema.org, and Croissant 1.0.
          </p>
        </OverviewSection>

        <FeaturesSection>
          <SectionHeader index="02" title="Key Features" />
          {FEATURES.map((feature, index) => (
            <FeatureRow key={index}>
              <FeatureIndex>{String(index + 1).padStart(2, "0")}</FeatureIndex>
              <div>
                <h3>
                  <a
                    href={feature.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {feature.title} ↗
                  </a>
                </h3>
                <FeatureDetails>{feature.details}</FeatureDetails>
              </div>
            </FeatureRow>
          ))}
        </FeaturesSection>
      </MainContent>

      <GetStartedSection>
        <h2>Get Started with Fairscape</h2>
        <p>
          Join the Fairscape community today and start making your scientific
          data AI-Ready and FAIR. Explore our documentation to learn more about
          how to get started.
        </p>
        <CtaButton
          as="a"
          href="https://github.com/fairscape/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit our GitHub
        </CtaButton>
      </GetStartedSection>
    </div>
  );
};

export default HomePage;

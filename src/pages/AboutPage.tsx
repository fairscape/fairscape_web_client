// src/pages/AboutPage.tsx
import React from "react";
import styled from "styled-components";
import { useState } from "react";

const PageContainer = styled.div`
  max-width: 1000px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`;

const HeaderSection = styled.header`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryLight} 0%,
    ${({ theme }) => theme.colors.secondaryLight} 100%
  );
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryDark};
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg} auto;
  opacity: 0.9;
  line-height: 1.6;
`;

const ContentSection = styled.section`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

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
    line-height: 1.7;
    font-size: 1.05rem;
  }

  a {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: none;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
      color: ${({ theme }) => theme.colors.secondaryDark};
    }
  }
`;

const PublicationList = styled.ul`
  list-style-type: none;
  padding-left: 0;

  li {
    background-color: ${({ theme }) => theme.colors.background};
    padding: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    transition: box-shadow 0.2s ease-in-out;

    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    }
  }

  h3 {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.primaryDark};
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .authors {
    font-style: italic;
    color: ${({ theme }) => theme.colors.textOffset};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: 0.95rem;
  }

  .journal-info {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .abstract {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    max-height: 120px; /* Limit initial height */
    overflow: hidden;
    text-overflow: ellipsis; /* Not perfectly effective for multi-line */
    position: relative;
  }

  .abstract.expanded {
    max-height: none;
  }

  .read-more {
    color: ${({ theme }) => theme.colors.secondary};
    cursor: pointer;
    font-weight: bold;
    font-size: 0.9rem;
    display: inline-block;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const AboutPage: React.FC = () => {
  const [expandedAbstract, setExpandedAbstract] = useState<number | null>(null);

  const toggleAbstract = (index: number) => {
    setExpandedAbstract(expandedAbstract === index ? null : index);
  };

  const publications = [
    {
      title:
        "FAIRSCAPE: An Evolving AI-readiness Framework for Biomedical Research",
      authors:
        "Sadnan Al Manir†, Maxwell Adam Levinson, Justin Niestroy, Christopher Churas, Jillian A. Parker, & Timothy Clark",
      affiliations:
        "1 University of Virginia School of Medicine; 2 University of California San Diego School of Medicine; 3 University of Virginia School of Data Science",
      link: "https://www.biorxiv.org/content/10.1101/2024.12.23.629818v3.full.pdf",
      journal:
        "bioRxiv Preprint (Posted May 6, 2025 - Note: date in PDF differs)",
      abstract: `Motivation: Artificial intelligence (AI) applications require explainability (XAI) for FAIR, ethical deployment, whether in the clinic or in the laboratory. Richly descriptive XAI metadata representing how pre-model data were obtained, characterized, transformed, and distributed, should be available along with the data prior to training and application of AI models.
        Results: The FAIRSCAPE framework generates, packages, and integrates critical pre-model XAI descriptive metadata, including deep provenance graphs and data dictionaries with feature validation on uploaded data, software, and computations, with special reference to biomedical datasets. It provides ethical and semantic characterization of the dataset along with licensing and availability information, and integrates seamlessly with NIH-recommended generalist repositories. The server is cloud-compliant and implemented in Python3. Client software in Python3 is callable from the command line or directly as python functions. We provide a REST API, and a GUI-based client in javascript is also available.`,
    },
    {
      title:
        "FAIRSCAPE: a Framework for FAIR and Reproducible Biomedical Analytics",
      authors:
        "Maxwell Adam Levinson, Justin Niestroy, Sadnan Al Manir, Karen Fairchild, Douglas E. Lake, J. Randall Moorman & Timothy Clark",
      journal:
        "Neuroinformatics (2022) 20:187–202. Published online: 15 July 2021",
      link: "https://link.springer.com/article/10.1007/s12021-021-09529-4",
      abstract:
        "Results of computational analyses require transparent disclosure of their supporting resources, while the analyses themselves often can be very large scale and involve multiple processing steps separated in time. Evidence for the correctness of any analysis should include not only a textual description, but also a formal record of the computations which produced the result, including accessible data and software with runtime parameters, environment, and personnel involved. This article describes FAIRSCAPE, a reusable computational framework, enabling simplified access to modern scalable cloud-based components. FAIRSCAPE fully implements the FAIR data principles and extends them to provide fully FAIR Evidence, including machine-interpretable provenance of datasets, software and computations, as metadata for all computed results. The FAIRSCAPE microservices framework creates a complete Evidence Graph for every computational result...",
    },
    {
      title: "AI-readiness for Biomedical Data: Bridge2AI Recommendations",
      authors:
        "Timothy Clark, Harry Caufield, Jillian A. Parker, Sadnan Al Manir, Edilberto Amorim, James Eddy, Nayoon Gim, Brian Gow, Wesley Goar, Melissa Haendel, Jan N. Hansen, Nomi Harris, Henning Hermjakob, Marcin Joachimiak, Gianna Jordan, In-Hee Lee, Shannon K. McWeeney, Camille Nebeker, Milen Nikolov, Jamie Shaffer, Nathan Sheffield, Gloria Sheynkman, James Stevenson, Jake Y. Chen, Chris Mungall, Alex Wagner, Sek Won Kong, Satrajit S. Ghosh, Bhavesh Patel, Andrew Williams, Monica C. Munoz-Torres*",
      journal: "bioRxiv Preprint (Posted November 24, 2024)",
      link: "https://www.biorxiv.org/content/10.1101/2024.10.23.619844v4.full.pdf",
      abstract:
        "Biomedical research and clinical practice are in the midst of a transition toward significantly increased use of artificial intelligence (AI) and machine learning (ML) methods. These advances promise to enable qualitatively deeper insight into complex challenges formerly beyond the reach of analytic methods and human intuition while placing increased demands on ethical and explainable artificial intelligence (XAI), given the opaque nature of many deep learning methods. The U.S. National Institutes of Health (NIH) has initiated a significant research and development program, Bridge2AI, aimed at producing new “flagship” datasets designed to support AI/ML analysis of complex biomedical challenges, elucidate best practices, develop tools and standards in AI/ML data science, and disseminate these datasets, tools, and methods broadly to the biomedical community. An essential set of concepts to be developed and disseminated in this program along with the data and tools produced are criteria for AI-readiness of data, including critical considerations for XAI and ethical, legal, and social implications (ELSI) of AI technologies...",
    },
    {
      title:
        "Evidence Graphs: Supporting Transparent and FAIR Computation, with Defeasible Reasoning on Data, Methods, and Results",
      authors:
        "Sadnan Al Manir, Justin Niestroy, Maxwell Adam Levinson, Timothy Clark",
      journal:
        "In: Glavic B, Braganholo V, Koop D, eds. Provenance and Annotation of Data and Processes. Vol 12839. Lecture Notes in Computer Science. Springer International Publishing; 2021:39-50.",
      link: "https://link.springer.com/chapter/10.1007/978-3-030-80960-7_3",
      abstract:
        "Results of computational analyses require transparent disclosure of their supporting resources, while the analyses themselves often can be very large scale and involve multiple processing steps separated in time. Evidence for the correctness of any analysis should include not only a textual description, but also a formal record of the computations which produced the result, including accessible data and software with runtime parameters, environment, and personnel involved. This article describes FAIRSCAPE, a reusable computational framework, enabling simplified access to modern scalable cloud-based components. FAIRSCAPE fully implements the FAIR data principles and extends them to provide fully FAIR Evidence, including machine-interpretable provenance of datasets, software and computations, as metadata for all computed results. The FAIRSCAPE microservices framework creates a complete Evidence Graph for every computational result...",
    },
  ];

  return (
    <PageContainer>
      <HeaderSection>
        <PageTitle>About FAIRSCAPE</PageTitle>
        <PageSubtitle>
          FAIRSCAPE is an advanced computational framework designed to ensure
          scientific data is AI-Ready and adheres to FAIR principles. It
          facilitates the creation of transparent, reproducible, and explainable
          biomedical research.
        </PageSubtitle>
      </HeaderSection>

      <ContentSection>
        <h2>Background & Development</h2>
        <p>
          The FAIRSCAPE framework was developed at the University of Virginia
          (UVA) School of Medicine and School of Data Science, in collaboration
          with the UVA Center for Advanced Medical Analytics. Its initial
          development was aimed at applications in critical care medicine,
          evolving to encompass functional genomics and broader clinical
          applications.
        </p>
        <p>
          FAIRSCAPE serves as the AI-readiness framework for the{" "}
          <a
            href="https://commonfund.nih.gov/bridge2ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            NIH Bridge to Artificial Intelligence (Bridge2AI) Program
          </a>
          . In this role, FAIRSCAPE supports the generation of "flagship"
          AI-ready datasets by tracking comprehensive metadata, including
          provenance and data quality, essential for ethical and robust AI/ML
          model development. It is continuously developed in line with the
          AI-readiness criteria established by the Bridge2AI Standards Working
          Group.
        </p>
        <p>
          Our core mission is to empower researchers by providing tools that
          seamlessly integrate AI-Readiness and FAIR principles into their
          workflows, thereby accelerating discovery and enhancing the
          reliability of biomedical science.
        </p>
      </ContentSection>

      <ContentSection>
        <h2>Publications</h2>
        <p>
          The research and development of FAIRSCAPE and its underlying
          principles have been documented in several scientific publications.
        </p>
        <PublicationList>
          {publications.map((pub, index) => (
            <li key={index}>
              <h3>
                <a href={pub.link} target="_blank" rel="noopener noreferrer">
                  {pub.title}
                </a>
              </h3>
              <p className="authors">{pub.authors}</p>
              {pub.affiliations && (
                <p className="journal-info">{pub.affiliations}</p>
              )}
              <p className="journal-info">{pub.journal}</p>
              {pub.abstract && (
                <>
                  <p
                    className={`abstract ${
                      expandedAbstract === index ? "expanded" : ""
                    }`}
                  >
                    {pub.abstract}
                  </p>
                  <span
                    className="read-more"
                    onClick={() => toggleAbstract(index)}
                  >
                    {expandedAbstract === index ? "Read Less" : "Read More..."}
                  </span>
                </>
              )}
            </li>
          ))}
        </PublicationList>
      </ContentSection>
    </PageContainer>
  );
};

export default AboutPage;

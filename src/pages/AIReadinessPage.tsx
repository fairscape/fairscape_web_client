import React, { useState } from "react";
import styled from "styled-components";

// The criteria data is now embedded directly as a constant
const criteriaData = [
  {
    id: "computability",
    title: "Computability",
    subtitle:
      "Standardized\nComputational Accessibility\nPortable\nContextualized",
    color: "#95a5a6",
    angle: 0,
    score: 4,
    maxScore: 4,
    hasMetCriteria: true,
    description:
      "Ensuring AI systems can effectively process and analyze your data through standardized formats, computational accessibility, portable architectures, and proper contextualization.",
    details:
      "CM4AI provides data in multiple standardized formats (e.g., fastq.gz, h5, h5mu) accessible for AI processing via public repositories (NCBI, MassIVE, UVA Dataverse). The entire collection is packaged with comprehensive metadata and context using the FAIRSCAPE framework and RO-Crate.",
    criteria: [
      "Standardized",
      "Computational Accessibility",
      "Portable",
      "Contextualized",
    ],
    metadata: {
      "Standardized Formats":
        "fastq.gz, h5, h5mu, .tsv, .xml, .csv, image/jpeg, .pdf, .d, .zip",
      "Total Data Volume": "19.1 TB across 101,533 files",
      Accessibility:
        "Available through multiple public repositories (NCBI, MassIVE, UVA Dataverse)",
      Contextualization:
        "Rich metadata and provenance graphs packaged in RO-Crate format using the FAIRSCAPE framework.",
    },
  },
  {
    id: "fairness",
    title: "FAIRness",
    subtitle: "Findable\nAccessible\nInteroperable\nReusable",
    color: "#d35400",
    angle: 51.43,
    score: 4,
    maxScore: 4,
    hasMetCriteria: true,
    description:
      "Following FAIR principles to make data and AI systems Findable, Accessible, Interoperable, and Reusable for maximum impact and collaboration.",
    details:
      "CM4AI fully implements FAIR principles by assigning persistent identifiers (DOI and ARK) for findability, providing data under a clear Creative Commons license for accessibility and reusability, and using standardized formats like RO-Crate with JSON-LD for interoperability.",
    criteria: ["Findable", "Accessible", "Interoperable", "Reusable"],
    metadata: {
      Findable:
        "DOI: https://doi.org/10.18130/V3/B35XWX, ARK ID: ark:59852/cm4ai-june-2025-release",
      Accessible:
        "Data and metadata available under a Creative Commons BY-NC-SA 4.0 license via multiple public repositories.",
      Interoperable:
        "Data packaged in RO-Crate format with metadata described using schema.org in JSON-LD.",
      Reusable:
        "Clear CC BY-NC-SA 4.0 license, explicit terms of use, and detailed provenance graphs to support verification and reuse.",
    },
  },
  {
    id: "provenance",
    title: "Provenance",
    subtitle: "Transparent\nTraceable\nInterpretable\nKey Actors identified",
    color: "#3498db",
    angle: 102.86,
    score: 4,
    maxScore: 4,
    hasMetCriteria: true,
    description:
      "Maintaining clear records of data lineage, decision processes, and key stakeholders to ensure transparency and accountability in AI systems.",
    details:
      "CM4AI provides complete provenance for each dataset, including detailed experimental documentation, traceable data processing steps via FAIRSCAPE provenance graphs, and clear attribution of all contributors and their institutions.",
    criteria: [
      "Transparent",
      "Traceable",
      "Interpretable",
      "Key Actors identified",
    ],
    metadata: {
      "Experimental Provenance":
        "192 RNA-Seq experiments, 90 computational processes, and 944 IF imaging experiments documented in sub-crates.",
      "Data Lineage":
        "Data derived from specified commercial cell lines (KOLF2.1J, MDA-MB-468) with processing steps from raw to derived data tracked.",
      "Key Contributors":
        "PI: Trey Ideker (UCSD), with key data generation from the labs of Nevan Krogan (UCSF) and Emma Lundberg (Stanford), and 47+ total authors.",
      Transparency:
        "Visual and machine-readable provenance graphs are available for each sub-dataset, linking inputs, processes, and outputs.",
    },
  },
  {
    id: "characterization",
    title: "Characterization",
    subtitle:
      "Semantics\nStatistics\nStandards\nPotential Sources of Bias\nData Quality",
    color: "#27ae60",
    angle: 154.29,
    score: 5,
    maxScore: 5,
    hasMetCriteria: true,
    description:
      "Thoroughly understanding and documenting the semantic meaning, statistical properties, quality metrics, and potential biases in your data and AI systems.",
    details:
      "CM4AI provides comprehensive characterization with semantic standards (RO-Crate), detailed data statistics, documented compliance with NIH data standards, and explicit acknowledgment of potential biases.",
    criteria: [
      "Semantics",
      "Statistics",
      "Standards",
      "Potential Sources of Bias",
      "Data Quality",
    ],
    metadata: {
      "Semantic Standards":
        "All data packaged within RO-Crates, with associated schemas and a JSON-LD context for machine readability.",
      "Data Statistics":
        "11,739 targeted genes (Perturb-seq), 464 proteins (IF imaging), 19.1TB total data volume.",
      "Standards Compliance":
        "RO-Crate 1.2, Creative Commons BY-NC-SA 4.0, NIH data sharing policies.",
      "Bias Documentation":
        "Data in this release was derived from commercially available de-identified human cell lines, and does not represent all biological variants which may be seen in the population at large.",
      "Quality Metrics":
        "Cellranger-validated SRA data with quality control reports available in sub-crates. Data integrity verifiable via MD5 checksums.",
    },
  },
  {
    id: "explainability",
    title: "Pre-Model Explainability",
    subtitle: "Data Documentation Templates\nFit for Purpose\nVerifiable",
    color: "#f39c12",
    angle: 205.72,
    score: 3,
    maxScore: 3,
    hasMetCriteria: true,
    description:
      "Establishing clear documentation, purpose alignment, and verification processes before model development to ensure explainable AI outcomes.",
    details:
      "CM4AI establishes strong pre-model foundations with a comprehensive HTML datasheet, explicit definitions of intended and prohibited uses for AI applications, and verifiable data integrity through checksums and published, reproducible protocols.",
    criteria: ["Data Documentation Templates", "Fit for Purpose", "Verifiable"],
    metadata: {
      "Data Documentation Templates":
        "A detailed HTML datasheet and standardized RO-Crate metadata are provided for the entire collection.",
      "Fit for Purpose":
        "AI-ready datasets to support research in functional genomics, AI model training, cellular process analysis, cell architectural changes, and interactions in presence of specific disease processes, treatment conditions, or genetic perturbations. A major goal is to enable visible machine learning applications, as proposed in Ma et al. (2018) Nature Methods.",
      Verification:
        "Data integrity verifiable via MD5 checksums. Methodologies are verifiable through related publications and detailed provenance graphs.",
      "Prohibited Use":
        "These laboratory data are not to be used in clinical decision-making or in any context involving patient care without appropriate regulatory oversight and approval.",
    },
  },
  {
    id: "ethics",
    title: "Ethics",
    subtitle:
      "Ethically Acquired\nEthically Managed\nEthically Disseminated\nSecure",
    color: "#2980b9",
    angle: 257.15,
    score: 4,
    maxScore: 4,
    hasMetCriteria: true,
    description:
      "Ensuring all aspects of AI development follow ethical guidelines for data acquisition, management, dissemination, and security practices.",
    details:
      "CM4AI adheres to comprehensive ethical practices, using de-identified commercial cell lines (no direct human subjects research), overseen by a Data Governance Committee and external ethical reviewers, with clear licensing and usage restrictions for dissemination.",
    criteria: [
      "Ethically Acquired",
      "Ethically Managed",
      "Ethically Disseminated",
      "Secure",
    ],
    metadata: {
      "Ethical Acquisition":
        "Human Subjects Research: No. Data is derived from de-identified commercial cell lines.",
      "Ethical Management":
        "Oversight by a named Data Governance Committee and external ethical review board members.",
      "Ethical Review":
        "Vardit Ravitsky (The Hastings Center) and Jean-Christophe Belisle-Pipon (SFU) are named as ethical reviewers.",
      "Secure Dissemination":
        "Data disseminated under a CC BY-NC-SA 4.0 license with clear terms of use and prohibited clinical applications stated. HL7 Confidentiality Level is 'Unrestricted'.",
    },
  },
  {
    id: "sustainability",
    title: "Sustainability",
    subtitle: "Persistent\nDomain-appropriate\nWell-governed\nAssociated",
    color: "#16a085",
    angle: 308.58,
    score: 4,
    maxScore: 4,
    hasMetCriteria: true,
    description:
      "Building AI systems that are environmentally sustainable, domain-appropriate, well-governed, and properly associated with organizational goals.",
    details:
      "CM4AI ensures long-term value through a clear maintenance plan with institutional commitment for preservation, governance by a multi-institutional collaboration, and domain-appropriate data and formats for functional genomics.",
    criteria: [
      "Persistent",
      "Domain-appropriate",
      "Well-governed",
      "Associated",
    ],
    metadata: {
      Persistence:
        "Long term preservation in UVA Dataverse, supported by committed institutional funds.",
      "Domain Appropriateness":
        "Functional genomics data deposited in domain-appropriate repositories (NCBI/SRA, MassIVE) and using standard file formats.",
      Governance:
        "A multi-institutional collaboration (UCSD, UCSF, Stanford, etc.) with a named PI and Data Governance Committee.",
      "Maintenance Plan":
        "Dataset will be regularly updated and augmented through the end of the project in November 2026, on a quarterly basis.",
    },
  },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
`;

const WheelContainer = styled.div`
  position: relative;
  width: min(80vh, 80vw);
  height: min(80vh, 80vw);
  max-width: 600px;
  max-height: 600px;
  aspect-ratio: 1;
`;

const SVGWheel = styled.svg`
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: visible;
`;

const Segment = styled.g`
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    transform-origin: center;
  }
`;

const SegmentPath = styled.path`
  stroke: white;
  stroke-width: 3;
  transition: all 0.3s ease;
`;

const SegmentText = styled.text`
  font-family: "Arial", sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: white;
  pointer-events: none;
`;

const CenterCircle = styled.circle`
  fill: white;
  stroke: #34495e;
  stroke-width: 4;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const CenterContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45%;
  height: 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const CenterTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const CenterDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
`;

const DetailPanel = styled.div`
  margin-top: 2rem;
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const DetailTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const DetailDescription = styled.p`
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const MetadataGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const MetadataItem = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${(props) => props.color || "#3498db"};
`;

const MetadataLabel = styled.h4`
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const MetadataValue = styled.p`
  color: #34495e;
  line-height: 1.5;
  margin: 0;

  a {
    color: #3498db;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const AIReadinessPage = () => {
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [hoveredCriteria, setHoveredCriteria] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const centerRadius = 120;
  const outerRadius = 280;
  const innerRadius = 150;

  const createSegmentPath = (startAngle, endAngle, innerR, outerR) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = Math.cos(startAngleRad);
    const y1 = Math.sin(startAngleRad);
    const x2 = Math.cos(endAngleRad);
    const y2 = Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      innerR * x1,
      innerR * y1,
      "L",
      outerR * x1,
      outerR * y1,
      "A",
      outerR,
      outerR,
      0,
      largeArcFlag,
      1,
      outerR * x2,
      outerR * y2,
      "L",
      innerR * x2,
      innerR * y2,
      "A",
      innerR,
      innerR,
      0,
      largeArcFlag,
      0,
      innerR * x1,
      innerR * y1,
      "Z",
    ].join(" ");
  };

  const getTextPosition = (angle, radius) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * radius,
      y: Math.sin(angleRad) * radius,
    };
  };

  const handleSegmentClick = (criteria) => {
    setSelectedCriteria(criteria);
  };

  const currentCriteria = selectedCriteria || hoveredCriteria;

  return (
    <Container>
      <Title>CM4AI Dataset - AI Readiness Assessment</Title>

      <WheelContainer>
        <SVGWheel viewBox="-320 -320 640 640">
          {criteriaData
            .map((criteria, index) => ({
              criteria,
              index,
              isHovered: hoveredIndex === index,
            }))
            .sort((a, b) => (a.isHovered ? 1 : b.isHovered ? -1 : 0))
            .map(({ criteria, index, isHovered }) => {
              const startAngle = criteria.angle - 25.715;
              const endAngle = criteria.angle + 25.715;
              const midAngle = criteria.angle;
              const textPos = getTextPosition(
                midAngle,
                (innerRadius + outerRadius) / 2
              );
              const isActive = currentCriteria?.id === criteria.id;

              return (
                <Segment
                  key={criteria.id}
                  onMouseEnter={() => {
                    setHoveredCriteria(criteria);
                    setHoveredIndex(index);
                  }}
                  onMouseLeave={() => {
                    setHoveredCriteria(null);
                    setHoveredIndex(null);
                  }}
                  onClick={() => handleSegmentClick(criteria)}
                >
                  <SegmentPath
                    d={createSegmentPath(
                      startAngle,
                      endAngle,
                      innerRadius,
                      outerRadius
                    )}
                    fill={isActive ? criteria.color : criteria.color + "CC"}
                    style={{
                      filter: isActive ? "brightness(1.1)" : "none",
                    }}
                  />
                  <SegmentText x={textPos.x} y={textPos.y}>
                    {criteria.title.split(" ").map((word, i) => (
                      <tspan key={i} x={textPos.x} dy={i === 0 ? 0 : "1.2em"}>
                        {word}
                      </tspan>
                    ))}
                    <tspan x={textPos.x} dy="1.4em" style={{ fontWeight: 700 }}>
                      {criteria.score}/{criteria.maxScore}
                    </tspan>
                  </SegmentText>
                </Segment>
              );
            })}

          <CenterCircle r={centerRadius} cx="0" cy="0" />
        </SVGWheel>

        <CenterContent>
          {currentCriteria ? (
            <>
              <CenterTitle>
                {currentCriteria.title} ({currentCriteria.score}/
                {currentCriteria.maxScore})
              </CenterTitle>
              <CenterDescription>
                {currentCriteria.description}
              </CenterDescription>
            </>
          ) : (
            <>
              <CenterTitle>CM4AI RO-Crate Assessment</CenterTitle>
              <CenterDescription>
                Click or hover over any section to explore how the CM4AI dataset
                meets AI readiness criteria
              </CenterDescription>
            </>
          )}
        </CenterContent>
      </WheelContainer>

      {selectedCriteria && (
        <DetailPanel>
          <DetailTitle>
            {selectedCriteria.title} Assessment ({selectedCriteria.score}/
            {selectedCriteria.maxScore})
          </DetailTitle>
          <DetailDescription>{selectedCriteria.details}</DetailDescription>
          <DetailTitle style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
            Relevant Metadata from CM4AI RO-Crate:
          </DetailTitle>
          <MetadataGrid>
            {Object.entries(selectedCriteria.metadata).map(([key, value]) => (
              <MetadataItem key={key} color={selectedCriteria.color}>
                <MetadataLabel>{key}:</MetadataLabel>
                <MetadataValue
                  dangerouslySetInnerHTML={{
                    __html: value.replace(
                      /(https?:\/\/[^\s]+)/g,
                      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
                    ),
                  }}
                />
              </MetadataItem>
            ))}
          </MetadataGrid>
        </DetailPanel>
      )}
    </Container>
  );
};

export default AIReadinessPage;

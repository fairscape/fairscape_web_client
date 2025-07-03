import React, { useState } from "react";
import styled from "styled-components";

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
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Citation = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  text-align: center;
  max-width: 800px;
  margin-top: -0.5rem;
  margin-bottom: 2rem;
  font-style: italic;

  a {
    color: #3498db;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
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
  margin-bottom: 1rem;
`;

const DetailList = styled.ul`
  color: #34495e;
  line-height: 1.6;
  padding-left: 1.5rem;
  margin: 0;
`;

const criteriaData = [
  {
    id: "computability",
    title: "Computability",
    subtitle:
      "Standardized\nComputational Accessibility\nPortable\nContextualized",
    color: "#95a5a6",
    angle: 0,
    description:
      "Data must be standardized, computationally accessible, portable, and contextualized to allow for effective processing by AI systems.",
    details:
      "Computability is ensuring datasets 'follow established, documented standards' and that there is a mechanism to 'access data either through established exchange protocols or a well-documented API'. It emphasizes maximizing portability across different computational resources and including rich context to facilitate interpretation.",
    keyPoints: [
      "Provide data in multiple standardized and machine-readable formats.",
      "Ensure data is accessible via public, domain-appropriate repositories.",
      "Maximize portability by documenting specific resource requirements.",
      "Include rich metadata and provenance to contextualize data for analysis.",
    ],
  },
  {
    id: "fairness",
    title: "FAIRness",
    subtitle: "Findable\nAccessible\nInteroperable\nReusable",
    color: "#d35400",
    angle: 51.43,
    description:
      "Digital objects must be Findable, Accessible, Interoperable, and Reusable to aid discovery and reuse by third parties.",
    details:
      "Compliance with the FAIR Principles 'is a prerequisite for proper data management and data stewardship' and is strongly recommended by the NIH. While 'simple FAIRness is not enough' for full AI-readiness, it provides the essential framework for data sharing and reuse.",
    keyPoints: [
      "Assign globally unique persistent identifiers (e.g., DOIs, ARKs) to datasets.",
      "Make descriptive metadata publicly accessible, even if the data itself is restricted.",
      "Use formally defined specifications and standard vocabularies (e.g., schema.org, JSON-LD).",
      "Attach a clear, accessible data usage license to define terms of reuse.",
    ],
  },
  {
    id: "provenance",
    title: "Provenance",
    subtitle: "Transparent\nTraceable\nInterpretable\nKey Actors identified",
    color: "#3498db",
    angle: 102.86,
    description:
      "The origins and transformational history of digital objects must be richly documented to ensure trust and verifiability.",
    details:
      "'Provenance is a record of the history, authorship, ownership, and transformations of a physical entity or information object... [it] provides an essential basis for evaluating the validity of information'. For AI, this means data can be traced back to its original source for verification.",
    keyPoints: [
      "Document all important data transformation steps, ideally in a machine-readable format (e.g., W3C PROV-O, EVI).",
      "Identify all people, organizations, and subject groups involved in data generation and processing.",
      "Ensure data can be traced back to its 'original, unmodified version from experiments, clinical trials, electronic health records, surveys, or other sources'.",
      "Make software used for key data transformations available in a sustainable repository.",
    ],
  },
  {
    id: "characterization",
    title: "Characterization",
    subtitle:
      "Semantics\nStatistics\nStandards\nPotential Sources of Bias\nData Quality",
    color: "#27ae60",
    angle: 154.29,
    description:
      "The content semantics, statistics, and quality of digital objects must be well-described, including any known biases.",
    details:
      "Proper characterization requires 'full descriptive metadata for datasets', including statistical summaries and quality assessments. AI-ready data 'must be accompanied by documentation and metadata that describe these characteristics for downstream reuse', especially regarding potential biases and data quality.",
    keyPoints: [
      "Provide a machine-readable data dictionary or schema for each dataset.",
      "Include statistical characterizations of key features (e.g., demographics).",
      "Describe known sources of bias and assumptions made during data collection.",
      "Document all data quality control procedures that have been applied.",
    ],
  },
  {
    id: "explainability",
    title: "Pre-Model Explainability",
    subtitle: "Data Documentation Templates\nFit for Purpose\nVerifiable",
    color: "#f39c12",
    angle: 205.72,
    description:
      "Sufficient metadata must be provided to support the explainability of predictions and classifications based on the data.",
    details:
      "The 'Pre-Modeling Stage' of explainability involves 'ensuring that the data and design choices made before model training are transparent and understandable'. This means providing clear documentation and ensuring the data is suitable for its intended purpose.",
    keyPoints: [
      "Use data documentation templates (e.g., Datasheets for Datasets).",
      "Clearly identify appropriate and inappropriate use cases for the dataset.",
      "Provide a mechanism (e.g., checksums) to ensure the integrity of each file.",
      "Link to any previously published analyses that used the data.",
    ],
  },
  {
    id: "ethics",
    title: "Ethics",
    subtitle:
      "Ethically Acquired\nEthically Managed\nEthically Disseminated\nSecure",
    color: "#2980b9",
    angle: 257.15,
    description:
      "Ethical data acquisition, management, and dissemination must be documented and maintained throughout the data lifecycle.",
    details:
      "Ethical practices are critical for biomedical AI. These constraints 'concern the scientific integrity of pre-model data acquisition and processing, adherence to best practices in human and animal subject protection, and proper licensing and distribution with barriers against misuse'.",
    keyPoints: [
      "Describe data acquisition consistent with accepted principles (e.g., Belmont Report).",
      "Indicate any privacy-protection processing applied (e.g., anonymization).",
      "Specify a clear licensing agreement and/or Data Use Agreement (DUA).",
      "Define security requirements for storing and accessing the data.",
    ],
  },
  {
    id: "sustainability",
    title: "Sustainability",
    subtitle: "Persistent\nDomain-appropriate\nWell-governed\nAssociated",
    color: "#16a085",
    angle: 308.58,
    description:
      "Digital objects and their metadata must be stored in FAIR, long-term, stable archives to ensure future benefit.",
    details:
      "Sustainability planning should 'commence as early in the project as feasible'. To be consistent with FAIR principles, 'data must be deposited in sustainable archives for reuse', which requires a diverse funding portfolio and a clear governance plan for maintenance.",
    keyPoints: [
      "Ensure unprocessed (raw) data is preserved in a permanent archive.",
      "Deposit data in a FAIR, domain-appropriate specialist repository (e.g., NCBI, MassIVE).",
      "Establish a clear governance model that accounts for future maintenance and policy changes.",
      "Document project-level connections between data components.",
    ],
  },
];

const AIReadinessDefinitionsPage = () => {
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
      <Title>AI-Readiness for Biomedical Data</Title>
      <Citation>
        Criteria based on the Bridge2AI Recommendations by Clark T, et al. (
        <a
          href="https://doi.org/10.1101/2024.10.23.619844"
          target="_blank"
          rel="noopener noreferrer"
        >
          bioRxiv 2024.10.23.619844
        </a>
        )
      </Citation>

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
                  </SegmentText>
                </Segment>
              );
            })}

          <CenterCircle r={centerRadius} cx="0" cy="0" />
        </SVGWheel>

        <CenterContent>
          {currentCriteria ? (
            <>
              <CenterTitle>{currentCriteria.title}</CenterTitle>
              <CenterDescription>
                {currentCriteria.description}
              </CenterDescription>
            </>
          ) : (
            <>
              <CenterTitle>Bridge2AI Criteria</CenterTitle>
              <CenterDescription>
                Click or hover over a section to explore key criteria for
                AI-ready biomedical data.
              </CenterDescription>
            </>
          )}
        </CenterContent>
      </WheelContainer>

      {selectedCriteria && (
        <DetailPanel>
          <DetailTitle>{selectedCriteria.title}</DetailTitle>
          <DetailDescription>{selectedCriteria.details}</DetailDescription>
          <DetailTitle style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
            Key Implementation Practices:
          </DetailTitle>
          <DetailList>
            {selectedCriteria.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </DetailList>
        </DetailPanel>
      )}
    </Container>
  );
};

export default AIReadinessDefinitionsPage;

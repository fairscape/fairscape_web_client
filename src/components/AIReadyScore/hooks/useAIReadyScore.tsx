// components/AIReadyScore/hooks/useAIReadyScore.ts
import { useState, useEffect } from "react";
import { useAIReadyScoreApi, AIReadyScore } from "../api/aiReadyScoreApi";

export interface CriteriaData {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  angle: number;
  score: number;
  maxScore: number;
  hasMetCriteria: boolean;
  description: string;
  details: string;
  criteria: string[];
  /** Evidence/details text keyed by both snake_case and display names */
  metadata: Record<string, string>;
  /** NEW: Met/Not Met map pulled straight from API has_content */
  metByKey: Record<string, boolean>;
}

function titleCaseFromSnake(key: string) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function transformScoreToMetadata(
  _criterionName: string,
  scores: Record<string, any>
): Record<string, string> {
  const metadata: Record<string, string> = {};

  const displayNameMappings: Record<string, string> = {
    data_documentation_template: "Data Documentation Templates",
    fit_for_purpose: "Fit for Purpose",
    verifiable: "Verifiable",
    computationally_accessible: "Computational Accessibility",
    domain_appropriate: "Domain-appropriate",
    well_governed: "Well-governed",
    key_actors_identified: "Key Actors identified",
    potential_sources_of_bias: "Potential Sources of Bias",
    data_quality: "Data Quality",
  };

  Object.entries(scores).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      "details" in value &&
      value.details
    ) {
      const detailsStr = String(value.details);

      // snake_case key
      metadata[key] = detailsStr;

      // Title Cased variant
      const titleCased = titleCaseFromSnake(key);
      metadata[titleCased] = detailsStr;

      // Friendly display name (if defined)
      if (displayNameMappings[key]) {
        metadata[displayNameMappings[key]] = detailsStr;
      }
    }
  });
  return metadata;
}

/** NEW: Build a boolean map (met/not met) directly from has_content */
function transformScoreToMetByKey(
  _criterionName: string,
  scores: Record<string, any>
): Record<string, boolean> {
  const met: Record<string, boolean> = {};

  const displayNameMappings: Record<string, string> = {
    data_documentation_template: "Data Documentation Templates",
    fit_for_purpose: "Fit for Purpose",
    verifiable: "Verifiable",
    computationally_accessible: "Computational Accessibility",
    domain_appropriate: "Domain-appropriate",
    well_governed: "Well-governed",
    key_actors_identified: "Key Actors identified",
    potential_sources_of_bias: "Potential Sources of Bias",
    data_quality: "Data Quality",
  };

  Object.entries(scores).forEach(([key, value]) => {
    const has = Boolean(value?.has_content);

    // snake_case key
    met[key] = has;

    // Title Cased variant
    const titleCased = titleCaseFromSnake(key);
    met[titleCased] = has;

    // Friendly display name (if defined)
    if (displayNameMappings[key]) {
      met[displayNameMappings[key]] = has;
    }
  });

  return met;
}

function calculateScore(scores: Record<string, any>): number {
  return Object.values(scores).filter((s: any) => s?.has_content).length;
}

function getDetailsString(scores: Record<string, any>): string {
  const details = Object.values(scores)
    .filter((s: any) => s?.has_content && s?.details)
    .map((s: any) => s.details)
    .filter(Boolean);
  return details.length > 0 ? String(details[0]) : "No details available";
}

export function transformAIReadyScore(data: AIReadyScore): CriteriaData[] {
  return [
    {
      id: "computability",
      title: "Computability",
      subtitle:
        "Standardized\nComputational Accessibility\nPortable\nContextualized",
      color: "#0a9396",
      angle: 0,
      score: calculateScore(data.computability),
      maxScore: 4,
      hasMetCriteria: calculateScore(data.computability) === 4,
      description:
        "Ensures data can be processed across systems: standardized formats, programmatic access, portability, and adequate context.",
      details: getDetailsString(data.computability),
      criteria: [
        "Standardized",
        "Computational Accessibility",
        "Portable",
        "Contextualized",
      ],
      metadata: transformScoreToMetadata("computability", data.computability),
      metByKey: transformScoreToMetByKey("computability", data.computability),
    },
    {
      id: "fairness",
      title: "FAIRness",
      subtitle: "Findable\nAccessible\nInteroperable\nReusable",
      color: "#d35400",
      angle: 51.43,
      score: calculateScore(data.fairness),
      maxScore: 4,
      hasMetCriteria: calculateScore(data.fairness) === 4,
      description:
        "Follow FAIR principles: make data findable, accessible, interoperable, and reusable.",
      details: getDetailsString(data.fairness),
      criteria: ["Findable", "Accessible", "Interoperable", "Reusable"],
      metadata: transformScoreToMetadata("fairness", data.fairness),
      metByKey: transformScoreToMetByKey("fairness", data.fairness),
    },
    {
      id: "provenance",
      title: "Provenance",
      subtitle: "Transparent\nTraceable\nInterpretable\nKey Actors identified",
      color: "#3498db",
      angle: 102.86,
      score: calculateScore(data.provenance),
      maxScore: 4,
      hasMetCriteria: calculateScore(data.provenance) === 4,
      description:
        "Maintain clear lineage: inputs, transformations, software, and responsible parties are recorded.",
      details: getDetailsString(data.provenance),
      criteria: [
        "Transparent",
        "Traceable",
        "Interpretable",
        "Key Actors identified",
      ],
      metadata: transformScoreToMetadata("provenance", data.provenance),
      metByKey: transformScoreToMetByKey("provenance", data.provenance),
    },
    {
      id: "characterization",
      title: "Characterization",
      subtitle:
        "Semantics\nStatistics\nStandards\nPotential Sources of Bias\nData Quality",
      color: "#27ae60",
      angle: 154.29,
      score: calculateScore(data.characterization),
      maxScore: 5,
      hasMetCriteria: calculateScore(data.characterization) === 5,
      description:
        "Document semantic context, statistical summaries, applicable standards, data quality, and potential biases.",
      details: getDetailsString(data.characterization),
      criteria: [
        "Semantics",
        "Statistics",
        "Standards",
        "Potential Sources of Bias",
        "Data Quality",
      ],
      metadata: transformScoreToMetadata(
        "characterization",
        data.characterization
      ),
      metByKey: transformScoreToMetByKey(
        "characterization",
        data.characterization
      ),
    },
    {
      id: "pre_model_explainability",
      title: "Pre-Model Explainability",
      subtitle: "Data Documentation Templates\nFit for Purpose\nVerifiable",
      color: "#f39c12",
      angle: 205.72,
      score: calculateScore(data.pre_model_explainability),
      maxScore: 3,
      hasMetCriteria: calculateScore(data.pre_model_explainability) === 3,
      description:
        "Before modeling, ensure appropriate documentation, clear use/limitations, and verifiability (e.g., checksums).",
      details: getDetailsString(data.pre_model_explainability),
      criteria: [
        "Data Documentation Templates",
        "Fit for Purpose",
        "Verifiable",
      ],
      metadata: transformScoreToMetadata(
        "pre_model_explainability",
        data.pre_model_explainability
      ),
      metByKey: transformScoreToMetByKey(
        "pre_model_explainability",
        data.pre_model_explainability
      ),
    },
    {
      id: "ethics",
      title: "Ethics",
      subtitle:
        "Ethically Acquired\nEthically Managed\nEthically Disseminated\nSecure",
      color: "#2980b9",
      angle: 257.15,
      score: calculateScore(data.ethics),
      maxScore: 4,
      hasMetCriteria: calculateScore(data.ethics) === 4,
      description:
        "Ethical acquisition, management, dissemination, and appropriate security and governance.",
      details: getDetailsString(data.ethics),
      criteria: [
        "Ethically Acquired",
        "Ethically Managed",
        "Ethically Disseminated",
        "Secure",
      ],
      metadata: transformScoreToMetadata("ethics", data.ethics),
      metByKey: transformScoreToMetByKey("ethics", data.ethics),
    },
    {
      id: "sustainability",
      title: "Sustainability",
      subtitle: "Persistent\nDomain-appropriate\nWell-governed\nAssociated",
      color: "#16a085",
      angle: 308.58,
      score: calculateScore(data.sustainability),
      maxScore: 4,
      hasMetCriteria: calculateScore(data.sustainability) === 4,
      description:
        "Plan for long-term persistence, domain-appropriate stewardship, governance, and association across components.",
      details: getDetailsString(data.sustainability),
      criteria: [
        "Persistent",
        "Domain-appropriate",
        "Well-governed",
        "Associated",
      ],
      metadata: transformScoreToMetadata("sustainability", data.sustainability),
      metByKey: transformScoreToMetByKey("sustainability", data.sustainability),
    },
  ];
}

export function useAIReadyScore(arkId: string) {
  const api = useAIReadyScoreApi();
  const [criteriaData, setCriteriaData] = useState<CriteriaData[] | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchScore() {
      if (!arkId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const scoreData = await api.getAIReadyScore(arkId);
        if (!cancelled) {
          setName(scoreData?.name ?? "");
          setCriteriaData(transformAIReadyScore(scoreData));
        }
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message || "Failed to load AI readiness score");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchScore();
    return () => {
      cancelled = true;
    };
  }, [arkId]);

  return { criteriaData, name, loading, error };
}

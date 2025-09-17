import { useHttp } from "./httpClient";

export interface SubCriterionScore {
  has_content: boolean;
  details: string | null;
}

export interface FairnessScore {
  findable: SubCriterionScore;
  accessible: SubCriterionScore;
  interoperable: SubCriterionScore;
  reusable: SubCriterionScore;
}

export interface ProvenanceScore {
  transparent: SubCriterionScore;
  traceable: SubCriterionScore;
  interpretable: SubCriterionScore;
  key_actors_identified: SubCriterionScore;
}

export interface CharacterizationScore {
  semantics: SubCriterionScore;
  statistics: SubCriterionScore;
  standards: SubCriterionScore;
  potential_sources_of_bias: SubCriterionScore;
  data_quality: SubCriterionScore;
}

export interface PreModelExplainabilityScore {
  data_documentation_template: SubCriterionScore;
  fit_for_purpose: SubCriterionScore;
  verifiable: SubCriterionScore;
}

export interface EthicsScore {
  ethically_acquired: SubCriterionScore;
  ethically_managed: SubCriterionScore;
  ethically_disseminated: SubCriterionScore;
  secure: SubCriterionScore;
}

export interface SustainabilityScore {
  persistent: SubCriterionScore;
  domain_appropriate: SubCriterionScore;
  well_governed: SubCriterionScore;
  associated: SubCriterionScore;
}

export interface ComputabilityScore {
  standardized: SubCriterionScore;
  computationally_accessible: SubCriterionScore;
  portable: SubCriterionScore;
  contextualized: SubCriterionScore;
}

export interface AIReadyScore {
  name: string;
  fairness: FairnessScore;
  provenance: ProvenanceScore;
  characterization: CharacterizationScore;
  pre_model_explainability: PreModelExplainabilityScore;
  ethics: EthicsScore;
  sustainability: SustainabilityScore;
  computability: ComputabilityScore;
}

export function useAIReadyScoreApi() {
  const http = useHttp();

  return {
    getAIReadyScore: (ark: string): Promise<AIReadyScore> =>
      http(`/rocrate/ai-ready-score/${encodeURIComponent(ark)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      }),
  };
}

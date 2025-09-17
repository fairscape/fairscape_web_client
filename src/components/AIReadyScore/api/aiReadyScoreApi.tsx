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

export type TaskAccepted = {
  message?: string;
  task_id: string;
  status?: string;
  status_endpoint: string; 
};

export type TaskStatus = {
  guid: string;
  task_type: string; 
  rocrate_id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | string;
  time_created?: string;
  time_completed?: string;
  error?: string;
};

function looksLikeScore(x: any): x is AIReadyScore {
  return x && typeof x === "object" && "fairness" in x && "computability" in x;
}

function looksLikeAccepted(x: any): x is TaskAccepted {
  return x && typeof x === "object" && "task_id" in x && "status_endpoint" in x;
}

export function useAIReadyScoreApi() {
  const http = useHttp();

  return {
    getAIReadyScore: async (
      ark: string
    ): Promise<AIReadyScore | TaskAccepted> => {
      const res = await http(
        `/rocrate/ai-ready-score/${encodeURIComponent(ark)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      return res;
    },

    getTaskStatus: async (statusRef: string): Promise<TaskStatus> => {
      const path = statusRef.startsWith("/rocrate/ai-ready-score/status/")
        ? statusRef
        : `/rocrate/ai-ready-score/status/${statusRef}`;
      return await http(path, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    },

    isAIReadyScore: looksLikeScore,
    isTaskAccepted: looksLikeAccepted,
  };
}

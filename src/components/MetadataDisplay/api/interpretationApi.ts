import { useHttp } from "./httpClient";

export interface ComputationDetail {
  computation_id: string;
  name?: string;
  status: "done" | "error" | "processing" | "pending";
}

export interface InterpretationStatus {
  status: "PENDING" | "PROCESSING" | "PROMPTING" | "SUCCESS" | "FAILURE";
  current_step: string;
  completed_computations: number;
  total_computations: number;
  computation_details: ComputationDetail[];
  annotated_evidence_graph_id?: string;
  error?: string | { message?: string; details?: string };
}

export function useInterpretationApi() {
  const http = useHttp();

  const triggerInterpretation = (
    ark: string,
    force: boolean = true,
  ): Promise<{ task_id: string }> =>
    http(`/interpretation/${encodeURIComponent(ark)}?force=${force}`, {
      method: "POST",
    });

  const pollStatus = (taskId: string): Promise<InterpretationStatus> =>
    http(`/interpretation/status/${encodeURIComponent(taskId)}`, {
      method: "GET",
    });

  return { triggerInterpretation, pollStatus };
}

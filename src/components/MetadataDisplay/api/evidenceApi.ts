import { useHttp } from "./httpClient";

export interface PollResult {
  status: "PENDING" | "SUCCESS" | "FAILURE";
  result?: {
    evidence_graph_id?: string;
  };
  error?: string;
}

export function useEvidenceApi() {
  const http = useHttp();

  const getEG = (evidenceArkOrId: string) =>
    http(`/${encodeURIComponent(evidenceArkOrId)}`, { method: "GET" });

  const buildEG = (ark: string): Promise<{ task_id: string }> =>
    http(`/evidencegraph/build/${encodeURIComponent(ark)}`, {
      method: "POST",
      body: {},
    });

  async function pollBuild(
    taskId: string,
    { maxAttempts = 15, initialDelayMs = 800, backoff = 1.35 } = {},
  ): Promise<PollResult> {
    let delay = initialDelayMs;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res: PollResult = await http(
        `/evidencegraph/build/status/${encodeURIComponent(taskId)}`,
        { method: "GET" },
      );
      if (res.status === "SUCCESS" || res.status === "FAILURE") return res;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.ceil(delay * backoff);
    }
    return { status: "FAILURE", error: "Evidence graph build timed out" };
  }

  return { getEG, buildEG, pollBuild };
}

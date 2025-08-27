import { useHttp } from "./httpClient";

export interface PollResult {
  status: "PENDING" | "READY" | "FAILED";
  evidenceGraphId?: string;
  error?: string;
}

export function useEvidenceApi() {
  const http = useHttp();

  const getEG = (evidenceArkOrId: string) =>
    http(`/${encodeURIComponent(evidenceArkOrId)}`, { method: "GET" });

  const buildEG = (ark: string): Promise<{ taskId: string }> =>
    http(`/evidencegraph/build/${encodeURIComponent(ark)}`, {
      method: "POST",
      body: {},
    });

  async function pollBuild(
    taskId: string,
    { maxAttempts = 15, initialDelayMs = 800, backoff = 1.35 } = {}
  ): Promise<PollResult> {
    let delay = initialDelayMs;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res: PollResult = await http(
        `/evidencegraph/status/${encodeURIComponent(taskId)}`,
        { method: "GET" }
      );
      if (res.status === "READY" || res.status === "FAILED") return res;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.ceil(delay * backoff);
    }
    return { status: "FAILED", error: "Evidence graph build timed out" };
  }

  return { getEG, buildEG, pollBuild };
}

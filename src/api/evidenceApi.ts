import { useHttp } from "./httpClient";

export interface PollResult {
  status: "PENDING" | "READY" | "FAILED";
  evidenceGraphId?: string;
  error?: string;
}

export function useEvidenceApi() {
  const http = useHttp();

  const getEG = (evidenceArk: string) =>
    http(`/${encodeURIComponent(evidenceArk)}`, { method: "GET" });

  // ✅ build endpoint now includes the encoded ARK segment
  const buildEG = (ark: string): Promise<{ taskId: string }> =>
    http(`/evidencegraph/build/${encodeURIComponent(ark)}`, {
      method: "POST",
      body: {}, // matches your axios usage
    });

  async function pollBuild(
    taskId: string,
    {
      maxAttempts = 15,
      initialDelayMs = 800,
      backoff = 1.35,
    }: { maxAttempts?: number; initialDelayMs?: number; backoff?: number } = {}
  ): Promise<PollResult> {
    let delay = initialDelayMs;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res: PollResult = await http(
        `/evidencegraph/status/${encodeURIComponent(taskId)}`,
        {
          method: "GET",
        }
      );
      if (res.status === "READY" || res.status === "FAILED") return res;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.ceil(delay * backoff);
    }
    return { status: "FAILED", error: "Evidence graph build timed out" };
  }

  return { getEG, buildEG, pollBuild };
}

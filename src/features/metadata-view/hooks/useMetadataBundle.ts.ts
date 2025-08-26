import { useEffect, useState } from "react";
import { useMetadataApi } from "../../../api/metadataApi";
import { useEvidenceApi } from "../../../api/evidenceApi";
import { classify } from "../utils/classify";
import { extractEvidenceGraphId } from "../utils/evidence";
import type { MetadataBundle, EvidenceInfo } from "../types";

export function useMetadataBundle(ark: string) {
  const metadataApi = useMetadataApi();
  const evidenceApi = useEvidenceApi();

  const [bundle, setBundle] = useState<MetadataBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!ark) return;
      setLoading(true);
      setError(null);
      try {
        // ✅ unwrap .metadata right away
        const mainResp = await metadataApi.getMain(ark);
        const main = mainResp?.metadata;
        const kind = classify(main);

        let rocrate: any | undefined;
        if (kind === "rocrate" || kind === "release") {
          const rocrateResp = await metadataApi.getRoCrate(ark);
          rocrate = rocrateResp?.metadata;
        }

        let evidence: EvidenceInfo | undefined;

        if (kind !== "release") {
          // ✅ robust detection: check for EG id in main or rocrate
          const evId =
            extractEvidenceGraphId(main) ?? extractEvidenceGraphId(rocrate);

          if (evId) {
            const data = await evidenceApi.getEG(evId);
            evidence = { id: evId, data, status: "ready" };
          } else {
            // ✅ build only if no EG is present
            const { taskId } = await evidenceApi.buildEG(ark);
            const poll = await evidenceApi.pollBuild(taskId);
            if (poll.status === "READY" && poll.evidenceGraphId) {
              const data = await evidenceApi.getEG(poll.evidenceGraphId);
              evidence = { id: poll.evidenceGraphId, data, status: "ready" };
            } else if (poll.status === "FAILED") {
              evidence = {
                status: "failed",
                error: poll.error || "EG build failed",
              };
            } else {
              evidence = { status: "building" };
            }
          }
        }

        const next: MetadataBundle = { kind, main, rocrate, evidence };
        if (!cancelled) setBundle(next);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [ark]); // <- only rerun if ark changes

  return { bundle, loading, error };
}

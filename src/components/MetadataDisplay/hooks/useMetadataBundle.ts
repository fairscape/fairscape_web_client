import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useMetadataApi } from "../api/metadataApi";
import { useEvidenceApi } from "../api/evidenceApi";
import { classify } from "../utils/classify";
import { extractEvidenceGraphId } from "../utils/evidence";
import type { MetadataBundle, EvidenceInfo } from "../types/types";
import { extractSupportData } from "../../../components/EvidenceGraph/SupportingElementsComponent";

export function useMetadataBundle(ark: string) {
  const { isLoggedIn } = useContext(AuthContext);
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
        // main metadata
        const mainResp = await metadataApi.getMain(ark);
        const main = mainResp?.metadata ?? mainResp;
        const kind = classify(main);

        // rocrate (if crate/release)
        let rocrate: any | undefined = undefined;
        if (kind === "rocrate" || kind === "release") {
          try {
            const roResp = await metadataApi.getRoCrate(ark);
            rocrate = roResp?.metadata ?? roResp;
          } catch {}
        }

        // serializations
        let rdfXml: string | null = null;
        let turtle: string | null = null;
        try {
          rdfXml = await metadataApi.getRdfXml(ark);
        } catch {}
        try {
          turtle = await metadataApi.getTurtle(ark);
        } catch {}

        // evidence (skip build for release)
        let evidence: EvidenceInfo | undefined;
        if (kind !== "release") {
          const evId =
            extractEvidenceGraphId(main) ?? extractEvidenceGraphId(rocrate);

          if (evId) {
            const data = await evidenceApi.getEG(evId);
            const supportData = extractSupportData?.(data);
            evidence = { id: evId, data, supportData, status: "ready" };
          } else {
            try {
              const { taskId } = await evidenceApi.buildEG(ark);
              const poll = await evidenceApi.pollBuild(taskId);
              if (poll.status === "READY" && poll.evidenceGraphId) {
                const data = await evidenceApi.getEG(poll.evidenceGraphId);
                const supportData = extractSupportData?.(data);
                evidence = {
                  id: poll.evidenceGraphId,
                  data,
                  supportData,
                  status: "ready",
                };
              } else if (poll.status === "FAILED") {
                evidence = {
                  status: "failed",
                  error: poll.error || "EG build failed",
                };
              } else {
                evidence = { status: "building" };
              }
            } catch (e: any) {
              evidence = { status: "failed", error: e?.message || String(e) };
            }
          }
        }

        const next: MetadataBundle = {
          kind,
          main,
          rocrate,
          evidence,
          serializations: { json: main, rdfXml, turtle },
          session: { isLoggedIn: !!isLoggedIn },
        };

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
  }, [ark, isLoggedIn]);

  return { bundle, loading, error };
}

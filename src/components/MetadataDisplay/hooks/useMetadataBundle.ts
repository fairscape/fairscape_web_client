import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useMetadataApi } from "../api/metadataApi";
import { useEvidenceApi } from "../api/evidenceApi";
import { classify, classifyROCrate } from "../utils/classify";
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
        const mainResp = await metadataApi.getMain(ark);
        const main = mainResp?.metadata ?? mainResp;
        const mainKind = classify(main);

        let kind = mainKind;

        let rocrate: any | undefined = undefined;
        if (kind === "rocrate" || kind === "release") {
          try {
            const roResp = await metadataApi.getRoCrate(ark);
            rocrate = roResp?.metadata ?? roResp;
            kind = classifyROCrate(rocrate);
          } catch {}
        }

        let rdfXml: string | null = null;
        let turtle: string | null = null;
        try {
          rdfXml = await metadataApi.getRdfXml(ark);
        } catch {}
        try {
          turtle = await metadataApi.getTurtle(ark);
        } catch {}

        const permissions = mainResp?.permissions;
        const distribution = mainResp?.distribution;
        const descriptiveStatistics = mainResp?.descriptiveStatistics;

        const initialBundle: MetadataBundle = {
          kind,
          main,
          rocrate,
          evidence: kind === "release" ? undefined : { status: "building" },
          serializations: { json: main, rdfXml, turtle },
          session: { isLoggedIn: !!isLoggedIn },
          permissions,
          distribution,
          descriptiveStatistics,
        };

        if (!cancelled) {
          setBundle(initialBundle);
          setLoading(false);
        }

        if (kind !== "release") {
          const evId =
            extractEvidenceGraphId(main) ?? extractEvidenceGraphId(rocrate);

          let evidence: EvidenceInfo | undefined;

          if (evId) {
            try {
              const response = await evidenceApi.getEG(evId);
              const data = response.metadata ?? response;
              const supportData = extractSupportData?.(data);
              evidence = { id: evId, data, supportData, status: "ready" };
            } catch {
              evidence = { status: "building" };
            }
          }

          if (!evidence || evidence.status === "building") {
            try {
              const { task_id } = await evidenceApi.buildEG(ark);
              const poll = await evidenceApi.pollBuild(task_id);
              if (poll.status === "SUCCESS" && poll.result?.evidence_graph_id) {
                const response = await evidenceApi.getEG(
                  poll.result.evidence_graph_id
                );
                const data = response.metadata ?? response;
                const supportData = extractSupportData?.(data);
                evidence = {
                  id: poll.result?.evidence_graph_id,
                  data,
                  supportData,
                  status: "ready",
                };
              } else if (poll.status === "FAILURE") {
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

          if (!cancelled) {
            setBundle((prev) => (prev ? { ...prev, evidence } : null));
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || String(err));
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

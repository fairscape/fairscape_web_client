import { useHttp } from "./httpClient";

export interface PageOptions {
  limit?: number;
  offset?: number;
}

export function useMetadataApi() {
  const http = useHttp();
  return {
    getMain: (ark: string) =>
      http(`/${encodeURIComponent(ark)}`, {
        method: "GET",
        headers: { Accept: "application/ld+json" },
      }),

    /**
     * One call for everything the view page needs alongside the metadata:
     * permissions, distribution, descriptiveStatistics, splitStatistics,
     * isPartOf and contentSummary. Works for any identifier, not just crates.
     */
    getRoCrateView: (ark: string) =>
      http(`/rocrate/view/${encodeURIComponent(ark)}`, { method: "GET" }),

    /**
     * expand=false returns the crate shell (metadata descriptor + root entity)
     * without resolving @graph members. On a large crate that is a few KB
     * instead of a few MB; entity lists then come from getRoCrateEntities.
     */
    getRoCrate: (ark: string, { expand = true }: { expand?: boolean } = {}) =>
      http(
        `/rocrate/${encodeURIComponent(ark)}${expand ? "" : "?expand=false"}`,
        { method: "GET" },
      ),

    /**
     * Category counts plus the first `limit` items of each. The view page
     * calls this with limit=1 purely as a probe for `counts` and
     * `summaryAvailable`. Server allows limit 1-100.
     */
    getRoCrateSummary: (ark: string, { limit = 1, offset = 0 }: PageOptions = {}) =>
      http(
        `/rocrate/summary/${encodeURIComponent(ark)}?limit=${limit}&offset=${offset}`,
        { method: "GET" },
      ),

    /**
     * One page of fully-resolved entities for a single category.
     * Categories: datasets, software, computations, schemas, samples,
     * mlModels, rocrates, other. Server allows limit 1-200 (default 50).
     */
    getRoCrateEntities: (
      ark: string,
      category: string,
      { limit = 50, offset = 0 }: PageOptions = {},
    ) =>
      http(
        `/rocrate/entities/${encodeURIComponent(ark)}` +
          `?category=${encodeURIComponent(category)}&limit=${limit}&offset=${offset}`,
        { method: "GET" },
      ),

    getRdfXml: (ark: string) =>
      http(`/${encodeURIComponent(ark)}`, {
        method: "GET",
        headers: { Accept: "application/rdf+xml" },
      }).catch(() => null),

    getTurtle: (ark: string) =>
      http(`/${encodeURIComponent(ark)}`, {
        method: "GET",
        headers: { Accept: "text/turtle" },
      }).catch(() => null),

    rescoreAIReady: (ark: string) =>
      http(`/rocrate/ai-ready-score/${encodeURIComponent(ark)}/rescore`, {
        method: "POST",
      }),
  };
}

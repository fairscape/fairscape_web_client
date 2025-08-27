import { useHttp } from "./httpClient";

export function useMetadataApi() {
  const http = useHttp();
  return {
    getMain: (ark: string) =>
      http(`/${encodeURIComponent(ark)}`, {
        method: "GET",
        headers: { Accept: "application/ld+json" },
      }),

    getRoCrate: (ark: string) =>
      http(`/rocrate/${encodeURIComponent(ark)}`, { method: "GET" }),

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
  };
}

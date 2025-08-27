import { useHttp } from "./httpClient";

export function useMetadataApi() {
  const http = useHttp();
  return {
    getMain: (ark: string) =>
      http(`/${encodeURIComponent(ark)}`, { method: "GET" }),

    getRoCrate: (ark: string) =>
      http(`/rocrate/${encodeURIComponent(ark)}`, { method: "GET" }),

    getRdfXml: (ark: string) =>
      http(`/rdf/${encodeURIComponent(ark)}`, { method: "GET" }).catch(
        () => null
      ),
    getTurtle: (ark: string) =>
      http(`/turtle/${encodeURIComponent(ark)}`, { method: "GET" }).catch(
        () => null
      ),
  };
}

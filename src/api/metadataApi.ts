import { useHttp } from "./httpClient";

export function useMetadataApi() {
  const http = useHttp();

  return {
    // main metadata for any ARK
    getMain: (ark: string) =>
      http(`/${encodeURIComponent(ark)}`, { method: "GET" }),

    // for crates (and releases) fetch crate-level JSON too
    getRoCrate: (ark: string) =>
      http(`/rocrate/${encodeURIComponent(ark)}`, { method: "GET" }),
  };
}

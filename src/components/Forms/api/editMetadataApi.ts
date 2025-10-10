import { useHttp } from "./httpClient";

export function useEditMetadataApi() {
  const http = useHttp();

  return {
    getMetadata: async (ark: string) => {
      const response = await http(`/${encodeURIComponent(ark)}`, {
        method: "GET",
        headers: { Accept: "application/ld+json" },
      });

      return { metadata: response.metadata };
    },

    updateMetadata: async (ark: string, payload: any) => {
      console.log("Updating metadata with payload:", payload);
      const metadata = await http(`/${encodeURIComponent(ark)}`, {
        method: "PUT",
        body: payload,
      });
      console.log("Updated metadata:", metadata);
      return {
        status: "success",
        message: "Metadata updated successfully",
        metadata,
      };
    },
  };
}

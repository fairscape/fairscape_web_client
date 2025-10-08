import { useHttp } from "./httpClient";

const FAKE_DATASET = {
  "@id": "ark:99999/test-dataset-1",
  "@type": "EVI:Dataset",
  name: "Sample Dataset for Editing",
  description:
    "This is a test dataset with sample metadata for the edit interface. It contains various fields that can be modified through the form.",
  author: "Dr. Jane Smith",
  datePublished: "2024-01-15",
  dateCreated: "2023-12-01",
  dateModified: "2024-01-10",
  version: "1.2.0",
  keywords: "genomics, RNA-seq, test data",
  license: "CC-BY-4.0",
  publisher: "Example Research Institute",
  contentSize: "2.5 GB",
  encodingFormat: "application/x-hdf5",
  url: "https://example.org/datasets/test-dataset-1",
  contentUrl: "https://data.example.org/files/dataset-1.hdf5",
  associatedPublication: "https://doi.org/10.1234/example.2024",
  additionalDocumentation: "https://example.org/docs/dataset-1",
};

export function useEditMetadataApi() {
  const http = useHttp();

  return {
    getMetadata: async (ark: string) => {
      console.log(`[FAKE] Getting metadata for: ${ark}`);

      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        metadata: {
          ...FAKE_DATASET,
          "@id": ark,
        },
      };

      // return http(`/${encodeURIComponent(ark)}`, {
      //   method: "GET",
      //   headers: { Accept: "application/ld+json" },
      // });
    },

    updateMetadata: async (ark: string, payload: any) => {
      console.log(`[FAKE] Updating metadata for: ${ark}`);
      console.log("[FAKE] Update payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        status: "success",
        message: "Metadata updated successfully",
        metadata: {
          ...payload,
          "@id": ark,
          dateModified: new Date().toISOString().split("T")[0],
        },
      };

      // return http(`/edit/${encodeURIComponent(ark)}`, {
      //   method: "POST",
      //   body: payload,
      // });
    },
  };
}

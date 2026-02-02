import { useHttp } from "./httpClient";

/**
 * API helper for uploading RO-Crate metadata to Fairscape
 */
export function useFairscapeApi() {
  const http = useHttp();

  return {
    /**
     * Upload RO-Crate to Fairscape with optional provenance annotation
     */
    uploadRoCrate: async (
      rocrate: any,
      baseDatasetArk?: string
    ): Promise<any> => {
      const path = baseDatasetArk
        ? `/rocrate/metadata?baseDatasetArk=${encodeURIComponent(baseDatasetArk)}`
        : `/rocrate/metadata`;

      return http(path, {
        method: "POST",
        body: rocrate,
      });
    },

    /**
     * Update a GitHub file with new YAML content
     */
    updateGitHubFile: async (
      fileUrl: string,
      yamlContent: string,
      commitMessage: string = "Update D4D from Fairscape review"
    ): Promise<any> => {
      const formData = new FormData();
      formData.append("file_url", fileUrl);
      formData.append("file", new Blob([yamlContent]), "datasheet.yaml");
      formData.append("commit_message", commitMessage);

      return http("/files/update", {
        method: "PUT",
        body: formData,
      });
    },
  };
}

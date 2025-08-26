// src/services/downloadService.ts
import axios, { AxiosProgressEvent } from "axios";
import { AuthService } from "./authService";

export interface DownloadOptions {
  onProgress?: (progress: number) => void;
  requiresAuth?: boolean;
  filename?: string;
}

export interface DownloadResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export class DownloadService {
  private static readonly API_URL = window.API_URL;

  /**
   * Extract filename from response headers or URL
   */
  private static extractFilename(
    response: any,
    downloadUrl: string,
    suggestedName?: string
  ): string {
    // Try to get from content-disposition header
    const contentDisposition = response.headers?.["content-disposition"];
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches?.[1]) {
        return matches[1].replace(/['"]/g, "");
      }
    }

    // Use suggested name if provided
    if (suggestedName) {
      return this.sanitizeFilename(suggestedName);
    }

    // Extract from URL
    if (downloadUrl.includes(".zip/")) {
      const innerFilePath = downloadUrl.split(".zip/")[1];
      return innerFilePath?.split("/").pop() || "download";
    }

    const urlParts = downloadUrl.split("/");
    return urlParts[urlParts.length - 1] || "download";
  }

  /**
   * Sanitize filename for safe file system usage
   */
  private static sanitizeFilename(name: string): string {
    return name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.-]/g, "")
      .substring(0, 255); // Limit length
  }

  /**
   * Add appropriate file extension based on content type
   */
  private static ensureFileExtension(
    filename: string,
    contentType: string
  ): string {
    const extensionMap: Record<string, string> = {
      "application/zip": ".zip",
      "text/csv": ".csv",
      "application/json": ".json",
      "text/plain": ".txt",
      "application/pdf": ".pdf",
      "application/octet-stream": ".bin",
    };

    const expectedExtension = extensionMap[contentType];
    if (
      expectedExtension &&
      !filename.toLowerCase().endsWith(expectedExtension)
    ) {
      return filename + expectedExtension;
    }
    return filename;
  }

  /**
   * Check if a download URL is embargoed
   */
  static isEmbargoed(contentUrl: any): boolean {
    return contentUrl === "Embargoed";
  }

  /**
   * Check if a URL requires API authentication
   */
  static requiresApiAuth(url: string): boolean {
    return url.startsWith(this.API_URL);
  }

  /**
   * Download a file from the given URL
   */
  static async downloadFile(
    downloadUrl: string,
    options: DownloadOptions = {}
  ): Promise<DownloadResult> {
    try {
      // Check authentication if required
      if (options.requiresAuth ?? this.requiresApiAuth(downloadUrl)) {
        if (!AuthService.isLoggedIn()) {
          return {
            success: false,
            error:
              "Authentication required. Please log in to download this file.",
          };
        }
      }

      // Prepare headers
      const headers: Record<string, string> = {};
      if (options.requiresAuth ?? this.requiresApiAuth(downloadUrl)) {
        Object.assign(headers, AuthService.getAuthHeaders());
      }

      // Make the download request
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "blob",
        headers,
        onDownloadProgress: options.onProgress
          ? (progressEvent: AxiosProgressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                options.onProgress!(progress);
              }
            }
          : undefined,
      });

      // Extract filename
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      let filename = this.extractFilename(
        response,
        downloadUrl,
        options.filename
      );
      filename = this.ensureFileExtension(filename, contentType);

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      return { success: true, filename };
    } catch (error: any) {
      console.error("Download failed:", error);

      // Parse error message
      let errorMessage = "Download failed. Please try again.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage =
            "You do not have permission to download this file. Please ensure you are logged in and have the necessary access rights.";
        } else if (error.response.status === 403) {
          errorMessage =
            "Access forbidden. This content may be embargoed or restricted.";
        } else if (error.response.status === 404) {
          errorMessage = "File not found.";
        } else if (error.response.data instanceof Blob) {
          // Try to parse error from blob response
          try {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            errorMessage = json.error || json.message || errorMessage;
          } catch {
            errorMessage = `Download failed with status: ${error.response.status}`;
          }
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Build download URL for different entity types
   */
  static buildDownloadUrl(arkId: string, type: "rocrate" | "entity"): string {
    const cleanId = arkId.replace(/^\/|\/$/g, "");
    if (type === "rocrate") {
      return `${this.API_URL}/rocrate/download/${cleanId}`;
    }
    return `${this.API_URL}/download/${cleanId}`;
  }
}

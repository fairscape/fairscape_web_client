import { useCallback, useState } from "react";
import { useHttp } from "../api/httpClient";

interface DownloadHookParams {
  arkId: string;
  bundle: any;
  contentRef: React.RefObject<HTMLDivElement>;
}

export interface DownloadError {
  type: "unauthenticated" | "generic";
  title: string;
  message: string;
}

export function useDownloads({
  arkId,
  bundle,
  contentRef,
}: DownloadHookParams) {
  const http = useHttp();
  const [downloadError, setDownloadError] = useState<DownloadError | null>(null);
  const clearDownloadError = useCallback(() => setDownloadError(null), []);

  // Downloads of unpublished data return a 401/403 from the API. Surface that
  // as an "Unauthenticated" banner instead of failing silently.
  const handleDownloadError = useCallback((error: unknown, action: string) => {
    console.error(`Error ${action}:`, error);
    const message = error instanceof Error ? error.message : String(error);
    if (/\b(401|403)\b/.test(message)) {
      setDownloadError({
        type: "unauthenticated",
        title: "Unauthenticated",
        message:
          "This dataset hasn't been published yet, so its data isn't available to download. Sign in as the owner, or wait until it's published.",
      });
    } else {
      setDownloadError({
        type: "generic",
        title: "Download failed",
        message: `Something went wrong while ${action}. Please try again.`,
      });
    }
  }, []);

  const downloadZip = useCallback(async () => {
    clearDownloadError();
    try {
      const metadata = bundle?.rocrate ?? bundle?.main;
      const hasDistribution = !!bundle?.distribution;
      const contentUrl = metadata?.contentUrl;

      if (bundle?.kind === "rocrate" && hasDistribution) {
        const blob = await http(`/rocrate/download/${arkId}`, {
          credentials: "include",
          responseType: "blob",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${arkId.replace(/[:/]/g, "_")}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (contentUrl && hasDistribution) {
        const blob = await http(contentUrl, {
          credentials: "include",
          responseType: "blob",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const filename =
          contentUrl.split("/").pop() || arkId.replace(/[:/]/g, "_");
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      } else if (contentUrl && !hasDistribution) {
        window.open(contentUrl, "_blank");
      }
    } catch (error) {
      handleDownloadError(error, "downloading data");
    }
  }, [arkId, http, bundle, clearDownloadError, handleDownloadError]);

  const downloadJSON = useCallback(async () => {
    clearDownloadError();
    try {
      const data = await http(`/rocrate/${arkId}`, {
        headers: { Accept: "application/json" },
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${arkId.replace(/[:/]/g, "_")}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleDownloadError(error, "downloading JSON");
    }
  }, [arkId, http, clearDownloadError, handleDownloadError]);

  const downloadCroissant = useCallback(async () => {
    clearDownloadError();
    try {
      const data = await http(`/rocrate/${arkId}`, {
        headers: { Accept: "application/vnd.mlcommons-croissant+json" },
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${arkId.replace(/[:/]/g, "_")}_croissant.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleDownloadError(error, "downloading Croissant");
    }
  }, [arkId, http, clearDownloadError, handleDownloadError]);

  const downloadHTML = useCallback(() => {
    try {
      if (!contentRef.current) return;

      const componentHTML = contentRef.current.innerHTML;
      const allStyleTags = document.querySelectorAll("style[data-styled]");
      let collectedCSS = "";
      allStyleTags.forEach((tag) => {
        collectedCSS += tag.textContent;
      });

      const fullHTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>${collectedCSS}</style>
  </head>
  <body>
    ${componentHTML}
  </body>
</html>`;

      const blob = new Blob([fullHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${arkId.replace(/[:/]/g, "_")}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading HTML:", error);
    }
  }, [arkId, contentRef]);

  return {
    downloadZip,
    downloadJSON,
    downloadCroissant,
    downloadHTML,
    downloadError,
    clearDownloadError,
  };
}

import { useCallback } from "react";
import { useHttp } from "../api/httpClient";

interface DownloadHookParams {
  arkId: string;
  bundle: any;
  contentRef: React.RefObject<HTMLDivElement>;
}

export function useDownloads({
  arkId,
  bundle,
  contentRef,
}: DownloadHookParams) {
  const http = useHttp();

  const downloadZip = useCallback(async () => {
    try {
      const response = await http(`/rocrate/download/${arkId}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${arkId.replace(/[:/]/g, "_")}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading ZIP:", error);
    }
  }, [arkId]);

  const downloadJSON = useCallback(async () => {
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
      console.error("Error downloading JSON:", error);
    }
  }, [arkId, http]);

  const downloadCroissant = useCallback(async () => {
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
      console.error("Error downloading Croissant:", error);
    }
  }, [arkId, http]);

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
  };
}

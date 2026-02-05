import { useHttp } from "./httpClient";

interface UploadedFile {
  name: string;
  content: string | Blob;
}

interface FormData {
  [key: string]: any;
}

interface ProcessDocumentsResponse {
  result: string;
  provenance: any;
}

interface ProcessDocumentsOptions {
  onProgress?: (status: {
    state: string;
    message: string;
    elapsedSeconds: number;
  }) => void;
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "PENDING": return "Queued...";
    case "PROCESSING": return "Preparing request...";
    case "WAITING_FOR_API": return "Waiting for Gemini (1-3 mins)...";
    default: return "Processing...";
  }
}

export function useLLMAssistApi() {
  const http = useHttp();

  return {
    processDocuments: async (
      documents: UploadedFile[],
      options?: ProcessDocumentsOptions
    ): Promise<ProcessDocumentsResponse> => {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append("files", doc.content, doc.name);
      });

      const submitResponse = await http("/llmassist", {
        method: "POST",
        body: formData,
      });

      const { task_id } = submitResponse;

      const startTime = Date.now();

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusData = await http(`/llmassist/status/${task_id}`, {
          method: "GET",
        });

        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

        // Show progress if callback provided
        options?.onProgress?.({
          state: statusData.status,
          message: getStatusMessage(statusData.status),
          elapsedSeconds,
        });

        // Handle JSON_PARSE_FAILED with debug URL
        if (statusData.status === "JSON_PARSE_FAILED") {
          throw new Error(
            `LLM returned invalid JSON.\n` +
            `Debug: ${window.location.origin}/api/llmassist/status/${task_id}\n` +
            `${statusData.error?.message}`
          );
        }

        if (statusData.status === "SUCCESS") {
          const result = statusData.rocrate ?? statusData.result;
          if (!result) {
            throw new Error("Processing failed: missing result from LLM");
          }
          return {
            result,
            provenance: statusData.provenance,
          };
        } else if (
          statusData.status === "FAILURE" ||
          statusData.status === "ERROR"
        ) {
          const errorMsg =
            statusData.error?.message || statusData.error || "Unknown error";
          throw new Error(`Processing failed: ${errorMsg}`);
        }
      }
    },

    processDocumentsForEdit: async (
      documents: UploadedFile[],
      existingFormData: FormData
    ): Promise<FormData> => {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append("files", doc.content, doc.name);
      });

      const submitResponse = await http("/llmassist", {
        method: "POST",
        body: formData,
      });

      const { task_id } = submitResponse;

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusData = await http(`/llmassist/status/${task_id}`, {
          method: "GET",
        });

        if (statusData.status === "SUCCESS") {
          const rocratePayload = statusData.rocrate ?? statusData.result;
          if (!rocratePayload) {
            throw new Error("Processing failed: missing result from LLM");
          }
          const roCrateJson =
            typeof rocratePayload === "string"
              ? JSON.parse(rocratePayload)
              : rocratePayload;

          const datasetNode = roCrateJson["@graph"][1];

          const llmSuggestions: FormData = {};

          if (datasetNode.name) llmSuggestions.name = datasetNode.name;
          if (datasetNode.description)
            llmSuggestions.description = datasetNode.description;
          if (datasetNode.version) llmSuggestions.version = datasetNode.version;
          if (datasetNode.license) llmSuggestions.license = datasetNode.license;
          if (datasetNode.author) llmSuggestions.author = datasetNode.author;

          if (
            Array.isArray(datasetNode.keywords) &&
            datasetNode.keywords.length > 0
          ) {
            llmSuggestions.keywords = datasetNode.keywords.join(", ");
          }

          if (datasetNode.associatedPublication) {
            llmSuggestions.associatedPublication = Array.isArray(
              datasetNode.associatedPublication
            )
              ? datasetNode.associatedPublication.join("\n")
              : datasetNode.associatedPublication;
          }

          if (datasetNode.conditionsOfAccess)
            llmSuggestions.conditionsOfAccess = datasetNode.conditionsOfAccess;
          if (datasetNode.copyrightNotice)
            llmSuggestions.copyrightNotice = datasetNode.copyrightNotice;

          if (datasetNode["rai:dataCollection"])
            llmSuggestions["rai:dataCollection"] =
              datasetNode["rai:dataCollection"];

          if (
            Array.isArray(datasetNode["rai:dataCollectionType"]) &&
            datasetNode["rai:dataCollectionType"].length > 0
          ) {
            llmSuggestions["rai:dataCollectionType"] =
              datasetNode["rai:dataCollectionType"].join(", ");
          }

          if (datasetNode["rai:dataCollectionMissingData"])
            llmSuggestions["rai:dataCollectionMissingData"] =
              datasetNode["rai:dataCollectionMissingData"];
          if (datasetNode["rai:dataCollectionRawData"])
            llmSuggestions["rai:dataCollectionRawData"] =
              datasetNode["rai:dataCollectionRawData"];

          if (
            Array.isArray(datasetNode["rai:dataCollectionTimeframe"]) &&
            datasetNode["rai:dataCollectionTimeframe"].length > 0
          ) {
            llmSuggestions["rai:dataCollectionTimeframe"] =
              datasetNode["rai:dataCollectionTimeframe"].join(", ");
          }

          if (datasetNode["rai:dataImputationProtocol"])
            llmSuggestions["rai:dataImputationProtocol"] =
              datasetNode["rai:dataImputationProtocol"];
          if (datasetNode["rai:dataManipulationProtocol"])
            llmSuggestions["rai:dataManipulationProtocol"] =
              datasetNode["rai:dataManipulationProtocol"];

          if (
            Array.isArray(datasetNode["rai:dataPreprocessingProtocol"]) &&
            datasetNode["rai:dataPreprocessingProtocol"].length > 0
          ) {
            llmSuggestions["rai:dataPreprocessingProtocol"] =
              datasetNode["rai:dataPreprocessingProtocol"].join(", ");
          }

          if (datasetNode["rai:dataAnnotationProtocol"])
            llmSuggestions["rai:dataAnnotationProtocol"] =
              datasetNode["rai:dataAnnotationProtocol"];

          if (
            Array.isArray(datasetNode["rai:dataAnnotationPlatform"]) &&
            datasetNode["rai:dataAnnotationPlatform"].length > 0
          ) {
            llmSuggestions["rai:dataAnnotationPlatform"] =
              datasetNode["rai:dataAnnotationPlatform"].join(", ");
          }

          if (
            Array.isArray(datasetNode["rai:dataAnnotationAnalysis"]) &&
            datasetNode["rai:dataAnnotationAnalysis"].length > 0
          ) {
            llmSuggestions["rai:dataAnnotationAnalysis"] =
              datasetNode["rai:dataAnnotationAnalysis"].join(", ");
          }

          if (datasetNode["rai:dataReleaseMaintenancePlan"])
            llmSuggestions["rai:dataReleaseMaintenancePlan"] =
              datasetNode["rai:dataReleaseMaintenancePlan"];

          if (
            Array.isArray(datasetNode["rai:personalSensitiveInformation"]) &&
            datasetNode["rai:personalSensitiveInformation"].length > 0
          ) {
            llmSuggestions["rai:personalSensitiveInformation"] =
              datasetNode["rai:personalSensitiveInformation"].join(", ");
          }

          if (datasetNode["rai:dataSocialImpact"])
            llmSuggestions["rai:dataSocialImpact"] =
              datasetNode["rai:dataSocialImpact"];

          if (
            Array.isArray(datasetNode["rai:dataBiases"]) &&
            datasetNode["rai:dataBiases"].length > 0
          ) {
            llmSuggestions["rai:dataBiases"] =
              datasetNode["rai:dataBiases"].join(", ");
          }

          if (
            Array.isArray(datasetNode["rai:dataLimitations"]) &&
            datasetNode["rai:dataLimitations"].length > 0
          ) {
            llmSuggestions["rai:dataLimitations"] =
              datasetNode["rai:dataLimitations"].join(", ");
          }

          if (
            Array.isArray(datasetNode["rai:dataUseCases"]) &&
            datasetNode["rai:dataUseCases"].length > 0
          ) {
            llmSuggestions["rai:dataUseCases"] =
              datasetNode["rai:dataUseCases"].join(", ");
          }

          if (datasetNode["rai:annotationsPerItem"])
            llmSuggestions["rai:annotationsPerItem"] =
              datasetNode["rai:annotationsPerItem"];

          if (
            Array.isArray(datasetNode["rai:annotatorDemographics"]) &&
            datasetNode["rai:annotatorDemographics"].length > 0
          ) {
            llmSuggestions["rai:annotatorDemographics"] =
              datasetNode["rai:annotatorDemographics"].join(", ");
          }

          if (
            Array.isArray(datasetNode["rai:machineAnnotationTools"]) &&
            datasetNode["rai:machineAnnotationTools"].length > 0
          ) {
            llmSuggestions["rai:machineAnnotationTools"] =
              datasetNode["rai:machineAnnotationTools"].join(", ");
          }

          return llmSuggestions;
        } else if (
          statusData.status === "FAILURE" ||
          statusData.status === "ERROR"
        ) {
          const errorMsg =
            statusData.error?.message || statusData.error || "Unknown error";
          throw new Error(`Processing failed: ${errorMsg}`);
        }
      }
    },
  };
}

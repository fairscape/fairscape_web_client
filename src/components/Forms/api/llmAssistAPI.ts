import { useHttp } from "./httpClient";

interface UploadedFile {
  name: string;
  content: string | Blob;
}

interface FormData {
  [key: string]: any;
}

export function useLLMAssistApi() {
  const http = useHttp();

  return {
    processDocuments: async (documents: UploadedFile[]): Promise<FormData> => {
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
          const roCrateJson = JSON.parse(statusData.result);
          const datasetNode = roCrateJson["@graph"][1];

          const parsedFormData: FormData = {
            name: datasetNode.name || "",
            description: datasetNode.description || "",
            version: datasetNode.version || "1.0",
            license: datasetNode.license || "",
            author: datasetNode.author || "",
            keywords: Array.isArray(datasetNode.keywords)
              ? datasetNode.keywords.join(", ")
              : "",
            associatedPublication: Array.isArray(
              datasetNode.associatedPublication
            )
              ? datasetNode.associatedPublication.join("\n")
              : datasetNode.associatedPublication || "",
            conditionsOfAccess: datasetNode.conditionsOfAccess || "",
            copyrightNotice: datasetNode.copyrightNotice || "",
            "rai:dataCollection": datasetNode["rai:dataCollection"] || "",
            "rai:dataCollectionType": Array.isArray(
              datasetNode["rai:dataCollectionType"]
            )
              ? datasetNode["rai:dataCollectionType"].join(", ")
              : "",
            "rai:dataCollectionMissingData":
              datasetNode["rai:dataCollectionMissingData"] || "",
            "rai:dataCollectionRawData":
              datasetNode["rai:dataCollectionRawData"] || "",
            "rai:dataCollectionTimeframe": Array.isArray(
              datasetNode["rai:dataCollectionTimeframe"]
            )
              ? datasetNode["rai:dataCollectionTimeframe"].join(", ")
              : "",
            "rai:dataImputationProtocol":
              datasetNode["rai:dataImputationProtocol"] || "",
            "rai:dataManipulationProtocol":
              datasetNode["rai:dataManipulationProtocol"] || "",
            "rai:dataPreprocessingProtocol": Array.isArray(
              datasetNode["rai:dataPreprocessingProtocol"]
            )
              ? datasetNode["rai:dataPreprocessingProtocol"].join(", ")
              : "",
            "rai:dataAnnotationProtocol":
              datasetNode["rai:dataAnnotationProtocol"] || "",
            "rai:dataAnnotationPlatform": Array.isArray(
              datasetNode["rai:dataAnnotationPlatform"]
            )
              ? datasetNode["rai:dataAnnotationPlatform"].join(", ")
              : "",
            "rai:dataAnnotationAnalysis": Array.isArray(
              datasetNode["rai:dataAnnotationAnalysis"]
            )
              ? datasetNode["rai:dataAnnotationAnalysis"].join(", ")
              : "",
            "rai:dataReleaseMaintenancePlan":
              datasetNode["rai:dataReleaseMaintenancePlan"] || "",
            "rai:personalSensitiveInformation": Array.isArray(
              datasetNode["rai:personalSensitiveInformation"]
            )
              ? datasetNode["rai:personalSensitiveInformation"].join(", ")
              : "",
            "rai:dataSocialImpact": datasetNode["rai:dataSocialImpact"] || "",
            "rai:dataBiases": Array.isArray(datasetNode["rai:dataBiases"])
              ? datasetNode["rai:dataBiases"].join(", ")
              : "",
            "rai:dataLimitations": Array.isArray(
              datasetNode["rai:dataLimitations"]
            )
              ? datasetNode["rai:dataLimitations"].join(", ")
              : "",
            "rai:dataUseCases": Array.isArray(datasetNode["rai:dataUseCases"])
              ? datasetNode["rai:dataUseCases"].join(", ")
              : "",
            "rai:annotationsPerItem":
              datasetNode["rai:annotationsPerItem"] || "",
            "rai:annotatorDemographics": Array.isArray(
              datasetNode["rai:annotatorDemographics"]
            )
              ? datasetNode["rai:annotatorDemographics"].join(", ")
              : "",
            "rai:machineAnnotationTools": Array.isArray(
              datasetNode["rai:machineAnnotationTools"]
            )
              ? datasetNode["rai:machineAnnotationTools"].join(", ")
              : "",
          };

          return parsedFormData;
        } else if (statusData.status === "FAILURE") {
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
          const roCrateJson = JSON.parse(statusData.result);
          const datasetNode = roCrateJson["@graph"][1];

          const llmSuggestions: FormData = {
            name: datasetNode.name || "",
            description: datasetNode.description || "",
            version: datasetNode.version || "1.0",
            license: datasetNode.license || "",
            author: datasetNode.author || "",
            keywords: Array.isArray(datasetNode.keywords)
              ? datasetNode.keywords.join(", ")
              : "",
            associatedPublication: Array.isArray(
              datasetNode.associatedPublication
            )
              ? datasetNode.associatedPublication.join("\n")
              : datasetNode.associatedPublication || "",
            conditionsOfAccess: datasetNode.conditionsOfAccess || "",
            copyrightNotice: datasetNode.copyrightNotice || "",
            "rai:dataCollection": datasetNode["rai:dataCollection"] || "",
            "rai:dataCollectionType": Array.isArray(
              datasetNode["rai:dataCollectionType"]
            )
              ? datasetNode["rai:dataCollectionType"].join(", ")
              : "",
            "rai:dataCollectionMissingData":
              datasetNode["rai:dataCollectionMissingData"] || "",
            "rai:dataCollectionRawData":
              datasetNode["rai:dataCollectionRawData"] || "",
            "rai:dataCollectionTimeframe": Array.isArray(
              datasetNode["rai:dataCollectionTimeframe"]
            )
              ? datasetNode["rai:dataCollectionTimeframe"].join(", ")
              : "",
            "rai:dataImputationProtocol":
              datasetNode["rai:dataImputationProtocol"] || "",
            "rai:dataManipulationProtocol":
              datasetNode["rai:dataManipulationProtocol"] || "",
            "rai:dataPreprocessingProtocol": Array.isArray(
              datasetNode["rai:dataPreprocessingProtocol"]
            )
              ? datasetNode["rai:dataPreprocessingProtocol"].join(", ")
              : "",
            "rai:dataAnnotationProtocol":
              datasetNode["rai:dataAnnotationProtocol"] || "",
            "rai:dataAnnotationPlatform": Array.isArray(
              datasetNode["rai:dataAnnotationPlatform"]
            )
              ? datasetNode["rai:dataAnnotationPlatform"].join(", ")
              : "",
            "rai:dataAnnotationAnalysis": Array.isArray(
              datasetNode["rai:dataAnnotationAnalysis"]
            )
              ? datasetNode["rai:dataAnnotationAnalysis"].join(", ")
              : "",
            "rai:dataReleaseMaintenancePlan":
              datasetNode["rai:dataReleaseMaintenancePlan"] || "",
            "rai:personalSensitiveInformation": Array.isArray(
              datasetNode["rai:personalSensitiveInformation"]
            )
              ? datasetNode["rai:personalSensitiveInformation"].join(", ")
              : "",
            "rai:dataSocialImpact": datasetNode["rai:dataSocialImpact"] || "",
            "rai:dataBiases": Array.isArray(datasetNode["rai:dataBiases"])
              ? datasetNode["rai:dataBiases"].join(", ")
              : "",
            "rai:dataLimitations": Array.isArray(
              datasetNode["rai:dataLimitations"]
            )
              ? datasetNode["rai:dataLimitations"].join(", ")
              : "",
            "rai:dataUseCases": Array.isArray(datasetNode["rai:dataUseCases"])
              ? datasetNode["rai:dataUseCases"].join(", ")
              : "",
            "rai:annotationsPerItem":
              datasetNode["rai:annotationsPerItem"] || "",
            "rai:annotatorDemographics": Array.isArray(
              datasetNode["rai:annotatorDemographics"]
            )
              ? datasetNode["rai:annotatorDemographics"].join(", ")
              : "",
            "rai:machineAnnotationTools": Array.isArray(
              datasetNode["rai:machineAnnotationTools"]
            )
              ? datasetNode["rai:machineAnnotationTools"].join(", ")
              : "",
          };

          const mergedFormData: FormData = { ...existingFormData };

          Object.keys(llmSuggestions).forEach((key) => {
            const existingValue = existingFormData[key];
            const isExistingEmpty =
              existingValue === null ||
              existingValue === undefined ||
              existingValue === "" ||
              (Array.isArray(existingValue) && existingValue.length === 0);

            if (isExistingEmpty) {
              mergedFormData[key] = llmSuggestions[key];
            }
          });

          return mergedFormData;
        } else if (statusData.status === "FAILURE") {
          const errorMsg =
            statusData.error?.message || statusData.error || "Unknown error";
          throw new Error(`Processing failed: ${errorMsg}`);
        }
      }
    },
  };
}

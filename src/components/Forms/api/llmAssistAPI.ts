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

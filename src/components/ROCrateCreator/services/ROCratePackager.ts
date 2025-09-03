import JSZip from "jszip";
import { ROCrateState, MetadataObject, DataObject } from "../types";

export class ROCratePackager {
  async generate(crateState: ROCrateState): Promise<Blob> {
    const zip = new JSZip();

    const metadata = this.buildROCrateMetadata(crateState);
    zip.file("ro-crate-metadata.json", JSON.stringify(metadata, null, 2));

    const filesAdded = new Set<string>();

    for (const obj of crateState.objects.values()) {
      if (
        (obj["@type"] === "Dataset" || obj["@type"] === "Software") &&
        obj.fileData
      ) {
        const dataObj = obj as DataObject;

        if (dataObj.fileData && !filesAdded.has(dataObj.fileData.name)) {
          zip.file(dataObj.fileData.name, dataObj.fileData);
          filesAdded.add(dataObj.fileData.name);
        }
      }
    }

    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
  }

  private buildROCrateMetadata(crateState: ROCrateState): any {
    const context = {
      "@vocab": "https://schema.org/",
      EVI: "https://w3id.org/EVI#",
    };

    const graph: any[] = [
      {
        "@id": "ro-crate-metadata.json",
        "@type": "CreativeWork",
        conformsTo: {
          "@id": "https://w3id.org/ro/crate/1.1",
        },
        about: {
          "@id": "./",
        },
      },
    ];

    const rootDataset = {
      "@id": "./",
      "@type": "Dataset",
      "@context": context,
      ...crateState.root,
      hasPart: [],
    };

    const fileRefs: any[] = [];
    const computationRefs: any[] = [];
    const schemaRefs: any[] = [];

    Array.from(crateState.objects.values()).forEach((obj) => {
      const graphItem = this.objectToGraphItem(obj, crateState);
      graph.push(graphItem);

      if (obj["@type"] === "Dataset" || obj["@type"] === "Software") {
        fileRefs.push({ "@id": obj["@id"] });
      } else if (obj["@type"] === "Computation") {
        computationRefs.push({ "@id": obj["@id"] });
      } else if (obj["@type"] === "Schema") {
        schemaRefs.push({ "@id": obj["@id"] });
      }
    });

    if (fileRefs.length > 0) {
      rootDataset.hasPart = fileRefs;
    }

    if (computationRefs.length > 0) {
      rootDataset["mentions"] = computationRefs;
    }

    if (schemaRefs.length > 0) {
      rootDataset["conformsTo"] = schemaRefs;
    }

    graph.unshift(rootDataset);

    return {
      "@context": context,
      "@graph": graph,
    };
  }

  private objectToGraphItem(
    obj: MetadataObject,
    crateState: ROCrateState
  ): any {
    const item: any = {
      "@id": obj["@id"],
      "@type": this.mapObjectType(obj["@type"]),
      name: obj.name,
      description: obj.description,
    };

    if (obj.author) item.author = obj.author;
    if (obj.version) item.version = obj.version;
    if (obj.keywords && obj.keywords.length > 0) {
      item.keywords = obj.keywords.join(", ");
    }

    if (obj["@type"] === "Dataset" || obj["@type"] === "Software") {
      const dataObj = obj as DataObject;

      if (dataObj.contentUrl) {
        item.contentUrl = dataObj.contentUrl;
      } else if (dataObj.fileData) {
        item.contentUrl = `file:///${dataObj.fileData.name}`;
      }

      if (dataObj.datePublished) item.datePublished = dataObj.datePublished;
      if (dataObj.dateModified) item.dateModified = dataObj.dateModified;
      if (dataObj.dataFormat) item.encodingFormat = dataObj.dataFormat;
      if (dataObj.fileFormat) item.encodingFormat = dataObj.fileFormat;

      if (dataObj.conformsTo) {
        item.conformsTo = { "@id": dataObj.conformsTo };
      }

      if (dataObj.generatedBy) {
        item["prov:wasGeneratedBy"] = { "@id": dataObj.generatedBy };
      }

      if (dataObj.derivedFrom && dataObj.derivedFrom.length > 0) {
        item["prov:wasDerivedFrom"] = dataObj.derivedFrom.map((id) => ({
          "@id": id,
        }));
      }

      if (dataObj.usedBy && dataObj.usedBy.length > 0) {
        item["prov:used"] = dataObj.usedBy.map((id) => ({ "@id": id }));
      }
    }

    if (obj["@type"] === "Computation") {
      item["@type"] = "EVI:Computation";

      const compObj = obj as any;
      if (compObj.runBy) item["prov:wasAssociatedWith"] = compObj.runBy;
      if (compObj.dateCreated) item["prov:startedAtTime"] = compObj.dateCreated;
      if (compObj.command) item["EVI:command"] = compObj.command;

      if (compObj.usedSoftware && compObj.usedSoftware.length > 0) {
        item["prov:qualifiedUsage"] = compObj.usedSoftware.map(
          (id: string) => ({
            "@type": "prov:Usage",
            "prov:entity": { "@id": id },
            "prov:hadRole": { "@type": "prov:Role", "rdfs:label": "software" },
          })
        );
      }

      if (compObj.usedDataset && compObj.usedDataset.length > 0) {
        item["prov:used"] = compObj.usedDataset.map((id: string) => ({
          "@id": id,
        }));
      }

      if (compObj.generated && compObj.generated.length > 0) {
        item["prov:generated"] = compObj.generated.map((id: string) => ({
          "@id": id,
        }));
      }
    }

    if (obj["@type"] === "Schema") {
      item["@type"] = "EVI:Schema";

      const schemaObj = obj as any;
      if (schemaObj.properties) {
        item["EVI:properties"] = schemaObj.properties;
      }
      if (schemaObj.required) {
        item["EVI:required"] = schemaObj.required;
      }
      if (schemaObj.separator !== undefined) {
        item["EVI:separator"] = schemaObj.separator;
      }
      if (schemaObj.header !== undefined) {
        item["EVI:header"] = schemaObj.header;
      }
    }

    return item;
  }

  private mapObjectType(type: string): string {
    const typeMap: Record<string, string> = {
      Dataset: "Dataset",
      Software: "SoftwareSourceCode",
      Computation: "EVI:Computation",
      Schema: "EVI:Schema",
    };

    return typeMap[type] || type;
  }

  async validatePackage(blob: Blob): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const zip = await JSZip.loadAsync(blob);

      const metadataFile = zip.file("ro-crate-metadata.json");
      if (!metadataFile) {
        errors.push("Missing ro-crate-metadata.json file");
        return { valid: false, errors };
      }

      const metadataContent = await metadataFile.async("string");
      const metadata = JSON.parse(metadataContent);

      if (!metadata["@context"]) {
        errors.push("Missing @context in metadata");
      }

      if (!metadata["@graph"]) {
        errors.push("Missing @graph in metadata");
      } else {
        const graph = metadata["@graph"];

        const metadataDescriptor = graph.find(
          (item: any) => item["@id"] === "ro-crate-metadata.json"
        );
        if (!metadataDescriptor) {
          errors.push("Missing metadata descriptor in @graph");
        }

        const rootDataset = graph.find((item: any) => item["@id"] === "./");
        if (!rootDataset) {
          errors.push("Missing root dataset in @graph");
        }

        const referencedFiles = new Set<string>();
        graph.forEach((item: any) => {
          if (item.contentUrl && item.contentUrl.startsWith("file:///")) {
            const filename = item.contentUrl.replace("file:///", "");
            referencedFiles.add(filename);
          }
        });

        for (const filename of referencedFiles) {
          if (!zip.file(filename)) {
            errors.push(`Referenced file not found in package: ${filename}`);
          }
        }
      }
    } catch (error: any) {
      errors.push(`Failed to validate package: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

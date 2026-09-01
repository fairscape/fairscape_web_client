import {
  transformFormDataToPayload,
  getEntitySchemaType,
  getAdditionalType,
} from "./payloadTransformers";

export const fetchParentMetadata = async (
  parentArkId: string,
  metadataApi: any,
): Promise<any | null> => {
  try {
    const response = await metadataApi.getMain(parentArkId);
    return response.metadata || response;
  } catch (error) {
    console.error("Failed to fetch parent metadata:", error);
    return null;
  }
};

export const initializeCreateForm = (
  config: any,
  parentMetadata: any | null,
  parentArkId: string | null,
  entityType: string,
): any => {
  const formData: any = {};

  if (!config || !config.sections) {
    return formData;
  }

  config.sections.forEach((section: any) => {
    section.fields?.forEach((field: any) => {
      if (field.name === "@id") {
        formData[field.name] = generateArkId(entityType, "");
      } else if (field.type === "array") {
        formData[field.name] = [];
      } else {
        formData[field.name] = "";
      }
    });
  });

  if (parentMetadata && parentArkId) {
    if (parentMetadata.author) {
      formData.author = Array.isArray(parentMetadata.author)
        ? parentMetadata.author.join(", ")
        : parentMetadata.author;
    }

    if (parentMetadata.license) {
      formData.license = parentMetadata.license;
    }

    if (parentMetadata.keywords) {
      formData.keywords = Array.isArray(parentMetadata.keywords)
        ? parentMetadata.keywords.join(", ")
        : parentMetadata.keywords;
    }

    formData.version = "1.0";

    const today = new Date().toISOString().split("T")[0];
    formData.datePublished = today;

    formData.isPartOf = [{ "@id": parentArkId }];
  }

  return formData;
};

export const generateArkId = (entityType: string, name: string): string => {
  const NAAN = "59853";

  // Generate a short random string (6 characters)
  const randomStr = Math.random().toString(36).substring(2, 8);

  const safeName = (name || `entity-${randomStr}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 30);

  return `ark:${NAAN}/${entityType.toLowerCase()}-${safeName}-${randomStr}`;
};

export const generateCreatePayload = (
  entityType: string,
  formData: any,
  extraFields: any,
): any => {
  // Transform form data according to schema requirements
  const transformedData = transformFormDataToPayload(entityType, formData);

  // Get correct @type URI
  const schemaType = getEntitySchemaType(entityType);

  // Build payload with proper structure
  const payload: any = {
    "@type": schemaType,
    additionalType: getAdditionalType(entityType),
    ...transformedData,
    ...extraFields,
  };

  // Cleanup: remove empty strings, null, undefined
  // Note: Keep empty arrays as they may be meaningful
  Object.keys(payload).forEach((key) => {
    if (
      payload[key] === "" ||
      payload[key] === null ||
      payload[key] === undefined
    ) {
      delete payload[key];
    }
  });

  return payload;
};

export const validateRequiredFields = (
  formData: any,
  config: any,
): string[] => {
  const missingFields: string[] = [];

  if (!config || !config.sections) {
    return missingFields;
  }

  config.sections.forEach((section: any) => {
    section.fields?.forEach((field: any) => {
      if (field.required && field.name !== "@id") {
        const value = formData[field.name];
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          missingFields.push(field.label || field.name);
        }
      }
    });
  });

  return missingFields;
};

export const extractFileMetadata = (file: File): Partial<any> => {
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
  const mimeType = file.type || detectMimeFromExtension(file.name);
  const sizeStr = formatFileSize(file.size);

  return {
    name: nameWithoutExt,
    dataFormat: mimeType,
    fileFormat: mimeType,
    description: `File: ${file.name}, Size: ${sizeStr}`,
    contentSize: sizeStr,
    filename: file.name,
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const detectMimeFromExtension = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();

  const mimeMap: { [key: string]: string } = {
    csv: "text/csv",
    json: "application/json",
    py: "text/x-python",
    js: "application/javascript",
    ts: "application/typescript",
    jsx: "application/javascript",
    tsx: "application/typescript",
    html: "text/html",
    css: "text/css",
    xml: "application/xml",
    txt: "text/plain",
    md: "text/markdown",
    pdf: "application/pdf",
    zip: "application/zip",
    tar: "application/x-tar",
    gz: "application/gzip",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    fastq: "application/fastq",
    fasta: "application/fasta",
    bam: "application/bam",
    vcf: "text/vcf",
    bed: "text/bed",
    sam: "text/sam",
    r: "text/x-r",
    rmd: "text/x-r-markdown",
    ipynb: "application/x-ipynb+json",
  };

  return mimeMap[ext || ""] || "application/octet-stream";
};

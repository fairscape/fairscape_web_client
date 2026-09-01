import { FileType } from "../types";

const SOFTWARE_EXTENSIONS = [
  ".py",
  ".r",
  ".R",
  ".js",
  ".ts",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".rb",
  ".go",
  ".rs",
  ".swift",
  ".scala",
  ".sh",
  ".jar",
  ".exe",
  ".ipynb",
  ".rmd",
  ".Rmd",
  ".php",
  ".cs",
  ".yaml",
  ".yml",
  ".toml",
];

const DATASET_EXTENSIONS = [
  ".csv",
  ".tsv",
  ".txt",
  ".json",
  ".xml",
  ".xlsx",
  ".xls",
  ".parquet",
  ".feather",
  ".h5",
  ".hdf5",
  ".nc",
  ".netcdf",
  ".zarr",
  ".npy",
  ".npz",
  ".mat",
  ".sav",
  ".dta",
  ".rdata",
  ".rds",
  ".pkl",
  ".pickle",
  ".msgpack",
  ".arrow",
  ".orc",
  ".avro",
  ".jsonl",
  ".ndjson",
  ".geojson",
  ".shp",
  ".gpkg",
  ".kml",
  ".kmz",
  ".tiff",
  ".tif",
  ".fits",
  ".fasta",
  ".fastq",
  ".bam",
  ".sam",
  ".vcf",
  ".bed",
  ".gff",
  ".gtf",
  ".pdf",
  ".docx",
  ".doc",
];

export function detectFileType(filename: string): FileType {
  const extension = filename.toLowerCase().match(/\.[^.]*$/)?.[0] || "";

  if (SOFTWARE_EXTENSIONS.includes(extension)) {
    return "software";
  }

  return "dataset";
}

export function getDefaultMetadata(
  file: File,
  fileType: FileType,
  author: string,
) {
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const baseMetadata = {
    name: baseName,
    author: author || "",
    version: "1.0.0",
    description: "",
    keywords: [],
  };

  if (fileType === "software") {
    return {
      ...baseMetadata,
      type: "software" as const,
      dateModified: new Date().toISOString().split("T")[0],
      fileFormat: file.type || "application/octet-stream",
      usedByComputation: [],
      associatedPublication: null,
      additionalDocumentation: null,
    };
  } else {
    return {
      ...baseMetadata,
      type: "dataset" as const,
      datePublished: new Date().toISOString().split("T")[0],
      dataFormat: file.type || "application/octet-stream",
      schema: null,
      generatedBy: null,
      derivedFrom: [],
      usedBy: [],
      associatedPublication: null,
      additionalDocumentation: null,
    };
  }
}

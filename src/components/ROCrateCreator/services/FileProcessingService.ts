import { ObjectType } from "../types";

export class FileProcessingService {
  private readonly SOFTWARE_EXTENSIONS = [
    ".py",
    ".r",
    ".R",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
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
    ".m",
    ".jl",
    ".lua",
    ".pl",
    ".sql",
  ];

  private readonly DATASET_EXTENSIONS = [
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
    ".md",
    ".html",
  ];

  private readonly SCHEMA_EXTENSIONS = [
    ".xsd",
    ".schema.json",
    ".schema.yaml",
    ".schema.yml",
  ];

  async detectFileType(file: File): Promise<"software" | "dataset" | "schema"> {
    const extension = this.getFileExtension(file.name);

    if (this.SCHEMA_EXTENSIONS.includes(extension)) {
      return "schema";
    }

    if (extension && this.SOFTWARE_EXTENSIONS.includes(extension)) {
      return "software";
    }

    if (!extension || this.DATASET_EXTENSIONS.includes(extension)) {
      return "dataset";
    }

    const mimeType = file.type.toLowerCase();
    if (
      mimeType.includes("application") &&
      (mimeType.includes("javascript") ||
        mimeType.includes("python") ||
        mimeType.includes("java"))
    ) {
      return "software";
    }

    const content = await this.peekFileContent(file);
    if (content && this.looksLikeCode(content)) {
      return "software";
    }

    return "dataset";
  }

  private getFileExtension(filename: string): string {
    const match = filename.toLowerCase().match(/\.[^.]*$/);
    return match ? match[0] : "";
  }

  private async peekFileContent(
    file: File,
    bytes = 1024
  ): Promise<string | null> {
    try {
      const slice = file.slice(0, Math.min(bytes, file.size));
      const text = await slice.text();
      return text;
    } catch (error) {
      console.error("Failed to peek file content:", error);
      return null;
    }
  }

  private looksLikeCode(content: string): boolean {
    const codePatterns = [
      /^#!/,
      /^import\s+/m,
      /^from\s+.*\s+import/m,
      /^using\s+/m,
      /^#include\s*</m,
      /^package\s+/m,
      /^def\s+\w+\s*\(/m,
      /^function\s+\w+\s*\(/m,
      /^class\s+\w+/m,
      /^public\s+class/m,
      /^const\s+\w+\s*=/m,
      /^var\s+\w+\s*=/m,
      /^let\s+\w+\s*=/m,
    ];

    return codePatterns.some((pattern) => pattern.test(content));
  }

  async extractBasicMetadata(file: File): Promise<{
    format: string;
    size: number;
    lastModified: Date;
    encoding?: string;
  }> {
    let encoding: string | undefined;

    if (file.type.includes("text") || this.isTextFile(file.name)) {
      try {
        const content = await this.peekFileContent(file, 512);
        if (content) {
          encoding = this.detectEncoding(content);
        }
      } catch (error) {
        console.error("Failed to detect encoding:", error);
      }
    }

    return {
      format: file.type || this.guessContentType(file.name),
      size: file.size,
      lastModified: new Date(file.lastModified),
      encoding,
    };
  }

  private isTextFile(filename: string): boolean {
    const textExtensions = [
      ".txt",
      ".csv",
      ".tsv",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
      ".md",
      ".py",
      ".r",
      ".R",
      ".js",
      ".ts",
      ".java",
      ".cpp",
      ".c",
      ".h",
      ".sh",
      ".sql",
      ".html",
      ".css",
    ];

    const extension = this.getFileExtension(filename);
    return textExtensions.includes(extension);
  }

  private detectEncoding(content: string): string {
    if (content.charCodeAt(0) === 0xfeff) {
      return "UTF-16BE";
    }
    if (content.charCodeAt(0) === 0xfffe) {
      return "UTF-16LE";
    }
    if (content.startsWith("\xEF\xBB\xBF")) {
      return "UTF-8";
    }

    const hasHighBytes = Array.from(content).some(
      (char) => char.charCodeAt(0) > 127
    );

    return hasHighBytes ? "UTF-8" : "ASCII";
  }

  private guessContentType(filename: string): string {
    const extension = this.getFileExtension(filename);

    const mimeTypes: Record<string, string> = {
      ".csv": "text/csv",
      ".tsv": "text/tab-separated-values",
      ".json": "application/json",
      ".xml": "application/xml",
      ".txt": "text/plain",
      ".pdf": "application/pdf",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".xls": "application/vnd.ms-excel",
      ".py": "text/x-python",
      ".r": "text/x-r",
      ".R": "text/x-r",
      ".js": "application/javascript",
      ".ts": "application/typescript",
      ".java": "text/x-java",
      ".cpp": "text/x-c++",
      ".c": "text/x-c",
      ".sh": "application/x-sh",
      ".html": "text/html",
      ".md": "text/markdown",
    };

    return mimeTypes[extension] || "application/octet-stream";
  }

  async validateFile(file: File): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const maxSize = 5 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File exceeds maximum size of 5GB`);
    }

    if (file.size === 0) {
      errors.push("File is empty");
    }

    if (file.size > 100 * 1024 * 1024) {
      warnings.push("Large file may take time to process");
    }

    const dangerousExtensions = [".exe", ".dll", ".app", ".deb", ".rpm"];
    const extension = this.getFileExtension(file.name);
    if (dangerousExtensions.includes(extension)) {
      warnings.push("Executable files may pose security risks");
    }

    if (!/^[\w\-. ()]+$/.test(file.name)) {
      warnings.push(
        "Filename contains special characters that may cause issues"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  generateFileId(file: File, prefix: string = "file"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 20);

    return `${prefix}-${safeName}-${timestamp}-${random}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

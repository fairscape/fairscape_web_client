// Schema definition based on Output Pydantic model
const outputSchema = {
  title: "Output Information",
  description:
    "Enter information about the output files and data generated from experiments",
  type: "object",
  properties: {
    items: {
      type: "array",
      title: "Outputs",
      description: "List of outputs",
      minItems: 1,
      items: {
        type: "object",
        required: ["title", "experiment_ref", "published"],
        properties: {
          title: {
            type: "string",
            title: "Title",
            description: "Output title",
          },
          experiment_ref: {
            type: "string",
            title: "Experiment Reference",
            description:
              "Reference to the experiment that produced this output",
          },
          published: {
            type: "string",
            title: "Published Date",
            description: "Date when the output was published",
            format: "date",
          },
          files: {
            type: "array",
            title: "Output Files",
            description: "Files associated with this output",
            minItems: 1,
            items: {
              type: "object",
              required: ["filename", "size", "url", "md5"],
              properties: {
                filename: {
                  type: "string",
                  title: "Filename",
                  description: "Name of the file",
                },
                size: {
                  type: "string",
                  title: "File Size",
                  description: "Size in bytes or formatted (e.g., '1.2 GB')",
                },
                url: {
                  type: "string",
                  title: "File URL",
                  description: "URL to access the file",
                },
                md5: {
                  type: "string",
                  title: "MD5 Checksum",
                  description: "File integrity checksum",
                },
              },
            },
          },
        },
      },
    },
  },
  // Define common fields that should be shared across all outputs
  commonFields: ["experiment_ref", "published"],
};

export default outputSchema;

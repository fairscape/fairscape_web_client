// Schema definition based on Sample Pydantic model
const sampleSchema = {
  title: "Sample Information",
  description:
    "Enter information about the biological samples used in this project",
  type: "object",
  properties: {
    items: {
      type: "array",
      title: "Samples",
      description: "List of samples",
      minItems: 1,
      items: {
        type: "object",
        required: [
          "cell_line_of_sample",
          "scientific_name",
          "taxon_id",
          "sample_name",
        ],
        properties: {
          sample_name: {
            type: "string",
            title: "Sample Name",
            description: "Name of the sample",
          },
          cell_line_of_sample: {
            type: "string",
            title: "Cell Line Of Sample",
            description: "Cell line used in this sample",
          },
          scientific_name: {
            type: "string",
            title: "Scientific Name",
            description: "Scientific name of the organism",
            default: "Homo sapiens",
          },
          taxon_id: {
            type: "string",
            title: "Taxon ID",
            description: "NCBI taxonomy identifier",
            default: "9606",
          },
        },
      },
    },
  },
  // Define common fields that should be shared across all samples
  commonFields: ["scientific_name", "taxon_id", "cell_line_of_sample"],
};

export default sampleSchema;

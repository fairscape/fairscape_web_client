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
        required: ["accession", "scientific_name", "taxon_id"],
        properties: {
          accession: {
            type: "string",
            title: "Accession",
            description: "Unique sample identifier",
          },
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
          title: {
            type: "string",
            title: "Title",
            description: "Sample title",
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
          attributes: {
            type: "object",
            title: "Sample Attributes",
            description: "Custom attributes for this sample",
            additionalProperties: {
              type: "string",
            },
          },
          study_accession: {
            type: "string",
            title: "Study Accession",
            description: "Accession number of the associated study",
          },
          study_center_name: {
            type: "string",
            title: "Study Center Name",
            description: "Name of the center conducting the study",
          },
          study_title: {
            type: "string",
            title: "Study Title",
            description: "Title of the associated study",
          },
          study_abstract: {
            type: "string",
            title: "Study Abstract",
            description: "Abstract of the study",
            format: "textarea",
          },
          study_description: {
            type: "string",
            title: "Study Description",
            description: "Detailed description of the study",
            format: "textarea",
          },
        },
      },
    },
  },
  // Define common fields that should be shared across all samples
  commonFields: [
    "scientific_name",
    "taxon_id",
    "cell_line_of_sample",
    "study_accession",
    "study_center_name",
  ],
};

export default sampleSchema;

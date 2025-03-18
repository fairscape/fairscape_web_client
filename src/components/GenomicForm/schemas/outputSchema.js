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
        required: ["accession", "title", "experiment_ref", "size", "published"],
        properties: {
          accession: {
            type: "string",
            title: "Accession",
            description: "Unique output identifier",
          },
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
          total_spots: {
            type: "string",
            title: "Total Spots",
            description: "Total number of spots",
          },
          total_bases: {
            type: "string",
            title: "Total Bases",
            description: "Total number of bases",
          },
          size: {
            type: "string",
            title: "Size",
            description: "Total size of output data, e.g. '2.3 GB'",
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
              required: ["filename", "size", "date", "url", "md5"],
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
                date: {
                  type: "string",
                  title: "File Date",
                  description: "Date when the file was created or modified",
                  format: "date",
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
          nreads: {
            type: "string",
            title: "Number of Reads",
            description: "Total number of reads",
          },
          nspots: {
            type: "string",
            title: "Number of Spots",
            description: "Total number of spots",
          },
          a_count: {
            type: "string",
            title: "A Count",
            description: "Count of adenine nucleotides",
          },
          c_count: {
            type: "string",
            title: "C Count",
            description: "Count of cytosine nucleotides",
          },
          g_count: {
            type: "string",
            title: "G Count",
            description: "Count of guanine nucleotides",
          },
          t_count: {
            type: "string",
            title: "T Count",
            description: "Count of thymine nucleotides",
          },
          n_count: {
            type: "string",
            title: "N Count",
            description: "Count of unknown nucleotides",
          },
        },
      },
    },
  },
};

export default outputSchema;

// Schema definition based on Project Pydantic model
const projectSchema = {
  title: "Project Information",
  description: "Enter details about the genomic project",
  type: "object",
  required: ["id", "title"],
  properties: {
    id: {
      type: "string",
      title: "Project ID",
      description: "A unique identifier for the project",
    },
    title: {
      type: "string",
      title: "Title",
    },
    archive: {
      type: "string",
      title: "Archive",
      default: "Unknown",
    },
    description: {
      type: "string",
      title: "Description",
      format: "textarea",
    },
    release_date: {
      type: "string",
      title: "Release Date",
      format: "date",
    },
    organism_species: {
      type: "string",
      title: "Organism Species",
      default: "Homo sapiens",
    },
    organism_taxID: {
      type: "string",
      title: "Organism Tax ID",
    },
    method: {
      type: "string",
      title: "Method",
    },
    submitted_date: {
      type: "string",
      title: "Submitted Date",
      format: "date",
    },
    organization_name: {
      type: "string",
      title: "Organization Name",
    },
  },
};

export default projectSchema;

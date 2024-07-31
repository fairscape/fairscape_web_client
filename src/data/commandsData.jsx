const commands = {
  "1: Init": {
    description: "Creates an empty RO-Crate at the path you select.",
    init: {
      description: "Creates an empty RO-Crate at the path you select.",
      options: [
        "guid",
        "name",
        "organization_name",
        "project_name",
        "description",
        "keywords",
      ],
      required: [
        "guid",
        "name",
        "organization_name",
        "project_name",
        "description",
        "keywords",
      ],
    },
  },
  "2: Register": {
    description:
      "Register each file in your RO-Crate with descriptive metadata.",
    computation: {
      description:
        "Add metadata describing a computation, dataset or software to the RO-Crate.",
      options: [
        "guid",
        "name",
        "run-by",
        "command",
        "date-created",
        "description",
        "keywords",
        "used-software",
        "used-dataset",
        "generated",
      ],
      required: [
        "guid",
        "name",
        "run-by",
        "date-created",
        "description",
        "keywords",
      ],
    },
    dataset: {
      description:
        "Add metadata describing a computation, dataset or software to the RO-Crate.",
      options: [
        "guid",
        "name",
        "url",
        "author",
        "version",
        "date-published",
        "description",
        "keywords",
        "data-format",
        "filepath",
        "used-by",
        "derived-from",
        "schema",
        "associated-publication",
        "additional-documentation",
      ],
      required: [
        "guid",
        "name",
        "author",
        "version",
        "date-published",
        "description",
        "keywords",
        "data-format",
      ],
    },
    software: {
      description:
        "Add metadata describing a computation, dataset or software to the RO-Crate.",
      options: [
        "guid",
        "name",
        "author",
        "version",
        "description",
        "keywords",
        "file-format",
        "url",
        "date-modified",
        "filepath",
        "used-by-computation",
        "associated-publication",
        "additional-documentation",
      ],
      required: [
        "guid",
        "name",
        "author",
        "version",
        "description",
        "keywords",
        "file-format",
      ],
    },
  },
  "3: Package": {
    description: "Reformat the RO-Crate to make a zip file ready for upload.",
    zip: {
      description: "Reformat the RO-Crate to make a zip file ready for upload.",
      options: ["path"],
      required: ["path"],
    },
  },
  "4: Upload": {
    description: "Upload a packaged RO-Crate to Fairscape.",
    rocrate: {
      description: "Upload a packaged RO-Crate to Fairscape.",
      options: ["file"],
      required: ["file"],
    },
  },
};

export default commands;

const commands = {
  "1: Create": {
    create: {
      create: {
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
        description: "Creates an empty RO-Crate at the path you select.",
      },
    },
  },
  "2: Add": {
    add: {
      description:
        "Copies a local file to the recently created RO-Crate with metadata.",
      dataset: {
        description:
          "Copies a local file to the recently created RO-Crate with metadata.",
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
          "source-filepath",
          "destination-filepath",
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
          "source-filepath",
          "destination-filepath",
        ],
      },
      software: {
        description:
          "Copies a local file to the recently created RO-Crate with metadata.",
        options: [
          "guid",
          "name",
          "author",
          "version",
          "description",
          "keywords",
          "file-format",
          "url",
          "source-filepath",
          "destination-filepath",
          "date-modified",
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
          "source-filepath",
          "destination-filepath",
          "date-modified",
        ],
      },
    },
    register: {
      computation: {
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
          "filepath",
        ],
      },
      software: {
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
  },
  // schema: {
  //   "create-tabular": {
  //     create: {
  //       options: ["name", "description", "guid", "separator", "header"],
  //       required: ["name", "description", "separator"],
  //     },
  //   },
  //   "add-property": {
  //     string: {
  //       options: ["name", "index", "description", "value-url", "pattern"],
  //       required: ["name", "index", "description"],
  //     },
  //     number: {
  //       options: ["name", "index", "description", "value-url"],
  //       required: ["name", "index", "description"],
  //     },
  //     integer: {
  //       options: ["name", "index", "description", "value-url"],
  //       required: ["name", "index", "description"],
  //     },
  //     array: {
  //       options: [
  //         "name",
  //         "index",
  //         "description",
  //         "value-url",
  //         "items-datatype",
  //         "min-items",
  //         "max-items",
  //         "unique-items",
  //       ],
  //       required: ["name", "index", "description", "items-datatype"],
  //     },
  //     boolean: {
  //       options: ["name", "index", "description", "value-url"],
  //       required: ["name", "index", "description"],
  //     },
  //   },
  //   validate: {
  //     validate: {
  //       options: ["data", "schema"],
  //       required: ["data", "schema"],
  //     },
  //   },
  // },
  "3: Package": {
    zip: {
      zip: {
        options: ["path"],
        required: ["path"],
      },
    },
  },
  "4: Upload": {
    rocrate: {
      rocrate: {
        options: ["file"],
        required: ["file"],
      },
    },
  },
};

export default commands;

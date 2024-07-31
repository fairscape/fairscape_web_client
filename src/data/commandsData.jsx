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
    description: "Register files in your RO-Crate metadata.",
    // add: {
    //   description:
    //     "Copies a local file to the recently created RO-Crate with metadata.",
    //   dataset: {
    //     description:
    //       "Copies a local file to the recently created RO-Crate with metadata.",
    //     options: [
    //       "guid",
    //       "name",
    //       "url",
    //       "author",
    //       "version",
    //       "date-published",
    //       "description",
    //       "keywords",
    //       "data-format",
    //       "source-filepath",
    //       "destination-filepath",
    //       "used-by",
    //       "derived-from",
    //       "schema",
    //       "associated-publication",
    //       "additional-documentation",
    //     ],
    //     required: [
    //       "guid",
    //       "name",
    //       "author",
    //       "version",
    //       "date-published",
    //       "description",
    //       "keywords",
    //       "data-format",
    //       "source-filepath",
    //       "destination-filepath",
    //     ],
    //   },
    //   software: {
    //     description: "Copy local files to the RO-Crate with metadata.",
    //     options: [
    //       "guid",
    //       "name",
    //       "author",
    //       "version",
    //       "description",
    //       "keywords",
    //       "file-format",
    //       "url",
    //       "source-filepath",
    //       "destination-filepath",
    //       "date-modified",
    //       "used-by-computation",
    //       "associated-publication",
    //       "additional-documentation",
    //     ],
    //     required: [
    //       "guid",
    //       "name",
    //       "author",
    //       "version",
    //       "description",
    //       "keywords",
    //       "file-format",
    //       "source-filepath",
    //       "destination-filepath",
    //     ],
    //   },
    // },
    register: {
      description:
        "Add metadata describing a computation, dataset or software without copying the file to the RO-Crate.",
      computation: {
        description:
          "Add metadata describing a computation, dataset or software without copying the file to the RO-Crate.",
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
          "Add metadata describing a computation, dataset or software without copying the file to the RO-Crate.",
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
          "Add metadata describing a computation, dataset or software without copying the file to the RO-Crate.",
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
    description: "Reformat the RO-Crate to make a zip file ready for upload.",
    zip: {
      description: "Reformat the RO-Crate to make a zip file ready for upload.",
      zip: {
        description:
          "Reformat the RO-Crate to make a zip file ready for upload.",
        options: ["path"],
        required: ["path"],
      },
    },
  },
  "4: Upload": {
    description: "Upload a packaged RO-Crate to Fairscape.",
    rocrate: {
      description: "Upload a packaged RO-Crate to Fairscape.",
      rocrate: {
        description: "Upload a packaged RO-Crate to Fairscape.",
        options: ["file"],
        required: ["file"],
      },
    },
  },
};

export default commands;

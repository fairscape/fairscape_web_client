const duckdb = require("duckdb");
const Ajv2020 = require("ajv/dist/2020");
const path = require("path");
const fs = require("fs");

let hdf5;

async function initHDF5() {
  if (!hdf5) {
    hdf5 = await import("hdf5-io");
  }
  return hdf5;
}

const FileType = {
  CSV: "csv",
  TSV: "tsv",
  PARQUET: "parquet",
  HDF5: "h5",

  fromExtension(filepath) {
    const ext = path.extname(filepath).toLowerCase().slice(1);
    if (ext === "h5" || ext === "hdf5") return this.HDF5;
    if (ext === "parquet") return this.PARQUET;
    if (ext === "tsv") return this.TSV;
    if (ext === "csv") return this.CSV;
    throw new Error(`Unsupported file extension: ${ext}`);
  },
};

const DatatypeEnum = {
  NULL: "null",
  BOOLEAN: "boolean",
  STRING: "string",
  NUMBER: "number",
  INTEGER: "integer",
  ARRAY: "array",
};

const DEFAULT_CONTEXT = {};
const DEFAULT_SCHEMA_TYPE = "EVI:Schema";
const NAAN = "12345";

function mapDuckDBTypeToJsonSchema(duckDBType) {
  const typeMap = {
    INTEGER: "integer",
    BIGINT: "integer",
    DOUBLE: "number",
    VARCHAR: "string",
    BOOLEAN: "boolean",
  };
  return typeMap[duckDBType.toUpperCase()] || "string";
}

class BaseProperty {
  constructor({ description, index, valueURL = null, type }) {
    this.description = description;
    this.index = index;
    this.valueURL = valueURL;
    this.type = type;
  }
}

class StringProperty extends BaseProperty {
  constructor({
    description,
    index,
    pattern = null,
    maxLength = null,
    minLength = null,
  }) {
    super({ description, index, type: "string" });
    this.pattern = pattern;
    this.maxLength = maxLength;
    this.minLength = minLength;
  }
}

class NumberProperty extends BaseProperty {
  constructor({ description, index, maximum = null, minimum = null }) {
    super({ description, index, type: "number" });
    this.maximum = maximum;
    this.minimum = minimum;

    if (maximum !== null && minimum !== null) {
      if (maximum === minimum) {
        throw new Error("NumberProperty attribute minimum != maximum");
      }
      if (maximum < minimum) {
        throw new Error("NumberProperty attribute maximum !< minimum");
      }
    }
  }
}

class TabularValidationSchema {
  constructor({
    name,
    description,
    properties = {},
    required = [],
    separator = ",",
    header = false,
  }) {
    this.name = name;
    this.description = description;
    this.properties = properties;
    this.required = required;
    this.separator = separator;
    this.header = header;
    this.type = "object";
    this.schema = "https://json-schema.org/draft/2020-12/schema";
    this["@context"] = DEFAULT_CONTEXT;
    this["@type"] = DEFAULT_SCHEMA_TYPE;
  }

  static async inferFromFile(filepath, name, description) {
    const fileType = FileType.fromExtension(filepath);
    const separator = fileType === FileType.TSV ? "\t" : ",";

    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(":memory:");
      const query =
        fileType === FileType.PARQUET
          ? `DESCRIBE SELECT * FROM read_parquet('${filepath}')`
          : `DESCRIBE SELECT * FROM read_csv('${filepath}', AUTO_DETECT=TRUE, SEP='${separator}')`;

      db.all(query, (err, columns) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        try {
          const properties = {};
          columns.forEach((column, index) => {
            const type = mapDuckDBTypeToJsonSchema(column.column_type);

            if (type === "number") {
              properties[column.column_name] = new NumberProperty({
                description: `Column ${column.column_name}`,
                index: index.toString(),
                type: type,
              });
            } else {
              properties[column.column_name] = new StringProperty({
                description: `Column ${column.column_name}`,
                index: index.toString(),
                type: type,
              });
            }
          });

          const schema = new TabularValidationSchema({
            name,
            description,
            properties,
            required: Object.keys(properties),
            separator,
            header: true,
          });

          db.close();
          resolve(schema);
        } catch (error) {
          db.close();
          reject(new Error(`Error creating schema: ${error.message}`));
        }
      });
    });
  }
}

function mapDuckDBTypeToJsonSchema(duckDBType) {
  const typeMap = {
    INTEGER: "integer",
    BIGINT: "string", // Changed to avoid BigInt issues
    DOUBLE: "number",
    FLOAT: "number",
    VARCHAR: "string",
    BOOLEAN: "boolean",
    DATE: "string",
    TIMESTAMP: "string",
    TIME: "string",
    DECIMAL: "number",
  };
  return typeMap[duckDBType.toUpperCase()] || "string";
}

class HDF5Schema {
  constructor({ name, description, properties = {} }) {
    this.name = name;
    this.description = description;
    this.properties = properties;
    this.required = Object.keys(properties);
  }

  static async inferFromFile(
    filepath,
    name,
    description,
    includeMinMax = false
  ) {
    const h5module = await initHDF5();
    const h5 = new h5module.File(filepath, "r");
    const properties = {};

    await this.processGroup(
      h5,
      "",
      properties,
      name,
      description,
      includeMinMax
    );

    h5.close();
    return new HDF5Schema({
      name,
      description,
      properties,
    });
  }

  static async processGroup(
    group,
    parentPath,
    properties,
    name,
    description,
    includeMinMax
  ) {
    const h5module = await initHDF5();
    const groupInfo = group.getGroupInfo();

    for (const item of groupInfo.links) {
      const path = parentPath ? `${parentPath}/${item.name}` : item.name;

      if (item.type === h5module.H5L.TYPE.DATASET) {
        try {
          const dataset = group.openDataset(item.name);
          const data = await this.datasetToArray(dataset);
          const db = new duckdb.Database(":memory:");

          const schema = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM data", (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              const schemaInstance = new TabularValidationSchema({
                name: `${name}_${path.replace("/", "_")}`,
                description: `Dataset at ${path}`,
                properties: {},
                required: [],
                separator: ",",
                header: true,
              });
              resolve(schemaInstance);
              db.close();
            });
          });

          properties[path] = schema;
          dataset.close();
        } catch (e) {
          console.warn(`Could not convert dataset ${path}: ${e.message}`);
        }
      } else if (item.type === h5module.H5L.TYPE.GROUP) {
        const subgroup = group.openGroup(item.name);
        await this.processGroup(
          subgroup,
          path,
          properties,
          name,
          description,
          includeMinMax
        );
        subgroup.close();
      }
    }
  }

  static async datasetToArray(dataset) {
    const h5module = await initHDF5();
    const space = dataset.getSpace();
    const dims = space.getSimpleExtentDims();
    const data = await dataset.read();

    if (dataset.getType().getClass() === h5module.H5T.CLASS.COMPOUND) {
      return data;
    }

    if (dims.length > 1) {
      const cols = dims[1] || 1;
      return Array.from({ length: cols }, (_, i) => ({
        [`column_${i}`]: data.map((row) => row[i]),
      }));
    }

    return data.map((value) => ({ value }));
  }

  async validateFile(filepath) {
    const h5module = await initHDF5();
    const h5 = new h5module.File(filepath, "r");
    const errors = [];

    for (const [path, schema] of Object.entries(this.properties)) {
      try {
        const dataset = h5.openDataset(path);
        if (dataset) {
          const data = await HDF5Schema.datasetToArray(dataset);
          const db = new duckdb.Database(":memory:");

          const datasetErrors = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM data", (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              const ajv = new Ajv2020({ strict: false });
              const validate = ajv.compile(schema.toJsonSchema());
              const errors = [];

              result.forEach((row, index) => {
                if (!validate(row)) {
                  validate.errors.forEach((error) => {
                    errors.push({
                      message: error.message,
                      row: index,
                      field: error.instancePath.slice(1),
                      type: "ValidationError",
                      failedKeyword: error.keyword,
                    });
                  });
                }
              });

              resolve(errors);
              db.close();
            });
          });

          datasetErrors.forEach((error) => {
            error.path = path;
          });
          errors.push(...datasetErrors);
          dataset.close();
        }
      } catch (e) {
        errors.push({
          message: `Error validating dataset ${path}: ${e.message}`,
          path,
          type: "ValidationError",
          failedKeyword: "format",
        });
      }
    }

    h5.close();
    return errors;
  }
}

module.exports = {
  FileType,
  DatatypeEnum,
  TabularValidationSchema,
  HDF5Schema,
  StringProperty,
  NumberProperty,
};

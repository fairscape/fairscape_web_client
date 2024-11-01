const duckdb = require("duckdb");
const Ajv2020 = require("ajv/dist/2020");
import h5wasm from "h5wasm";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

let h5wasm;

async function initHDF5() {
  if (!h5wasm) {
    h5wasm = await import("h5wasm/node");
    await h5wasm.ready;
  }
  return h5wasm;
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

  async validateFile(filepath) {
    const fileType = FileType.fromExtension(filepath);
    const separator = fileType === FileType.TSV ? "\t" : this.separator;

    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(":memory:");
      const query =
        fileType === FileType.PARQUET
          ? `SELECT * FROM read_parquet('${filepath}')`
          : `SELECT * FROM read_csv('${filepath}', AUTO_DETECT=TRUE, SEP='${separator}', HEADER=${this.header})`;

      db.all(query, (err, data) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        try {
          const ajv = new Ajv2020({ strict: false });
          const schema = this.toJsonSchema();

          // Helper function to make a field nullable
          const makeNullable = (schema) => {
            if (typeof schema !== "object" || !schema) return schema;

            const newSchema = { ...schema };

            // Handle properties
            if (newSchema.properties) {
              Object.keys(newSchema.properties).forEach((key) => {
                const prop = newSchema.properties[key];
                if (prop.type === "number" || prop.type === "integer") {
                  newSchema.properties[key] = {
                    ...prop,
                    type: [prop.type, "null"],
                  };
                }
              });
            }

            return newSchema;
          };

          // Make all number/integer fields nullable
          const nullableSchema = makeNullable(schema);
          const validate = ajv.compile(nullableSchema);
          const errors = [];

          data.forEach((row, index) => {
            if (!validate(row)) {
              validate.errors.forEach((error) => {
                // Helper function to check if a property has a pattern constraint
                const hasPatternConstraint = (path) => {
                  let currentSchema = schema;
                  const parts = path.split("/").filter(Boolean);

                  for (const part of parts) {
                    currentSchema = currentSchema.properties?.[part];
                  }

                  return currentSchema?.pattern !== undefined;
                };

                // Only include errors that are:
                // 1. Not type errors for strings
                // 2. Or string errors with pattern validation
                // 3. Or any other kind of error
                const isStringTypeError =
                  error.keyword === "type" && error.params.type === "string";

                const shouldIncludeError =
                  !isStringTypeError ||
                  (isStringTypeError &&
                    hasPatternConstraint(error.instancePath));

                if (shouldIncludeError) {
                  errors.push({
                    message: error.message,
                    row: index,
                    field: error.instancePath.slice(1),
                    type: "ValidationError",
                    failedKeyword: error.keyword,
                    value: row[error.instancePath.slice(1)],
                  });
                }
              });
            }
          });

          db.close();
          resolve(errors);
        } catch (error) {
          db.close();
          reject(new Error(`Error validating file: ${error.message}`));
        }
      });
    });
  }

  toJsonSchema() {
    return {
      $schema: this.schema,
      type: this.type,
      properties: this.properties,
      required: this.required,
      additionalProperties: true,
    };
  }
}

class HDF5Schema {
  constructor({
    name,
    description,
    properties = {},
    required = [],
    identifier = "",
  }) {
    this.name = name;
    this.description = description;
    this.properties = properties;
    this.required = required;
    this.identifier = identifier;
    this.type = "object";
    this.schema = "https://json-schema.org/draft/2020-12/schema";
    this["@context"] = DEFAULT_CONTEXT;
    this["@type"] = DEFAULT_SCHEMA_TYPE;
  }

  static async inferFromFile(filepath, name, description) {
    if (!existsSync(filepath)) {
      throw new Error(`File not found: ${filepath}`);
    }

    const h5 = await initHDF5();
    const { FS } = h5;

    try {
      // Create temporary file in WASM filesystem
      const fileBuffer = readFileSync(filepath);
      const tempFileName = "temp_data.h5";
      FS.writeFile(tempFileName, new Uint8Array(fileBuffer));

      // Process file
      const f = new h5.File(tempFileName, "r");
      const properties = {};
      const required = [];

      // Helper function to explore groups recursively
      const exploreGroup = (group, prefix = "") => {
        const keys = group.keys();

        for (const key of keys) {
          try {
            const item = group.get(key);
            const fullPath = prefix ? `${prefix}/${key}` : key;

            if (item.constructor.name === "Dataset") {
              const property = createDatasetProperty(item, fullPath);
              properties[fullPath] = property;
              required.push(fullPath);
            } else if (item.constructor.name === "Group") {
              exploreGroup(item, fullPath);
            }
          } catch (error) {
            console.error(`Error processing key ${key}:`, error);
          }
        }
      };

      // Start exploration from root
      exploreGroup(f);

      f.close();
      FS.unlink(tempFileName);

      return new HDF5Schema({
        name,
        description,
        properties,
        required,
        identifier: name.toLowerCase().replace(/\s+/g, "-"),
      });
    } catch (error) {
      throw new Error(`Error creating schema: ${error.message}`);
    }
  }

  toJsonSchema() {
    return {
      $schema: this.schema,
      type: this.type,
      properties: this.properties,
      required: this.required,
      additionalProperties: true,
    };
  }
}

// Helper function to create property schema for a dataset
function createDatasetProperty(dataset, path) {
  if (!dataset.dtype.compound_type) {
    return new StringProperty({
      description: `Dataset at ${path}`,
      index: "0",
      type: "string",
    });
  }

  const properties = {};
  const required = [];

  dataset.dtype.compound_type.members.forEach((member, index) => {
    const propertyName = member.name;
    required.push(propertyName);

    switch (member.type) {
      case 0: // Integer
        properties[propertyName] = new BaseProperty({
          description: `Column ${propertyName}`,
          index: index.toString(),
          type: "integer",
        });
        break;
      case 1: // Float
        properties[propertyName] = new NumberProperty({
          description: `Column ${propertyName}`,
          index: index.toString(),
        });
        break;
      case 3: // String
        properties[propertyName] = new StringProperty({
          description: `Column ${propertyName}`,
          index: index.toString(),
        });
        break;
      case 8: // Boolean
        if (member.enum_type) {
          properties[propertyName] = new BaseProperty({
            description: `Column ${propertyName}`,
            index: index.toString(),
            type: "boolean",
          });
          break;
        }
      default:
        properties[propertyName] = new StringProperty({
          description: `Column ${propertyName}`,
          index: index.toString(),
        });
    }
  });

  return {
    "@type": DEFAULT_SCHEMA_TYPE,
    "@context": DEFAULT_CONTEXT,
    schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties,
    required,
    additionalProperties: true,
    description: `Dataset at ${path}`,
  };
}

module.exports = {
  FileType,
  DatatypeEnum,
  TabularValidationSchema,
  HDF5Schema,
  StringProperty,
  NumberProperty,
};

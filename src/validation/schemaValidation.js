const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const duckdb = require("duckdb");
const fs = require("fs").promises;
const path = require("path");
const { Schema } = require("../models/schema");

class TabularValidationSchema extends Schema {
  constructor(schemaData) {
    super(schemaData);

    // Initialize AJV with 2020 support
    this.ajv = new Ajv2020({ allErrors: true, verbose: true, strict: false });
    addFormats(this.ajv);
    this.validate = this.ajv.compile(this.getJsonSchema());
  }

  getJsonSchema() {
    return {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: this.datatype,
      properties: this.properties,
      required: this.required,
      additionalProperties: this.additionalProperties,
    };
  }

  async loadData(dataPath) {
    const fileExtension = path.extname(dataPath).toLowerCase();

    if (fileExtension === ".csv") {
      return this.loadCsvData(dataPath);
    } else if (fileExtension === ".parquet") {
      return this.loadParquetData(dataPath);
    } else {
      throw new Error(
        "Unsupported file format. Only CSV and Parquet files are supported."
      );
    }
  }

  async loadCsvData(dataPath) {
    const fileContent = await fs.readFile(dataPath, "utf8");
    const rows = fileContent
      .trim()
      .split("\n")
      .map((row) => row.split(this.separator));

    if (this.header) {
      rows.shift(); // Remove header row
    }

    return rows;
  }

  async loadParquetData(dataPath) {
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(":memory:");
      db.all(`SELECT * FROM read_parquet('${dataPath}')`, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const rows = result.map((row) => Object.values(row));
          resolve(rows);
        }
        db.close();
      });
    });
  }

  async convertToJson(dataPath) {
    const dataRows = await this.loadData(dataPath);
    const defaultRowLength = dataRows[0].length;

    const propertiesSimplified = Object.entries(this.properties).map(
      ([propertyName, propertyData]) => ({
        name: propertyName,
        index: propertyData.index,
        type: propertyData.type,
        items: propertyData.items?.type,
        indexSlice: null,
        accessFunction: null,
      })
    );

    const updatedProperties = propertiesSimplified.map((prop) => {
      const indexSlice = prop.index;
      const datatype = prop.type;
      const itemDatatype = prop.items;

      prop.indexSlice = indexSlice;

      if (datatype === "array") {
        const generatedSlice = generateSlice(indexSlice, defaultRowLength);
        prop.indexSlice = generatedSlice;

        if (itemDatatype === "boolean") {
          prop.accessFunction = (row, slice) =>
            slice.map((i) => parseBoolean(row[i]));
        } else if (itemDatatype === "integer") {
          prop.accessFunction = (row, slice) =>
            slice.map((i) => parseInt(row[i]));
        } else if (itemDatatype === "number") {
          prop.accessFunction = (row, slice) =>
            slice.map((i) => parseFloat(row[i]));
        } else if (itemDatatype === "string") {
          prop.accessFunction = (row, slice) =>
            slice.map((i) => String(row[i]));
        }
      } else if (datatype === "boolean") {
        prop.accessFunction = (row, index) => parseBoolean(row[index]);
      } else if (datatype === "integer") {
        prop.accessFunction = (row, index) => parseInt(row[index]);
      } else if (datatype === "number") {
        prop.accessFunction = (row, index) => parseFloat(row[index]);
      } else if (datatype === "string") {
        prop.accessFunction = (row, index) => String(row[index]);
      } else if (datatype === "null") {
        prop.accessFunction = () => null;
      }

      return prop;
    });

    const jsonOutput = [];
    const parsingFailures = [];

    dataRows.forEach((row, i) => {
      const jsonRow = {};
      let rowError = false;

      updatedProperties.forEach((jsonAttribute) => {
        const attributeName = jsonAttribute.name;
        const accessFunc = jsonAttribute.accessFunction;
        const attributeSlice = jsonAttribute.indexSlice;

        try {
          jsonRow[attributeName] = accessFunc(row, attributeSlice);
        } catch (e) {
          parsingFailures.push({
            message: `Error: Failed to Parse Attribute ${attributeName} for Row ${i}`,
            type: "ParsingError",
            row: i,
            exception: e.message,
          });
          rowError = true;
        }
      });

      if (!rowError) {
        jsonOutput.push(jsonRow);
      }
    });

    return { jsonOutput, parsingFailures };
  }

  async executeValidation(dataPath) {
    const { jsonOutput, parsingFailures } = await this.convertToJson(dataPath);
    const outputExceptions = [...parsingFailures];

    jsonOutput.forEach((jsonElem, i) => {
      if (!this.validate(jsonElem)) {
        this.validate.errors.forEach((error) => {
          outputExceptions.push({
            message: error.message,
            row: i,
            type: "ValidationError",
            failedKeyword: error.keyword,
            schemaPath: error.schemaPath,
            instancePath: error.instancePath,
          });
        });
      }
    });

    return outputExceptions;
  }
}

function generateSlice(indexSlice, defaultRowLength) {
  if (typeof indexSlice === "number") {
    return [indexSlice];
  }

  const [start, end] = indexSlice
    .split(":")
    .map((x) => parseInt(x) || undefined);
  return Array.from({ length: end - start }, (_, i) => i + start);
}

function parseBoolean(value) {
  if (typeof value === "string") {
    value = value.toLowerCase().trim();
    return value === "true" || value === "1" || value === "yes";
  }
  return Boolean(value);
}

async function readSchema(schemaFile) {
  const schemaContent = await fs.readFile(schemaFile, "utf8");
  const schemaJson = JSON.parse(schemaContent);
  return new TabularValidationSchema(schemaJson);
}

module.exports = {
  TabularValidationSchema,
  readSchema,
};

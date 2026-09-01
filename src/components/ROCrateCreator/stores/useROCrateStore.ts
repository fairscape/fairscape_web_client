import { useState, useCallback } from "react";
import {
  ROCrateState,
  MetadataObject,
  ObjectType,
  CrateValidation,
  DataObject,
  ComputationObject,
  SchemaObject,
} from "../types";

const normalizeTypeArray = (raw: unknown): string[] => {
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : [raw]).map(String);
};

const baseType = (t: string) => {
  const parts = t.split(/[/#]/);
  return parts[parts.length - 1] || t;
};

const typeMatches = (rawType: unknown, want: string) => {
  const w = want.toLowerCase();
  return normalizeTypeArray(rawType).some(
    (t) => baseType(t).toLowerCase() === w,
  );
};

interface UseROCrateStoreReturn {
  crateState: ROCrateState;
  addObject: (obj: MetadataObject, validate?: boolean) => void;
  updateObject: (id: string, updates: Partial<MetadataObject>) => void;
  deleteObject: (id: string) => void;
  updateRoot: (updates: Partial<ROCrateState["root"]>) => void;
  validateCrate: () => CrateValidation;
  getObjectsByType: (type: ObjectType) => MetadataObject[];
  getObjectById: (id: string) => MetadataObject | undefined;
  getRelatedObjects: (id: string) => {
    inputs: MetadataObject[];
    outputs: MetadataObject[];
    computations: ComputationObject[];
  };
  clearAll: () => void;
}

export function useROCrateStore(): UseROCrateStoreReturn {
  const [crateState, setCrateState] = useState<ROCrateState>({
    root: {
      "@id": "./",
      "@type": "Dataset",
      name: "",
      description: "",
      organizationName: "",
      projectName: "",
      author: "",
      keywords: [],
      version: "1.0.0",
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
    objects: new Map(),
  });

  const validateObject = useCallback(
    (obj: MetadataObject): { isComplete: boolean; missingFields: string[] } => {
      const missingFields: string[] = [];

      if (!obj.name) missingFields.push("name");
      if (!obj.description) missingFields.push("description");

      switch (obj["@type"]) {
        case "Dataset":
        case "Software":
          const dataObj = obj as DataObject;
          if (!dataObj.author) missingFields.push("author");
          if (!dataObj.version) missingFields.push("version");
          if (!dataObj.contentUrl && !dataObj.fileData) {
            missingFields.push("content source");
          }
          if (dataObj["@type"] === "Dataset" && !dataObj.datePublished) {
            missingFields.push("datePublished");
          }
          if (dataObj["@type"] === "Software" && !dataObj.dateModified) {
            missingFields.push("dateModified");
          }
          break;

        case "Computation":
          const compObj = obj as ComputationObject;
          if (!compObj.runBy) missingFields.push("runBy");
          if (!compObj.dateCreated) missingFields.push("dateCreated");
          if (
            compObj.usedDataset.length === 0 &&
            compObj.usedSoftware.length === 0
          ) {
            missingFields.push("inputs (dataset or software)");
          }
          break;

        case "Schema":
          const schemaObj = obj as SchemaObject;
          if (
            !schemaObj.properties ||
            Object.keys(schemaObj.properties).length === 0
          ) {
            missingFields.push("properties definition");
          }
          break;
      }

      return {
        isComplete: missingFields.length === 0,
        missingFields,
      };
    },
    [],
  );

  const addObject = useCallback(
    (obj: MetadataObject, validate = true) => {
      setCrateState((prev) => {
        const newObjects = new Map(prev.objects);
        const validation = validate
          ? validateObject(obj)
          : obj.validation || { isComplete: false, missingFields: [] };
        const objectWithValidation = { ...obj, validation };
        newObjects.set(obj["@id"], objectWithValidation);
        return { ...prev, objects: newObjects };
      });
    },
    [validateObject],
  );

  const updateObject = useCallback(
    (id: string, updates: Partial<MetadataObject>) => {
      setCrateState((prev) => {
        const newObjects = new Map(prev.objects);
        const existing = newObjects.get(id);
        if (existing) {
          const updated = { ...existing, ...updates } as MetadataObject;
          const validation = validateObject(updated);
          newObjects.set(id, { ...updated, validation });
        }
        return { ...prev, objects: newObjects };
      });
    },
    [validateObject],
  );

  const deleteObject = useCallback((id: string) => {
    setCrateState((prev) => {
      const newObjects = new Map(prev.objects);
      newObjects.delete(id);

      newObjects.forEach((obj, objId) => {
        if (obj["@type"] === "Computation") {
          const comp = obj as ComputationObject;
          const updated: ComputationObject = {
            ...comp,
            usedDataset: comp.usedDataset.filter((dsId) => dsId !== id),
            usedSoftware: comp.usedSoftware.filter((swId) => swId !== id),
            generated: comp.generated.filter((genId) => genId !== id),
          };
          newObjects.set(objId, updated);
        }

        if (obj["@type"] === "Dataset" || obj["@type"] === "Software") {
          const dataObj = obj as DataObject;
          if (dataObj.generatedBy === id) {
            const updated = { ...dataObj };
            delete updated.generatedBy;
            newObjects.set(objId, updated);
          }
          if (dataObj.derivedFrom) {
            const updated = {
              ...dataObj,
              derivedFrom: dataObj.derivedFrom.filter((dId) => dId !== id),
            };
            newObjects.set(objId, updated);
          }
          if (dataObj.usedBy) {
            const updated = {
              ...dataObj,
              usedBy: dataObj.usedBy.filter((uId) => uId !== id),
            };
            newObjects.set(objId, updated);
          }
        }
      });

      return { ...prev, objects: newObjects };
    });
  }, []);

  const updateRoot = useCallback((updates: Partial<ROCrateState["root"]>) => {
    setCrateState((prev) => ({
      ...prev,
      root: { ...prev.root, ...updates },
    }));
  }, []);

  const validateCrate = useCallback((): CrateValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!crateState.root.name) errors.push("RO-Crate name is required");
    if (!crateState.root.description)
      errors.push("RO-Crate description is required");
    if (!crateState.root.organizationName)
      errors.push("Organization name is required");
    if (!crateState.root.projectName) errors.push("Project name is required");

    if (crateState.objects.size === 0) {
      errors.push("At least one object must be added to the RO-Crate");
    }

    const incompleteObjects = Array.from(crateState.objects.values()).filter(
      (obj) => !obj.validation?.isComplete,
    );

    if (incompleteObjects.length > 0) {
      errors.push(
        `${
          incompleteObjects.length
        } object(s) have incomplete metadata: ${incompleteObjects
          .map((obj) => obj.name || obj["@id"])
          .join(", ")}`,
      );
    }

    Array.from(crateState.objects.values()).forEach((obj) => {
      if (obj["@type"] === "Computation") {
        const comp = obj as ComputationObject;

        comp.usedDataset.forEach((id) => {
          if (!crateState.objects.has(id)) {
            warnings.push(
              `Computation "${obj.name}" references missing dataset: ${id}`,
            );
          }
        });

        comp.usedSoftware.forEach((id) => {
          if (!crateState.objects.has(id)) {
            warnings.push(
              `Computation "${obj.name}" references missing software: ${id}`,
            );
          }
        });

        comp.generated.forEach((id) => {
          if (!crateState.objects.has(id)) {
            warnings.push(
              `Computation "${obj.name}" references missing output: ${id}`,
            );
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [crateState]);

  const getObjectsByType = useCallback(
    (type: ObjectType): MetadataObject[] => {
      const all = Array.from(crateState.objects.values());
      return all.filter((obj) => typeMatches((obj as any)["@type"], type));
    },
    [crateState.objects],
  );

  const getObjectById = useCallback(
    (id: string): MetadataObject | undefined => {
      return crateState.objects.get(id);
    },
    [crateState],
  );

  const getRelatedObjects = useCallback(
    (id: string) => {
      const inputs: MetadataObject[] = [];
      const outputs: MetadataObject[] = [];
      const computations: ComputationObject[] = [];

      Array.from(crateState.objects.values()).forEach((obj) => {
        if (obj["@type"] === "Computation") {
          const comp = obj as ComputationObject;
          if (comp.usedDataset.includes(id) || comp.usedSoftware.includes(id)) {
            computations.push(comp);
          }
          if (comp.generated.includes(id)) {
            computations.push(comp);
          }
        }

        if (
          (obj["@type"] === "Dataset" || obj["@type"] === "Software") &&
          obj["@id"] === id
        ) {
          const dataObj = obj as DataObject;
          if (dataObj.derivedFrom) {
            dataObj.derivedFrom.forEach((sourceId) => {
              const source = crateState.objects.get(sourceId);
              if (source) inputs.push(source);
            });
          }
          if (dataObj.usedBy) {
            dataObj.usedBy.forEach((targetId) => {
              const target = crateState.objects.get(targetId);
              if (target) outputs.push(target);
            });
          }
        }
      });

      return { inputs, outputs, computations };
    },
    [crateState],
  );

  const clearAll = useCallback(() => {
    setCrateState({
      root: {
        "@id": "./",
        "@type": "Dataset",
        name: "",
        description: "",
        organizationName: "",
        projectName: "",
        author: "",
        keywords: [],
        version: "1.0.0",
        license: "https://creativecommons.org/licenses/by/4.0/",
      },
      objects: new Map(),
    });
  }, []);

  return {
    crateState,
    addObject,
    updateObject,
    deleteObject,
    updateRoot,
    validateCrate,
    getObjectsByType,
    getObjectById,
    getRelatedObjects,
    clearAll,
  };
}

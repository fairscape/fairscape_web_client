import React, { useState, useCallback, useEffect } from "react";
import {
  generateDataset,
  generateSoftware,
  register_computation as generateComputation,
  register_schema as generateSchema, // kept import, but schema detection is stubbed below
} from "@fairscape/utils";

import {
  ROCrateMetadata,
  MetadataObject,
  DataObject,
  ComputationObject,
  SchemaObject,
  ObjectType,
} from "../components/ROCrateCreator/types";

import { useROCrateStore } from "../components/ROCrateCreator/stores/useROCrateStore";
import { FileProcessingService } from "../components/ROCrateCreator/services/FileProcessingService";
import { ROCratePackager } from "../components/ROCrateCreator/services/ROCratePackager";
// import { SchemaDetectionService } from "../components/ROCrateCreator/services/SchemaDetectionService";
// import { CacheService } from "../components/ROCrateCreator/services/CacheService";

import WorkspaceView from "../components/ROCrateCreator/views/WorkspaceView";
import MetadataEditorView from "../components/ROCrateCreator/views/MetadataEditorView";
import ComputationWorkflowView from "../components/ROCrateCreator/views/ComputationWorkflowView";

import { Container, Header, PageTitle } from "./ROCrateCreator.styles";

type ViewType = "workspace" | "editor" | "computation-workflow";

interface EditorContext {
  objectId: string;
  returnView: ViewType;
}

/** ---------------------------
 *  PLACEHOLDER SERVICES (NO-OP)
 *  ---------------------------
 *  These are minimal stubs so you can wire the page without having
 *  SchemaDetectionService or CacheService implemented yet.
 */

// Placeholder schema detector: always returns false / null
const schemaDetector = {
  shouldDetect: async (_file: File) => false,
  detect: async (_file: File) => null as SchemaObject | null,
};

// Placeholder cache service: no-op load/save/clear
const cacheService = {
  load: async () =>
    null as null | { root: ROCrateMetadata; objects: MetadataObject[] },
  save: async (_state: any) => void 0,
  clear: async () => void 0,
};

export default function ROCrateCreatorPage() {
  const [currentView, setCurrentView] = useState<ViewType>("workspace");
  const [editorContext, setEditorContext] = useState<EditorContext | null>(
    null
  );

  const {
    crateState,
    addObject,
    updateObject,
    deleteObject,
    updateRoot,
    validateCrate,
    getObjectsByType,
  } = useROCrateStore();

  const fileProcessor = new FileProcessingService();
  const packager = new ROCratePackager();

  // Draft load (no-op for now via placeholder)
  useEffect(() => {
    const loadCached = async () => {
      const cached = await cacheService.load();
      if (cached) {
        updateRoot(cached.root);
        cached.objects.forEach((obj) => addObject(obj, false));
      }
    };
    loadCached();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draft save (no-op via placeholder)
  useEffect(() => {
    const saveDraft = async () => {
      await cacheService.save(crateState);
    };
    const debounced = setTimeout(saveDraft, 1000);
    return () => clearTimeout(debounced);
  }, [crateState]);

  const handleFilesUpload = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const fileType = await fileProcessor.detectFileType(file);
        const objectType: ObjectType =
          fileType === "software"
            ? "Software"
            : fileType === "schema"
            ? "Schema"
            : "Dataset";

        // If/when you implement schema upload handling, this branch will be useful.
        if (objectType === "Schema") {
          // Placeholder: if you later want to accept uploaded schema files directly,
          // you can parse them and call generateSchema() here.
          // For now, skip.
          continue;
        }

        const baseMetadata = {
          name: file.name.replace(/\.[^/.]+$/, ""),
          author: crateState.root.author,
          version: "1.0.0",
          description: "",
          keywords: [],
        };

        let metadataObject: MetadataObject;

        if (objectType === "Dataset") {
          metadataObject = generateDataset(
            {
              ...baseMetadata,
              datePublished: new Date().toISOString().split("T")[0],
              dataFormat: file.type || "application/octet-stream",
            },
            file,
            "./"
          );

          (metadataObject as DataObject).fileData = file;

          // Schema detection is stubbed (always false)
          if (await schemaDetector.shouldDetect(file)) {
            const detectedSchema = await schemaDetector.detect(file);
            if (detectedSchema) {
              const schemaObject = generateSchema(detectedSchema);
              addObject(schemaObject);
              (metadataObject as DataObject).conformsTo = schemaObject["@id"];
            }
          }
        } else {
          // Software
          metadataObject = generateSoftware(
            {
              ...baseMetadata,
              dateModified: new Date().toISOString().split("T")[0],
              fileFormat: file.type || "application/octet-stream",
            },
            file,
            "./"
          );

          (metadataObject as DataObject).fileData = file;
        }

        addObject(metadataObject);
      }
    },
    [crateState.root.author, addObject, fileProcessor]
  );

  const handleExternalRegistration = useCallback(
    (
      url: string,
      type: "Dataset" | "Software",
      metadata: Partial<MetadataObject>
    ) => {
      const baseMetadata = {
        name: metadata.name || "External Resource",
        author: metadata.author || crateState.root.author,
        version: "1.0.0",
        description: metadata.description || "",
        keywords: metadata.keywords || [],
        contentUrl: url,
      };

      let metadataObject: MetadataObject;

      if (type === "Dataset") {
        metadataObject = generateDataset({
          ...baseMetadata,
          datePublished: new Date().toISOString().split("T")[0],
          dataFormat: "unknown",
        });
      } else {
        metadataObject = generateSoftware({
          ...baseMetadata,
          dateModified: new Date().toISOString().split("T")[0],
          fileFormat: "unknown",
        });
      }

      addObject(metadataObject);
    },
    [crateState.root.author, addObject]
  );

  const handleAddComputation = useCallback(
    (computationData: Partial<ComputationObject>) => {
      const computation = generateComputation({
        name: computationData.name || "",
        runBy: computationData.runBy || crateState.root.author,
        dateCreated: new Date().toISOString().split("T")[0],
        description: computationData.description || "",
        keywords: computationData.keywords || [],
        usedSoftware: computationData.usedSoftware || [],
        usedDataset: computationData.usedDataset || [],
        generated: computationData.generated || [],
      });

      addObject(computation);
    },
    [crateState.root.author, addObject]
  );

  const openEditor = useCallback(
    (objectId: string) => {
      setEditorContext({ objectId, returnView: currentView });
      setCurrentView("editor");
    },
    [currentView]
  );

  const closeEditor = useCallback(
    (updatedObject?: MetadataObject) => {
      if (updatedObject) {
        updateObject(updatedObject["@id"], updatedObject);
      }
      if (editorContext) {
        setCurrentView(editorContext.returnView);
        setEditorContext(null);
      }
    },
    [editorContext, updateObject]
  );

  const handleGenerateROCrate = useCallback(async () => {
    const validation = validateCrate();

    if (!validation.isValid) {
      alert(
        `Please fix the following issues:\n${validation.errors.join("\n")}`
      );
      return;
    }

    try {
      const packageBlob = await packager.generate(crateState);

      const url = URL.createObjectURL(packageBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${crateState.root.name || "rocrate"}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      await cacheService.clear(); // no-op for now
    } catch (error) {
      console.error("Failed to generate RO-Crate:", error);
      alert("Failed to generate RO-Crate package");
    }
  }, [crateState, validateCrate, packager]);

  return (
    <Container>
      <Header>
        <PageTitle>Create RO-Crate Package</PageTitle>
      </Header>

      {currentView === "workspace" && (
        <WorkspaceView
          crateState={crateState}
          onUpdateRoot={updateRoot}
          onFilesUpload={handleFilesUpload}
          onExternalRegistration={handleExternalRegistration}
          onOpenEditor={openEditor}
          onDeleteObject={deleteObject}
          onAddComputation={() => setCurrentView("computation-workflow")}
          onGenerateROCrate={handleGenerateROCrate}
        />
      )}

      {currentView === "editor" && editorContext && (
        <MetadataEditorView
          objectId={editorContext.objectId}
          object={crateState.objects.get(editorContext.objectId)}
          allObjects={crateState.objects}
          onSave={closeEditor}
          onCancel={() => closeEditor()}
        />
      )}

      {currentView === "computation-workflow" && (
        <ComputationWorkflowView
          datasets={getObjectsByType("Dataset")}
          software={getObjectsByType("Software")}
          existingComputations={getObjectsByType("Computation")}
          onSave={(computation) => {
            handleAddComputation(computation);
            setCurrentView("workspace");
          }}
          onCancel={() => setCurrentView("workspace")}
        />
      )}
    </Container>
  );
}

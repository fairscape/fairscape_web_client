import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Metadata, RawGraphEntity } from "../../types";
import { processOverview, OverviewData } from "../../utils/metadataProcessing";
import OverviewSection from "./OverviewSection";
import TabsSection, { TabConfig } from "./TabsSection";
import EntityTable, { EntityItem } from "./EntityTable";
import LoadingSpinner from "../common/LoadingSpinner";
import Alert from "../common/Alert";

const Container = styled.div`
  width: 100%;
`;

interface ROCrateComponentProps {
  metadata: Metadata;
  arkId?: string;
}

const ROCrateComponent: React.FC<ROCrateComponentProps> = ({
  metadata,
  arkId,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("datasets");

  // Entity categories
  const [datasets, setDatasets] = useState<EntityItem[]>([]);
  const [software, setSoftware] = useState<EntityItem[]>([]);
  const [computations, setComputations] = useState<EntityItem[]>([]);
  const [samples, setSamples] = useState<EntityItem[]>([]);
  const [experiments, setExperiments] = useState<EntityItem[]>([]);
  const [instruments, setInstruments] = useState<EntityItem[]>([]);
  const [otherItems, setOtherItems] = useState<EntityItem[]>([]);

  useEffect(() => {
    try {
      setLoading(true);

      // Process overview data
      if (metadata) {
        const overview = processOverview(metadata);
        console.log("Overview data:", overview);
        setOverviewData(overview);
        categorizeEntities(metadata["@graph"] as RawGraphEntity[]);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error processing RO-Crate data:", err);
      setError(`Failed to process RO-Crate data: ${err.message}`);
      setLoading(false);
    }
  }, [metadata, arkId]);

  // Helper to categorize entities from graph
  const categorizeEntities = (graph: RawGraphEntity[]) => {
    if (!graph || !Array.isArray(graph)) return;

    // Find the metadata entity (usually has @id null or ro-crate-metadata.json)
    const metadataEntity = graph.find(
      (e) => e["@id"] === null || e["@id"] === "ro-crate-metadata.json"
    );

    if (!metadataEntity) {
      console.error("Could not find metadata entity in RO-Crate");
      return;
    }

    // Get the root entity ID from the 'about' property of the metadata entity
    const rootId = metadataEntity.about?.["@id"];

    // Find the root entity using the ID from the metadata's 'about' property
    const rootEntity = graph.find((entity) => entity["@id"] === rootId);

    if (!rootEntity) {
      console.error(`Could not find root entity with ID: ${rootId}`);
      return;
    }

    console.log("Found root entity:", rootEntity);

    // Extract and categorize all entities except the metadata entity and root entity
    const entities = graph.filter(
      (entity) =>
        entity["@id"] !== null &&
        entity["@id"] !== "ro-crate-metadata.json" &&
        entity["@id"] !== rootId
    );

    const processedDatasets: EntityItem[] = [];
    const processedSoftware: EntityItem[] = [];
    const processedComputations: EntityItem[] = [];
    const processedSamples: EntityItem[] = [];
    const processedExperiments: EntityItem[] = [];
    const processedInstruments: EntityItem[] = [];
    const processedOther: EntityItem[] = [];

    entities.forEach((entity) => {
      const types = Array.isArray(entity["@type"])
        ? entity["@type"]
        : [entity["@type"]];
      const name =
        entity.name || entity["@id"]?.split("/").pop() || entity["@id"];
      const description = entity.description || "";
      const date =
        entity.datePublished || entity.dateCreated || entity.dateModified || "";

      // Determine access status
      let contentStatus = "Available";
      if (entity.contentUrl === "Embargoed") {
        contentStatus = "Embargoed";
      } else if (entity.contentUrl) {
        contentStatus = "Download";
      }

      const item: EntityItem = {
        name,
        description,
        contentStatus,
        date,
        id: entity["@id"],
      };

      // Categorize based on type
      if (
        types.includes("https://w3id.org/EVI#Dataset") ||
        types.includes("Dataset")
      ) {
        processedDatasets.push(item);
      } else if (
        types.includes("https://w3id.org/EVI#Software") ||
        types.includes("SoftwareApplication") ||
        types.includes("SoftwareSourceCode")
      ) {
        processedSoftware.push(item);
      } else if (
        types.includes("https://w3id.org/EVI#Computation") ||
        types.includes("ComputationalWorkflow")
      ) {
        processedComputations.push(item);
      } else if (types.includes("https://w3id.org/EVI#Sample")) {
        processedSamples.push(item);
      } else if (types.includes("https://w3id.org/EVI#Experiment")) {
        processedExperiments.push(item);
      } else if (types.includes("https://w3id.org/EVI#Instrument")) {
        processedInstruments.push(item);
      } else {
        // Add type to other items
        item.type = types[0] || "Unknown";
        processedOther.push(item);
      }
    });

    console.log("Processed datasets:", processedDatasets);
    console.log("Processed software:", processedSoftware);
    console.log("Processed computations:", processedComputations);

    setDatasets(processedDatasets);
    setSoftware(processedSoftware);
    setComputations(processedComputations);
    setSamples(processedSamples);
    setExperiments(processedExperiments);
    setInstruments(processedInstruments);
    setOtherItems(processedOther);
  };

  // Generate tabs based on available entity types
  const generateTabs = (): TabConfig[] => {
    const tabs: TabConfig[] = [];

    if (datasets.length > 0) {
      tabs.push({ id: "datasets", label: "Datasets", count: datasets.length });
    }
    if (software.length > 0) {
      tabs.push({ id: "software", label: "Software", count: software.length });
    }
    if (computations.length > 0) {
      tabs.push({
        id: "computations",
        label: "Computations",
        count: computations.length,
      });
    }
    if (samples.length > 0) {
      tabs.push({ id: "samples", label: "Samples", count: samples.length });
    }
    if (experiments.length > 0) {
      tabs.push({
        id: "experiments",
        label: "Experiments",
        count: experiments.length,
      });
    }
    if (instruments.length > 0) {
      tabs.push({
        id: "instruments",
        label: "Instruments",
        count: instruments.length,
      });
    }
    if (otherItems.length > 0) {
      tabs.push({ id: "other", label: "Other", count: otherItems.length });
    }

    // If we have tabs but activeTab isn't set, set it to the first tab
    if (tabs.length > 0 && !tabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }

    console.log("Generated tabs:", tabs);
    return tabs;
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return <Alert type="error" title="Error Loading Data" message={error} />;
  if (!metadata)
    return (
      <Alert
        type="info"
        title="No Data"
        message="Could not load RO-Crate data."
      />
    );

  const tabs = generateTabs();

  return (
    <Container>
      {overviewData && <OverviewSection overviewData={overviewData} />}

      {tabs.length > 0 && (
        <>
          <TabsSection
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "datasets" && (
            <EntityTable
              items={datasets}
              headers={["Name", "Description", "Access", "Release Date"]}
            />
          )}

          {activeTab === "software" && (
            <EntityTable
              items={software}
              headers={["Name", "Description", "Access", "Release Date"]}
            />
          )}

          {activeTab === "computations" && (
            <EntityTable
              items={computations}
              headers={["Name", "Description", "Access", "Date Created"]}
            />
          )}

          {activeTab === "samples" && (
            <EntityTable
              items={samples}
              headers={["Name", "Description", "Identifier", "Date Created"]}
            />
          )}

          {activeTab === "experiments" && (
            <EntityTable
              items={experiments}
              headers={["Name", "Description", "Type", "Date Created"]}
            />
          )}

          {activeTab === "instruments" && (
            <EntityTable
              items={instruments}
              headers={["Name", "Description", "Manufacturer", "Date Created"]}
            />
          )}

          {activeTab === "other" && (
            <EntityTable
              items={otherItems}
              headers={["Name", "Description", "@id", "Type"]}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default ROCrateComponent;

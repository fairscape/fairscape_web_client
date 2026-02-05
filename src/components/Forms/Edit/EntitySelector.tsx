import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FiX } from "react-icons/fi";
import { useMetadataApi } from "../../MetadataDisplay/api/metadataApi";

interface Entity {
  id: string; // ARK ID
  name: string;
  type?: string;
}

interface EntitySelectorProps {
  value: string; // CSV of ARK IDs
  onChange: (value: string) => void;
  filterType?: "Dataset" | "Software" | "Computation" | "Schema" | "Annotation" | "Experiment" | "Sample" | "Instrument";
  parentRoCrateId?: string; // ARK ID of parent RO-Crate
  placeholder?: string;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
  value,
  onChange,
  filterType,
  parentRoCrateId,
  placeholder = "Search entities or enter ARK ID",
}) => {
  const [selectedEntities, setSelectedEntities] = useState<Entity[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [availableEntities, setAvailableEntities] = useState<Entity[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Entity[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const metadataApi = useMetadataApi();

  // Parse CSV value into selected entities
  useEffect(() => {
    if (!value || typeof value !== "string") {
      setSelectedEntities([]);
      return;
    }

    const arkIds = value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    // Convert ARK IDs to Entity objects
    // If we have the full entity info from availableEntities, use it
    // Otherwise, just show the ARK ID
    const entities = arkIds.map((arkId) => {
      const found = availableEntities.find((e) => e.id === arkId);
      return found || { id: arkId, name: arkId };
    });

    setSelectedEntities(entities);
  }, [value, availableEntities]);

  // Fetch entities from parent RO-Crate
  useEffect(() => {
    if (!parentRoCrateId) {
      return;
    }

    const fetchEntities = async () => {
      setLoading(true);
      try {
        const response = await metadataApi.getRoCrate(parentRoCrateId);

        // Get @graph - this is where ALL entities live
        const graph = response?.metadata?.["@graph"] || response?.["@graph"] || [];

        if (!Array.isArray(graph)) {
          console.warn("EntitySelector: No @graph array found");
          setAvailableEntities([]);
          return;
        }

        console.log(`EntitySelector: Found ${graph.length} items in @graph`);

        const entities: Entity[] = [];

        // Process each item in @graph
        for (const item of graph) {
          const arkId = item["@id"];

          // Skip metadata entities
          if (!arkId ||
              arkId === "ro-crate-metadata.json" ||
              arkId === "./" ||
              arkId === null) {
            continue;
          }

          // Get entity name
          const name = item.name || arkId;

          // Get entity type(s)
          let types = item["@type"];
          if (!Array.isArray(types)) {
            types = types ? [types] : [];
          }

          // Find the EVI type (e.g., "https://w3id.org/EVI#Dataset")
          const eviType = types.find((t: string) =>
            t.includes("EVI#") || t.includes("w3id.org/EVI")
          );

          let simpleType = undefined;
          if (eviType && typeof eviType === "string") {
            // Extract "Dataset" from "https://w3id.org/EVI#Dataset"
            simpleType = eviType.split("#").pop();
          }

          // Filter by type if specified (e.g., only show Computations)
          if (filterType && simpleType) {
            if (simpleType.toLowerCase() !== filterType.toLowerCase()) {
              continue;
            }
          }

          entities.push({
            id: arkId,
            name: name,
            type: simpleType,
          });
        }

        console.log(`EntitySelector: Extracted ${entities.length} entities${filterType ? ` of type ${filterType}` : ''}`);
        setAvailableEntities(entities);

      } catch (error) {
        console.error("EntitySelector: Failed to fetch entities:", error);
        setAvailableEntities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [parentRoCrateId, filterType]);

  // Update parent with CSV string
  const updateParent = (entities: Entity[]) => {
    const csvString = entities.map((e) => e.id).join(", ");
    onChange(csvString);
  };

  // Add entity
  const addEntity = (entity: Entity) => {
    // Check if already selected
    if (selectedEntities.find((e) => e.id === entity.id)) {
      return;
    }

    const newEntities = [...selectedEntities, entity];
    setSelectedEntities(newEntities);
    updateParent(newEntities);
    setInputValue("");
    setFilteredSuggestions([]);
    setShowDropdown(false);
  };

  // Remove entity
  const removeEntity = (index: number) => {
    const newEntities = selectedEntities.filter((_, i) => i !== index);
    setSelectedEntities(newEntities);
    updateParent(newEntities);
  };

  // Handle input change for search/filter
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!val.trim()) {
      setFilteredSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Filter available entities by search term
    const searchLower = val.toLowerCase();
    const filtered = availableEntities
      .filter(
        (entity) =>
          entity.name.toLowerCase().includes(searchLower) ||
          entity.id.toLowerCase().includes(searchLower)
      )
      .slice(0, 50); // Limit to 50 results to avoid performance issues with large RO-Crates

    setFilteredSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  };

  // Handle Enter key to add manual ARK ID
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If there's exactly one suggestion, add it
      if (filteredSuggestions.length === 1) {
        addEntity(filteredSuggestions[0]);
        return;
      }

      // Otherwise, treat input as manual ARK ID
      const trimmed = inputValue.trim();
      if (trimmed) {
        // Basic validation for ARK format
        if (trimmed.startsWith("ark:")) {
          addEntity({ id: trimmed, name: trimmed });
        } else {
          // Show error or warning
          alert("Please enter a valid ARK ID starting with 'ark:' or select from the dropdown");
        }
      }
    }
  };

  return (
    <Container>
      <EntityContainer>
        {selectedEntities.length === 0 && (
          <EmptyState>No entities selected</EmptyState>
        )}
        {selectedEntities.map((entity, index) => (
          <Chip key={index}>
            <ChipText title={entity.id}>
              {entity.name}
              {entity.type && <TypeBadge>{entity.type}</TypeBadge>}
            </ChipText>
            <ChipRemove onClick={() => removeEntity(index)}>
              <FiX />
            </ChipRemove>
          </Chip>
        ))}
      </EntityContainer>
      <InputWrapper>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
        />
        <HelpText>
          {loading
            ? "Loading entities from RO-Crate..."
            : parentRoCrateId
            ? `Search ${availableEntities.length} entities in this RO-Crate or press Enter to add custom ARK ID`
            : "Enter ARK ID and press Enter (e.g., ark:59853/dataset-name-abc123)"}
        </HelpText>
        {showDropdown && filteredSuggestions.length > 0 && (
          <Dropdown>
            {filteredSuggestions.length >= 50 && (
              <DropdownHeader>
                Showing first 50 results - type more to narrow search
              </DropdownHeader>
            )}
            {filteredSuggestions.map((entity, index) => (
              <DropdownItem
                key={index}
                onClick={() => addEntity(entity)}
              >
                <EntityName>
                  {entity.name}
                  {entity.type && <TypeBadge>{entity.type}</TypeBadge>}
                </EntityName>
                <EntityId>{entity.id}</EntityId>
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </InputWrapper>
    </Container>
  );
};

export default EntitySelector;

// Styled Components

const Container = styled.div`
  margin-bottom: 20px;
`;

const EntityContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  min-height: 40px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const EmptyState = styled.div`
  color: #999;
  font-size: 13px;
  font-style: italic;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #3e7aa8;
  color: white;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  max-width: 300px;
`;

const ChipText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TypeBadge = styled.span`
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
`;

const ChipRemove = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
    box-shadow: 0 0 0 2px rgba(62, 122, 168, 0.1);
  }

  &:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 6px;
  line-height: 1.4;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const DropdownHeader = styled.div`
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const DropdownItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const EntityName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EntityId = styled.div`
  font-size: 12px;
  color: #666;
  font-family: monospace;
`;

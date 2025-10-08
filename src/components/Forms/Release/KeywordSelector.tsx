import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FiX } from "react-icons/fi";
import { debouncedSearchOntologyTerms } from "../utils/ontologyUtils";

interface OntologyResult {
  term: string;
  source: string;
  definition: string;
  uri: string;
}

interface KeywordSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const KeywordSelector: React.FC<KeywordSelectorProps> = ({
  value,
  onChange,
  required,
}) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<OntologyResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && value.trim()) {
      const parsed = value
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      setKeywords(parsed);
    } else {
      setKeywords([]);
    }
  }, [value]);

  useEffect(() => {
    if (showDropdown && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [showDropdown]);

  const updateParent = (newKeywords: string[]) => {
    const csvString = newKeywords.join(", ");
    onChange(csvString);
  };

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) return;

    const newKeywords = [...keywords, trimmed];
    setKeywords(newKeywords);
    updateParent(newKeywords);
    setInputValue("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    updateParent(newKeywords);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.length >= 3) {
      debouncedSearchOntologyTerms(val, (results) => {
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      });
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(inputValue);
    }
  };

  const handleSuggestionClick = (result: OntologyResult) => {
    const newKeywords = [...keywords];

    if (!newKeywords.includes(result.term)) {
      newKeywords.push(result.term);
    }
    if (result.uri && !newKeywords.includes(result.uri)) {
      newKeywords.push(result.uri);
    }

    setKeywords(newKeywords);
    updateParent(newKeywords);
    setInputValue("");
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <Container>
      <Label>
        Keywords
        {required && <Required>*</Required>}
      </Label>
      <KeywordContainer>
        {keywords.map((keyword, index) => (
          <Chip key={index}>
            <ChipText>{keyword}</ChipText>
            <ChipRemove onClick={() => removeKeyword(index)}>
              <FiX />
            </ChipRemove>
          </Chip>
        ))}
      </KeywordContainer>
      <InputWrapper>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type to search ontology terms or add custom keywords"
        />
        <HelpText>
          Type 3+ characters to search BioPortal ontology terms, or press Enter
          to add custom keywords
        </HelpText>
        {showDropdown && suggestions.length > 0 && (
          <Dropdown
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <DropdownItem
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <TermName>{suggestion.term}</TermName>
                <TermSource>{suggestion.source}</TermSource>
                <TermDefinition>{suggestion.definition}</TermDefinition>
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </InputWrapper>
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const Required = styled.span`
  color: #dc3545;
  margin-left: 4px;
`;

const KeywordContainer = styled.div`
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
`;

const ChipText = styled.span``;

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
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 6px;
  line-height: 1.4;
`;

const Dropdown = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #ced4da;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  margin-top: -1px;
`;

const DropdownItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TermName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const TermSource = styled.div`
  font-size: 11px;
  color: #3e7aa8;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const TermDefinition = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

export default KeywordSelector;

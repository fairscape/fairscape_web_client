const BIOPORTAL_API_KEY = "42d5f4e9-ec06-470e-826d-f11a159815c6";
const BIOPORTAL_BASE_URL = "https://data.bioontology.org";

interface OntologyResult {
  term: string;
  source: string;
  definition: string;
  uri: string;
  preferred: boolean;
}

const PREFERRED_ONTOLOGIES = [
  { name: "RXNORM", priority: 1 },
  { name: "LOINC", priority: 2 },
  { name: "SNOMEDCT", priority: 3 },
  { name: "GO", priority: 4 },
  { name: "PRO", priority: 5 },
  { name: "FMA", priority: 6 },
  { name: "UBERON", priority: 7 },
];

const getOntologyPriority = (source: string): number => {
  const preferred = PREFERRED_ONTOLOGIES.find(
    (ont) => ont.name.toLowerCase() === source.toLowerCase()
  );
  return preferred ? preferred.priority : 999;
};

const isPreferredOntology = (source: string): boolean => {
  return PREFERRED_ONTOLOGIES.some(
    (ont) => ont.name.toLowerCase() === source.toLowerCase()
  );
};

let debounceTimer: NodeJS.Timeout | null = null;

export const searchOntologyTerms = async (
  query: string
): Promise<OntologyResult[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `${BIOPORTAL_BASE_URL}/search?q=${encodeURIComponent(
        query
      )}&pagesize=10&apikey=${BIOPORTAL_API_KEY}`
    );

    if (!response.ok) {
      console.error("BioPortal API error:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.collection || !Array.isArray(data.collection)) {
      return [];
    }

    const results = data.collection.map((item: any) => {
      const source = item.links?.ontology?.split("/").pop() || "Unknown";
      return {
        term: item.prefLabel || "Unknown term",
        source: source,
        definition:
          item.definition?.[0] ||
          item.synonym?.[0] ||
          "No definition available",
        uri: item["@id"] || "",
        preferred: isPreferredOntology(source),
      };
    });

    results.sort((a: OntologyResult, b: OntologyResult) => {
      const priorityA = getOntologyPriority(a.source);
      const priorityB = getOntologyPriority(b.source);
      return priorityA - priorityB;
    });

    return results;
  } catch (error) {
    console.error("Error searching ontology terms:", error);
    return [];
  }
};

export const debouncedSearchOntologyTerms = (
  query: string,
  callback: (results: OntologyResult[]) => void
) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    const results = await searchOntologyTerms(query);
    callback(results);
  }, 300);
};

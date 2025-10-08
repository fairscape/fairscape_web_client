const BIOPORTAL_API_KEY = "42d5f4e9-ec06-470e-826d-f11a159815c6";
const BIOPORTAL_BASE_URL = "https://data.bioontology.org";

interface OntologyResult {
  term: string;
  source: string;
  definition: string;
  uri: string;
}

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

    return data.collection.map((item: any) => ({
      term: item.prefLabel || "Unknown term",
      source: item.links?.ontology?.split("/").pop() || "Unknown",
      definition:
        item.definition?.[0] || item.synonym?.[0] || "No definition available",
      uri: item["@id"] || "",
    }));
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

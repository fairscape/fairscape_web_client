export interface SavedCrateMetadata {
  id: string;
  name: string;
  lastModified: string;
  reviewStatus: boolean;
  hasUnreviewed: boolean;
}

interface ProvenanceState {
  inputArk: string;
  computationArk: string;
  outputArk: string;
  sourceFlow: "manual" | "direct" | "chatbot";
  requiresGithubPush: boolean;
  yamlUrl?: string;
}

interface SavedCrate {
  formData: any;
  reviewState?: any;
  provenance?: ProvenanceState | null;
  finalArk?: string | null;
  savedAt: string;
  lastModified: string;
  metadata: {
    id: string;
    name: string;
    reviewProgress?: {
      reviewed: number;
      total: number;
    };
  };
}

interface SavedCratesStorage {
  [id: string]: SavedCrate;
}

const STORAGE_KEY = "ro-crate-saved-forms";

export const generateCrateId = (name: string): string => {
  if (!name) return `crate-${Date.now()}`;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
};

export const saveCrate = (
  formData: any,
  reviewState?: any,
  provenance?: ProvenanceState | null,
  finalArk?: string | null
): boolean => {
  try {
    const crateId =
      formData["@id"] ||
      formData.identifier ||
      generateCrateId(formData.name || "unnamed-crate");
    const crateName = formData.name || formData.title || "Unnamed Crate";

    const existingSaved = getSavedCrates();
    const now = new Date().toISOString();

    let reviewProgress = undefined;
    if (reviewState) {
      const total = Object.keys(reviewState).length;
      const reviewed = Object.values(reviewState).filter(
        (state: any) => state.reviewed
      ).length;
      reviewProgress = { reviewed, total };
    }

    const savedCrate: SavedCrate = {
      formData: { ...formData, "@id": crateId },
      reviewState,
      provenance: provenance || existingSaved[crateId]?.provenance,
      finalArk: finalArk !== undefined ? finalArk : existingSaved[crateId]?.finalArk,
      savedAt: existingSaved[crateId]?.savedAt || now,
      lastModified: now,
      metadata: {
        id: crateId,
        name: crateName,
        reviewProgress,
      },
    };

    const updatedStorage = {
      ...existingSaved,
      [crateId]: savedCrate,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage));
    return true;
  } catch (error) {
    console.error("Failed to save crate:", error);
    return false;
  }
};

export const getSavedCrates = (): SavedCratesStorage => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Failed to load saved crates:", error);
    return {};
  }
};

export const getSavedCratesList = (): SavedCrate[] => {
  const savedCrates = getSavedCrates();
  return Object.values(savedCrates).sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};

export const getAllSavedCrates = (): SavedCrateMetadata[] => {
  const savedCrates = getSavedCrates();
  return Object.values(savedCrates)
    .map((crate) => {
      const hasUnreviewed = crate.reviewState
        ? Object.values(crate.reviewState).some((state: any) => !state.reviewed)
        : false;

      return {
        id: crate.metadata.id,
        name: crate.metadata.name,
        lastModified: crate.lastModified,
        reviewStatus: !hasUnreviewed,
        hasUnreviewed,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
};

export const loadCrate = (
  id: string
): { formData: any; reviewState?: any; provenance?: ProvenanceState | null; finalArk?: string | null } | null => {
  try {
    const savedCrates = getSavedCrates();
    const crate = savedCrates[id];
    if (!crate) return null;

    return {
      formData: crate.formData,
      reviewState: crate.reviewState,
      provenance: crate.provenance,
      finalArk: crate.finalArk,
    };
  } catch (error) {
    console.error("Failed to load crate:", error);
    return null;
  }
};

export const deleteSavedCrate = (id: string): boolean => {
  try {
    const savedCrates = getSavedCrates();
    delete savedCrates[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCrates));
    return true;
  } catch (error) {
    console.error("Failed to delete crate:", error);
    return false;
  }
};

export const checkCrateExists = (id: string): boolean => {
  const savedCrates = getSavedCrates();
  return id in savedCrates;
};

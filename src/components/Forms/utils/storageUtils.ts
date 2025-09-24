interface SavedCrate {
  formData: any;
  savedAt: string;
  lastModified: string;
  metadata: {
    id: string;
    name: string;
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

export const saveCrate = (formData: any): boolean => {
  try {
    const crateId =
      formData["@id"] ||
      formData.identifier ||
      generateCrateId(formData.name || "unnamed-crate");
    const crateName = formData.name || formData.title || "Unnamed Crate";

    const existingSaved = getSavedCrates();
    const now = new Date().toISOString();

    const savedCrate: SavedCrate = {
      formData: { ...formData, "@id": crateId },
      savedAt: existingSaved[crateId]?.savedAt || now,
      lastModified: now,
      metadata: {
        id: crateId,
        name: crateName,
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

export const loadCrate = (id: string): any | null => {
  try {
    const savedCrates = getSavedCrates();
    return savedCrates[id]?.formData || null;
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

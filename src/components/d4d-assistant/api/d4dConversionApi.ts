import { API_URL } from "../utils/constants";

export const convertD4DToROCrate = async (yamlUrl: string): Promise<any> => {
  const response = await fetch(
    `${API_URL}/convert/d4d-to-rocrate?url=${encodeURIComponent(yamlUrl)}`,
  );
  if (!response.ok) throw new Error("Failed to convert D4D to RO-Crate");
  return await response.json();
};

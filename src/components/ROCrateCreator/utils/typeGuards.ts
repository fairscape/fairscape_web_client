export type Kind = "Dataset" | "Software" | "Computation" | "Schema" | "Other";

export function detectKind(rawType: unknown): Kind {
  const types: string[] = Array.isArray(rawType)
    ? rawType.map(String)
    : rawType
      ? [String(rawType)]
      : [];

  if (matches(types, "dataset")) return "Dataset";
  if (matches(types, "software")) return "Software";
  if (matches(types, "computation")) return "Computation";
  if (matches(types, "schema")) return "Schema";
  return "Other";
}

function matches(types: string[], needle: string): boolean {
  const n = needle.toLowerCase();
  return types.some((t) => {
    const s = t.toLowerCase();
    return (
      s === n ||
      s.endsWith(`#${n}`) ||
      s.endsWith(`/${n}`) ||
      new RegExp(`\\b${n}\\b`).test(s)
    );
  });
}

// helpers to normalize and check @type
export const normalizeTypeArray = (raw: unknown): string[] => {
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : [raw]).map(String);
};

export const baseType = (t: string) => {
  const parts = t.split(/[/#]/);
  return parts[parts.length - 1] || t;
};

export const typeMatches = (rawType: unknown, want: string) => {
  const w = want.toLowerCase();
  return normalizeTypeArray(rawType).some(
    (t) => baseType(t).toLowerCase() === w,
  );
};

export const primaryTypeLabel = (raw: unknown): string => {
  const arr = normalizeTypeArray(raw);
  if (!arr.length) return "Unknown";
  return baseType(arr[0]);
};

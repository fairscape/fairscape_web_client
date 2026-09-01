import { Comment } from "../types/issue.types";
import { D4D_ASSISTANT_BOT } from "./constants";

export const extractD4DYamlUrl = (comments: Comment[]): string | null => {
  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  for (const comment of sortedComments) {
    if (comment.user !== D4D_ASSISTANT_BOT) continue;
    console.log("Checking comment from:", comment.user);
    // Match both "D4D YAML Link" and "D4D YAML" formats
    const urlMatch = comment.body.match(
      /📄\s+\*\*D4D YAML(?:\s+Link)?\*\*:\s*(https:\/\/raw\.githubusercontent\.com\/[^\s]+\.yaml)/,
    );

    if (urlMatch) {
      console.log("Found D4D YAML URL:", urlMatch[1]);
      return urlMatch[1];
    }
  }

  return null;
};

export const generateUrlRequestMessage = (): string => {
  return "@d4dassistant Could you please provide the D4D YAML link for review?";
};

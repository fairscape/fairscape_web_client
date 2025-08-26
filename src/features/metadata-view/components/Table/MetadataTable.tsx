import React from "react";
import JsonBlock from "../common/JsonBlock";
import type { MetadataBundle } from "../../types";

export default function MetadataTable({ bundle }: { bundle: MetadataBundle }) {
  const { kind, main, rocrate } = bundle;

  // show rocrate JSON for rocrates/releases, otherwise main
  if (kind === "rocrate" || kind === "release") {
    return <JsonBlock title="RO-Crate JSON" data={rocrate} />;
  }

  return <JsonBlock title="Main JSON" data={main} />;
}

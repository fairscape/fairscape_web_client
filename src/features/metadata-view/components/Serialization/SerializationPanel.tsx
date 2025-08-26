import React from "react";
import JsonBlock from "../common/JsonBlock";
import type { MetadataBundle } from "../../types";

export default function SerializationPanel({
  bundle,
}: {
  bundle: MetadataBundle;
}) {
  return (
    <div className="space-y-4">
      <JsonBlock title="Main JSON" data={bundle.main} />
      {bundle.rocrate ? (
        <JsonBlock title="RO-Crate JSON" data={bundle.rocrate} />
      ) : null}
      {/* Add RDF/Turtle later */}
    </div>
  );
}

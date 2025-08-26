import React from "react";
import JsonBlock from "../common/JsonBlock";
import type { EvidenceInfo } from "../../types";

export default function EvidenceGraphPanel({
  evidence,
}: {
  evidence?: EvidenceInfo;
}) {
  if (!evidence) {
    return (
      <div className="text-sm">
        No evidence graph (not applicable for releases).
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <JsonBlock
        title="Evidence Graph Status"
        data={{
          id: evidence.id ?? null,
          status: evidence.status,
          error: evidence.error ?? null,
        }}
      />
      {evidence.data ? (
        <JsonBlock title="Evidence Graph JSON" data={evidence.data} />
      ) : null}
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMetadataBundle } from "../features/metadata-view/hooks/useMetadataBundle.ts";
import MetadataTable from "../features/metadata-view/components/Table/MetadataTable";
import SerializationPanel from "../features/metadata-view/components/Serialization/SerializationPanel";
import EvidenceGraphPanel from "../features/metadata-view/components/EvidenceGraph/EvidenceGraphPanel.tsx";

// Tabs
type TabKey = "table" | "serialization" | "evidence";

// Extract the ARK from /view/* route. Supports either /view/<ark> or /view?ark=<ark>
function useArkFromRoute(): string | null {
  const { pathname, search } = useLocation();

  // 1) query param ?ark=
  const sp = new URLSearchParams(search);
  const qp = sp.get("ark");
  if (qp) return qp;

  // 2) wildcard tail after /view/
  const idx = pathname.indexOf("/view/");
  if (idx >= 0) {
    const tail = pathname.slice(idx + "/view/".length);
    if (tail) return decodeURIComponent(tail);
  }
  return null;
}

export default function MetadataDisplayPage() {
  const ark = useArkFromRoute();
  const { bundle, loading, error } = useMetadataBundle(ark || "");
  const [tab, setTab] = useState<TabKey>("table");

  const tabs: { key: TabKey; label: string }[] = useMemo(
    () => [
      { key: "table", label: "Table" },
      { key: "serialization", label: "Serialization" },
      { key: "evidence", label: "Evidence Graph" },
    ],
    []
  );

  if (!ark) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="text-2xl font-bold">Metadata Viewer</h1>
        <p className="mt-2 text-sm">
          No ARK provided. Use /view/&lt;ark&gt; or /view?ark=&lt;ark&gt;.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Metadata Viewer</h1>
        <div className="mt-1 text-sm">ARK: {ark}</div>
        {bundle && (
          <div className="mt-1 text-xs text-gray-500">
            Inferred type: <span className="font-mono">{bundle.kind}</span>
          </div>
        )}
      </header>

      <nav className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-2xl border px-3 py-1 text-sm ${
              tab === t.key
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading && <div className="text-sm">Loading…</div>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && bundle && (
        <section className="mt-2">
          {tab === "table" && <MetadataTable bundle={bundle} />}
          {tab === "serialization" && <SerializationPanel bundle={bundle} />}
          {tab === "evidence" && (
            <EvidenceGraphPanel evidence={bundle.evidence} />
          )}
        </section>
      )}
    </div>
  );
}

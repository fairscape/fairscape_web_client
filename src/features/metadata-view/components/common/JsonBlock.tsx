import React from "react";

export default function JsonBlock({
  title,
  data,
}: {
  title?: string;
  data: any;
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      {title ? <h3 className="mb-2 text-lg font-semibold">{title}</h3> : null}
      <pre className="overflow-auto text-sm leading-6">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

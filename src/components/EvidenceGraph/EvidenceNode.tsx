// src/components/EvidenceGraph/EvidenceNode.tsx
import React, { useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { EvidenceNodeData } from "../../types/graph";
import {
  formatPropertyValue,
  getDisplayableProperties,
} from "../../utils/graphUtils";

const getNodeColor = (type: string): string => {
  switch (type) {
    case "Dataset":
    case "Sample":
      return "#8AE68A";
    case "Computation":
    case "Experiment":
      return "#FD9A9A";
    case "Software":
    case "Instrument":
      return "#FFC107";
    case "DatasetCollection":
      return "#B5DEFF";
    default:
      return "#ccc";
  }
};

const EvidenceNode: React.FC<NodeProps<EvidenceNodeData>> = ({
  data,
  isConnectable,
}) => {
  const nodeColor = getNodeColor(data.type);

  const renderTooltipContent = useCallback(() => {
    const sourceProps = getDisplayableProperties(data._sourceData);
    const allProps = { ...sourceProps, ...data.properties };

    return (
      <div
        className="tooltip-content"
        style={{ maxWidth: "450px", textAlign: "left", fontSize: "0.9em" }}
      >
        <h4>{data.label || "Node Details"}</h4>
        <p style={{ margin: "2px 0" }}>
          <strong>@id:</strong>{" "}
          <span
            className="prop-value"
            dangerouslySetInnerHTML={{ __html: formatPropertyValue(data.id) }}
          ></span>
        </p>
        <p style={{ margin: "2px 0" }}>
          <strong>@type:</strong>{" "}
          <span className="prop-value">{data.type}</span>
        </p>
        {data.description && (
          <p style={{ margin: "2px 0" }}>
            <strong>description:</strong>{" "}
            <span className="prop-value">{data.description}</span>
          </p>
        )}

        {Object.entries(allProps).map(([key, value]) => {
          if (
            !["name", "label", "description", "@id", "@type", "count"].includes(
              key
            ) &&
            !key.startsWith("_")
          ) {
            return (
              <p key={key} style={{ margin: "2px 0" }}>
                <strong
                  style={{
                    display: "inline-block",
                    minWidth: "90px",
                    verticalAlign: "top",
                  }}
                >
                  {key}:
                </strong>{" "}
                <span
                  className="prop-value"
                  style={{
                    display: "inline-block",
                    maxWidth: "calc(100% - 100px)",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatPropertyValue(value),
                  }}
                ></span>
              </p>
            );
          }
          return null;
        })}

        {data.expandable && (
          <em style={{ display: "block", marginTop: "8px", color: "#555" }}>
            (Click node center to expand{" "}
            {data.type === "DatasetCollection" ? "next item" : "details"})
          </em>
        )}
      </div>
    );
  }, [data]);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "0",
        borderRadius: "5px",
        border: data.expandable ? "2px dashed #333" : "1px solid #ddd",
        textAlign: "center",
        width: "180px",
        height: "90px",
        fontSize: "13px",
        position: "relative",
        cursor: data.expandable ? "pointer" : "default",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />

      <div
        style={{
          background: nodeColor,
          padding: "8px 6px",
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "center",
          width: "100%",
          borderTopLeftRadius: "3px",
          borderTopRightRadius: "3px",
        }}
      >
        {data.type}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 15px",
          width: "100%",
          textAlign: "center",
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "12px",
          lineHeight: "1.3",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          {data.displayName}
        </div>
      </div>

      <Tippy
        content={renderTooltipContent()}
        theme="light"
        interactive={true}
        placement="right-start"
        trigger="click"
        appendTo={() => document.body}
        maxWidth={500}
      >
        <button
          onClick={handleIconClick}
          aria-label={`Details for ${data.label}`}
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "22px",
            height: "22px",
            background: nodeColor,
            color: "#333",
            border: "none",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            padding: "0",
            margin: "0",
            borderBottomLeftRadius: "4px",
          }}
        >
          i
        </button>
      </Tippy>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: "#555" }}
      />
    </div>
  );
};

export default React.memo(EvidenceNode);

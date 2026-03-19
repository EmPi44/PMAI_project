"use client";

import { T } from "@/lib/tokens";
import type { Edge } from "@xyflow/react";

interface Props {
  edge: Edge;
  onUpdateLabel: (edgeId: string, label: string) => void;
  onClose: () => void;
}

export function EdgeEditPanel({ edge, onUpdateLabel, onClose }: Props) {
  return (
    <div
      style={{
        width: 272,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: T.surface,
        borderLeft: `1px solid ${T.border}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          height: 40,
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: T.text }}>
          Edit Connection
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.textSubtlest,
            fontSize: 18,
            lineHeight: 1,
            padding: "0 2px",
          }}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {/* Fields */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: T.textSubtle,
              marginBottom: 5,
              letterSpacing: "0.05em",
            }}
          >
            LABEL
          </label>
          <input
            value={typeof edge.label === "string" ? edge.label : ""}
            onChange={(e) => onUpdateLabel(edge.id, e.target.value)}
            placeholder="e.g. Yes, No, Approved..."
            style={{
              width: "100%",
              padding: "6px 9px",
              borderRadius: 4,
              border: `1.5px solid ${T.border}`,
              fontSize: 13,
              color: T.text,
              background: T.surface,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 120ms",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.borderFocused; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
          <div style={{ marginTop: 5, fontSize: 11, color: T.textSubtlest }}>
            Label appears along the connection line.
          </div>
        </div>

        <div
          style={{
            padding: "8px 10px",
            borderRadius: 4,
            background: T.surfaceSunken,
            border: `1px solid ${T.borderSubtle}`,
          }}
        >
          <div style={{ fontSize: 11, color: T.textSubtlest, marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>
            EDGE ID
          </div>
          <div style={{ fontSize: 11, color: T.textSubtle, fontFamily: "monospace", wordBreak: "break-all" }}>
            {edge.id}
          </div>
        </div>
      </div>
    </div>
  );
}

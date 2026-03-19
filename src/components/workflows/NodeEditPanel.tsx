"use client";

import { T } from "@/lib/tokens";
import type { WorkflowNode, ActorType } from "./types";

interface Props {
  node: WorkflowNode;
  onUpdate: (nodeId: string, patch: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

const ACTOR_OPTIONS: { value: ActorType; label: string; icon: string; color: string }[] = [
  { value: "human",     label: "Human",     icon: "👤", color: "#0C66E4" },
  { value: "automated", label: "Automated", icon: "⚡", color: "#6554C0" },
  { value: "system",    label: "System",    icon: "⚙",  color: "#44546F" },
];

const NODE_TYPE_LABEL: Record<string, string> = {
  activity: "Activity",
  decision: "Decision",
  start:    "Start",
  end:      "End",
};

export function NodeEditPanel({ node, onUpdate, onDelete, onClose }: Props) {
  const data = node.data as Record<string, unknown>;
  const typeLabel = NODE_TYPE_LABEL[node.type ?? ""] ?? "Node";

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
          Edit {typeLabel}
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
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14, flex: 1, overflowY: "auto" }}>
        {/* Label */}
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
            value={String(data.label ?? "")}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
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
        </div>

        {/* Actor (activity nodes only) */}
        {node.type === "activity" && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: T.textSubtle,
                marginBottom: 6,
                letterSpacing: "0.05em",
              }}
            >
              ACTOR
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {ACTOR_OPTIONS.map((opt) => {
                const isSelected = data.actor === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onUpdate(node.id, { actor: opt.value })}
                    style={{
                      flex: 1,
                      padding: "7px 4px",
                      borderRadius: 5,
                      border: `1.5px solid ${isSelected ? opt.color : T.border}`,
                      background: isSelected ? `${opt.color}15` : "transparent",
                      color: isSelected ? opt.color : T.textSubtle,
                      fontSize: 11,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 120ms",
                    }}
                  >
                    <div style={{ fontSize: 15, marginBottom: 2 }}>{opt.icon}</div>
                    <div>{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
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
            DESCRIPTION
          </label>
          <textarea
            value={String(data.description ?? "")}
            onChange={(e) => onUpdate(node.id, { description: e.target.value })}
            rows={3}
            placeholder="Optional notes..."
            style={{
              width: "100%",
              padding: "6px 9px",
              borderRadius: 4,
              border: `1.5px solid ${T.border}`,
              fontSize: 13,
              color: T.text,
              background: T.surface,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "border-color 120ms",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.borderFocused; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
        </div>

        {/* Node ID (read-only, useful for JSON/scenario editing) */}
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
            NODE ID
          </label>
          <div
            style={{
              padding: "5px 9px",
              borderRadius: 4,
              border: `1px solid ${T.borderSubtle}`,
              background: T.surfaceSunken,
              fontSize: 12,
              color: T.textSubtlest,
              fontFamily: "monospace",
            }}
          >
            {node.id}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => onDelete(node.id)}
          style={{
            width: "100%",
            padding: "7px",
            borderRadius: 4,
            border: `1.5px solid #C9372C`,
            background: "transparent",
            color: "#C9372C",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 120ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#FFEDEB"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}

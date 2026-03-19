"use client";

import { T } from "@/lib/tokens";
import type { WorkflowScenario } from "./types";

interface Props {
  scenarios: WorkflowScenario[];
  activeScenario: WorkflowScenario | null;
  onScenarioSelect: (s: WorkflowScenario) => void;
  onAutoLayout: () => void;
  onToggleJson: () => void;
  jsonPanelOpen: boolean;
}

export function WorkflowToolbar({
  scenarios,
  activeScenario,
  onScenarioSelect,
  onAutoLayout,
  onToggleJson,
  jsonPanelOpen,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        height: 48,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, marginRight: 8 }}>
        HR Application Flow
      </span>

      <div style={{ width: 1, height: 20, background: T.border, marginRight: 4 }} />

      {/* Scenario label */}
      <span style={{ fontSize: 11, fontWeight: 600, color: T.textSubtlest, letterSpacing: "0.05em", marginRight: 4 }}>
        SCENARIO:
      </span>

      {/* Scenario buttons */}
      {scenarios.map((s) => {
        const isActive = activeScenario?.id === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onScenarioSelect(s)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 4,
              border: isActive ? `1.5px solid ${s.color}` : `1.5px solid ${T.border}`,
              background: isActive ? `${s.color}15` : "transparent",
              color: isActive ? s.color : T.textSubtle,
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = T.surfaceHovered;
                e.currentTarget.style.color = T.text;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = T.textSubtle;
              }
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: s.color,
                flexShrink: 0,
              }}
            />
            {s.label}
          </button>
        );
      })}

      {activeScenario && (
        <button
          onClick={() => onScenarioSelect(activeScenario)}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            border: "none",
            background: "transparent",
            color: T.textSubtlest,
            fontSize: 11,
            cursor: "pointer",
          }}
          title="Clear scenario"
        >
          ✕ Clear
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Auto-layout */}
      <button
        onClick={onAutoLayout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 4,
          border: `1px solid ${T.border}`,
          background: "transparent",
          color: T.textSubtle,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 150ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.color = T.text; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSubtle; }}
        title="Auto-arrange nodes"
      >
        ⊞ Auto Layout
      </button>

      {/* JSON toggle */}
      <button
        onClick={onToggleJson}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 4,
          border: `1px solid ${jsonPanelOpen ? T.brandBold : T.border}`,
          background: jsonPanelOpen ? T.brandSubtle : "transparent",
          color: jsonPanelOpen ? T.brandBold : T.textSubtle,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 150ms ease",
        }}
        onMouseEnter={(e) => {
          if (!jsonPanelOpen) {
            e.currentTarget.style.background = T.surfaceHovered;
            e.currentTarget.style.color = T.text;
          }
        }}
        onMouseLeave={(e) => {
          if (!jsonPanelOpen) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = T.textSubtle;
          }
        }}
      >
        {"{ }"} JSON
      </button>
    </div>
  );
}

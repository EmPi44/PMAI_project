"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { T } from "@/lib/tokens";
import type { WorkflowScenario, ActorType } from "./types";

export type AddNodeType =
  | { type: "start" }
  | { type: "end" }
  | { type: "activity"; actor: ActorType }
  | { type: "decision" };

interface Props {
  workflowName: string;
  scenarios: WorkflowScenario[];
  activeScenario: WorkflowScenario | null;
  onScenarioSelect: (s: WorkflowScenario) => void;
  onAddNode: (spec: AddNodeType) => void;
  onAddScenario: () => void;
  onAutoLayout: () => void;
  onToggleJson: () => void;
  jsonPanelOpen: boolean;
}

const ADD_OPTIONS: { label: string; icon: string; spec: AddNodeType; color: string }[] = [
  { label: "Start",             icon: "▶", spec: { type: "start" },                          color: "#1F845A" },
  { label: "End",               icon: "■", spec: { type: "end" },                            color: "#C9372C" },
  { label: "Activity — Human",  icon: "👤", spec: { type: "activity", actor: "human" },       color: "#0C66E4" },
  { label: "Activity — Auto",   icon: "⚡", spec: { type: "activity", actor: "automated" },   color: "#6554C0" },
  { label: "Activity — System", icon: "⚙",  spec: { type: "activity", actor: "system" },      color: "#44546F" },
  { label: "Decision",          icon: "◆", spec: { type: "decision" },                       color: "#CF9F02" },
];

function ToolbarBtn({
  onClick,
  active,
  activeColor,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 11px",
        borderRadius: 4,
        border: `1px solid ${active && activeColor ? activeColor : T.border}`,
        background: active && activeColor ? `${activeColor}15` : "transparent",
        color: active && activeColor ? activeColor : T.textSubtle,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = T.surfaceHovered;
          e.currentTarget.style.color = T.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = active && activeColor ? `${activeColor}15` : "transparent";
          e.currentTarget.style.color = active && activeColor ? activeColor : T.textSubtle;
        }
      }}
    >
      {children}
    </button>
  );
}

export function WorkflowToolbar({
  workflowName,
  scenarios,
  activeScenario,
  onScenarioSelect,
  onAddNode,
  onAddScenario,
  onAutoLayout,
  onToggleJson,
  jsonPanelOpen,
}: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addBtnRef = useRef<HTMLDivElement>(null);

  // Close add menu on outside click
  useEffect(() => {
    if (!addMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (addBtnRef.current && !addBtnRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [addMenuOpen]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 14px",
        height: 48,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Back link */}
      <Link
        href="/workflows"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: T.textSubtle,
          textDecoration: "none",
          padding: "4px 8px",
          borderRadius: 4,
          transition: "all 150ms",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHovered; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = T.textSubtle; e.currentTarget.style.background = "transparent"; }}
      >
        ← Workflows
      </Link>

      <div style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }} />

      {/* Title */}
      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, marginLeft: 2, marginRight: 6, flexShrink: 0 }}>
        {workflowName}
      </span>

      {/* Add node dropdown */}
      <div ref={addBtnRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setAddMenuOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 11px",
            borderRadius: 4,
            border: `1px solid ${addMenuOpen ? T.brandBold : T.border}`,
            background: addMenuOpen ? T.brandSubtle : T.brandBold,
            color: addMenuOpen ? T.brandBold : "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          + Add
        </button>

        {addMenuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 50,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              boxShadow: "0 4px 16px rgba(9,30,66,0.18)",
              minWidth: 200,
              overflow: "hidden",
            }}
          >
            {ADD_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => { onAddNode(opt.spec); setAddMenuOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: T.text,
                  textAlign: "left",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    background: `${opt.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 20, background: T.border, flexShrink: 0, marginLeft: 2 }} />

      {/* Scenario label */}
      {scenarios.length > 0 && (
        <span style={{ fontSize: 11, fontWeight: 600, color: T.textSubtlest, letterSpacing: "0.05em", flexShrink: 0 }}>
          SCENARIO:
        </span>
      )}

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
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.color = T.text; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSubtle; } }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            {s.label}
          </button>
        );
      })}

      {activeScenario && (
        <button
          onClick={() => onScenarioSelect(activeScenario)}
          style={{ padding: "4px 6px", borderRadius: 4, border: "none", background: "transparent", color: T.textSubtlest, fontSize: 11, cursor: "pointer", flexShrink: 0 }}
        >
          ✕
        </button>
      )}

      {/* Add Scenario button */}
      <button
        onClick={onAddScenario}
        title="New scenario"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 9px",
          borderRadius: 4,
          border: `1px dashed ${T.border}`,
          background: "transparent",
          color: T.textSubtlest,
          fontSize: 11,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 150ms ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.brandBold; e.currentTarget.style.color = T.brandBold; e.currentTarget.style.background = T.brandSubtle; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSubtlest; e.currentTarget.style.background = "transparent"; }}
      >
        + Scenario
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <ToolbarBtn onClick={onAutoLayout} title="Auto-arrange nodes">
        ⊞ Auto Layout
      </ToolbarBtn>

      <ToolbarBtn onClick={onToggleJson} active={jsonPanelOpen} activeColor={T.brandBold}>
        {"{ }"} JSON
      </ToolbarBtn>
    </div>
  );
}

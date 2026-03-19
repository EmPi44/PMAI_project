"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/tokens";
import type { WorkflowScenario, ActorType } from "./types";
import type { SaveStatus } from "./WorkflowCanvas";

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
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFitView: () => void;
  onFlushSave: () => Promise<void>;
}

const ADD_OPTIONS: { label: string; icon: string; spec: AddNodeType; color: string }[] = [
  { label: "Start",             icon: "▶", spec: { type: "start" },                          color: "#1F845A" },
  { label: "End",               icon: "■", spec: { type: "end" },                            color: "#C9372C" },
  { label: "Activity — Human",  icon: "👤", spec: { type: "activity", actor: "human" },       color: "#0C66E4" },
  { label: "Activity — Auto",   icon: "⚡", spec: { type: "activity", actor: "automated" },   color: "#6554C0" },
  { label: "Activity — System", icon: "⚙",  spec: { type: "activity", actor: "system" },      color: "#44546F" },
  { label: "Decision",          icon: "◆", spec: { type: "decision" },                       color: "#CF9F02" },
];

function Divider() {
  return <div style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }} />;
}

function IconBtn({
  onClick,
  disabled,
  title,
  children,
  active,
  activeColor,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "5px 9px",
        borderRadius: 4,
        border: `1px solid ${active && activeColor ? activeColor : T.border}`,
        background: active && activeColor ? `${activeColor}15` : "transparent",
        color: disabled
          ? T.textDisabled
          : active && activeColor
          ? activeColor
          : T.textSubtle,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.45 : 1,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = T.surfaceHovered;
          e.currentTarget.style.color = T.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = T.textSubtle;
        }
      }}
    >
      {children}
    </button>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const config = {
    saving: { text: "Saving...", color: T.textSubtlest },
    saved:  { text: "✓ Saved",  color: T.textSuccess },
    error:  { text: "⚠ Save failed", color: "#C9372C" },
  } as const;

  const cfg = config[status];
  return (
    <span
      style={{
        fontSize: 11,
        color: cfg.color,
        fontWeight: 500,
        flexShrink: 0,
        transition: "opacity 300ms",
      }}
    >
      {cfg.text}
    </span>
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
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFitView,
  onFlushSave,
}: Props) {
  const router = useRouter();
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 12px",
        height: 48,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Left zone ─────────────────────────────────────────────────────── */}
      <button
        onClick={async () => {
          await onFlushSave();
          router.push("/workflows");
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: T.textSubtle,
          textDecoration: "none",
          padding: "4px 8px",
          borderRadius: 4,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          transition: "all 150ms",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = T.text;
          e.currentTarget.style.background = T.surfaceHovered;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = T.textSubtle;
          e.currentTarget.style.background = "transparent";
        }}
      >
        ← Workflows
      </button>

      <Divider />

      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: T.text,
          marginRight: 4,
          flexShrink: 0,
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {workflowName}
      </span>

      {/* Add node dropdown */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {addMenuOpen && (
          <div
            onClick={() => setAddMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 49,
            }}
          />
        )}
        <button
          onClick={() => setAddMenuOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
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
                onClick={() => {
                  onAddNode(opt.spec);
                  setAddMenuOpen(false);
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.surfaceHovered;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
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

      <Divider />

      {/* Undo / Redo */}
      <IconBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        ↺
      </IconBtn>
      <IconBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        ↻
      </IconBtn>

      {/* ── Spacer ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Scenarios zone ────────────────────────────────────────────────── */}
      {scenarios.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            overflow: "hidden",
            maxWidth: 320,
            flexShrink: 1,
          }}
        >
          {scenarios.slice(0, 4).map((s) => {
            const isActive = activeScenario?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onScenarioSelect(s)}
                title={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 4,
                  border: isActive ? `1.5px solid ${s.color}` : `1.5px solid ${T.border}`,
                  background: isActive ? `${s.color}15` : "transparent",
                  color: isActive ? s.color : T.textSubtle,
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  flexShrink: 0,
                  maxWidth: 100,
                  overflow: "hidden",
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
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </span>
              </button>
            );
          })}

          {scenarios.length > 4 && (
            <span style={{ fontSize: 11, color: T.textSubtlest, flexShrink: 0 }}>
              +{scenarios.length - 4}
            </span>
          )}

          {activeScenario && (
            <button
              onClick={() => onScenarioSelect(activeScenario)}
              title="Clear scenario"
              style={{
                padding: "3px 6px",
                borderRadius: 4,
                border: "none",
                background: "transparent",
                color: T.textSubtlest,
                fontSize: 12,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

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
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = T.brandBold;
          e.currentTarget.style.color = T.brandBold;
          e.currentTarget.style.background = T.brandSubtle;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.color = T.textSubtlest;
          e.currentTarget.style.background = "transparent";
        }}
      >
        + Scenario
      </button>

      <Divider />

      {/* ── Tools ─────────────────────────────────────────────────────────── */}
      <IconBtn onClick={onAutoLayout} title="Auto-arrange nodes (Dagre layout)">
        ⊞ Layout
      </IconBtn>

      <IconBtn onClick={onFitView} title="Fit all nodes in view">
        ⊡ Fit
      </IconBtn>

      <IconBtn onClick={onToggleJson} active={jsonPanelOpen} activeColor={T.brandBold} title="Toggle JSON editor">
        {"{ }"} JSON
      </IconBtn>

      <Divider />

      <SaveIndicator status={saveStatus} />
    </div>
  );
}

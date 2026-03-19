"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/tokens";
import type { Workflow } from "./types";
import { createWorkflow } from "@/lib/supabase/workflows";

interface Props {
  workflows: Workflow[];
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  active:   { bg: "#DFFCF0", text: "#1F845A", label: "Active" },
  draft:    { bg: "#F1F2F4", text: "#44546F", label: "Draft" },
  archived: { bg: "#F1F2F4", text: "#626F86", label: "Archived" },
};

const COL = {
  chevron:   40,
  name:      "1fr",
  status:    96,
  scenarios: 96,
  nodes:     72,
  updated:   110,
  action:    120,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function HeaderCell({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: T.textSubtlest,
        letterSpacing: "0.05em",
        textAlign: align,
        padding: "0 8px",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
}

function WorkflowRow({ workflow }: { workflow: Workflow }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLE[workflow.status];
  const hasScenarios = workflow.scenarios.length > 0;

  return (
    <>
      {/* Workflow row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${COL.chevron}px ${COL.name} ${COL.status}px ${COL.scenarios}px ${COL.nodes}px ${COL.updated}px ${COL.action}px`,
          alignItems: "center",
          minHeight: 56,
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          transition: "background 120ms",
          cursor: hasScenarios ? "pointer" : "default",
        }}
        onClick={() => hasScenarios && setExpanded((e) => !e)}
        onMouseEnter={(el) => { el.currentTarget.style.background = T.surfaceHovered; }}
        onMouseLeave={(el) => { el.currentTarget.style.background = T.surface; }}
      >
        {/* Chevron */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hasScenarios && (
            <span
              style={{
                fontSize: 10,
                color: T.textSubtle,
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 150ms ease",
                display: "inline-block",
              }}
            >
              ▶
            </span>
          )}
        </div>

        {/* Name + description */}
        <div style={{ padding: "12px 8px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: "20px" }}>
            {workflow.name}
          </div>
          {workflow.description && (
            <div style={{ fontSize: 12, color: T.textSubtle, lineHeight: "16px", marginTop: 2 }}>
              {workflow.description}
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ padding: "0 8px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 3,
              background: status.bg,
              color: status.text,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Scenarios count */}
        <div style={{ padding: "0 8px", textAlign: "center", fontSize: 13, color: T.textSubtle, fontWeight: 500 }}>
          {workflow.scenarios.length > 0 ? workflow.scenarios.length : "—"}
        </div>

        {/* Node count */}
        <div style={{ padding: "0 8px", textAlign: "center", fontSize: 13, color: T.textSubtle }}>
          {workflow.nodes.length > 0 ? workflow.nodes.length : "—"}
        </div>

        {/* Updated */}
        <div style={{ padding: "0 8px", fontSize: 12, color: T.textSubtlest }}>
          {formatDate(workflow.updatedAt)}
        </div>

        {/* Action */}
        <div
          style={{ padding: "0 8px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/workflows/${workflow.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 12px",
              borderRadius: 4,
              border: `1px solid ${T.border}`,
              background: T.surface,
              color: T.textSubtle,
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.brandSubtle; e.currentTarget.style.color = T.brandBold; e.currentTarget.style.borderColor = T.brandBold; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.textSubtle; e.currentTarget.style.borderColor = T.border; }}
          >
            Open Canvas
          </Link>
        </div>
      </div>

      {/* Scenario child rows */}
      {expanded && workflow.scenarios.map((scenario) => (
        <div
          key={scenario.id}
          style={{
            display: "grid",
            gridTemplateColumns: `${COL.chevron}px ${COL.name} ${COL.status}px ${COL.scenarios}px ${COL.nodes}px ${COL.updated}px ${COL.action}px`,
            alignItems: "center",
            height: 44,
            borderBottom: `1px solid ${T.borderSubtle}`,
            background: T.surfaceSunken,
            transition: "background 120ms",
          }}
          onMouseEnter={(el) => { el.currentTarget.style.background = T.surfaceHovered; }}
          onMouseLeave={(el) => { el.currentTarget.style.background = T.surfaceSunken; }}
        >
          {/* Indent + color dot */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, color: T.textSubtlest }}>└</span>
          </div>

          {/* Scenario name */}
          <div style={{ padding: "0 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: scenario.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: T.textSubtle, fontWeight: 500 }}>
              {scenario.label}
            </span>
          </div>

          {/* Status — empty for scenario rows */}
          <div />

          {/* Path nodes */}
          <div style={{ padding: "0 8px", textAlign: "center", fontSize: 12, color: T.textSubtlest }}>
            {scenario.nodeIds.length} nodes
          </div>

          {/* Path edges */}
          <div style={{ padding: "0 8px", textAlign: "center", fontSize: 12, color: T.textSubtlest }}>
            {scenario.edgeIds.length} edges
          </div>

          {/* Updated — empty */}
          <div />

          {/* View action */}
          <div style={{ padding: "0 8px" }}>
            <Link
              href={`/workflows/${workflow.id}?scenario=${scenario.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 4,
                border: `1px solid ${scenario.color}50`,
                background: `${scenario.color}10`,
                color: scenario.color,
                fontSize: 11,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${scenario.color}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${scenario.color}10`; }}
            >
              View →
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}

export function WorkflowListView({ workflows: initial }: Props) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>(initial);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const id = await createWorkflow(name, newDesc.trim());
    const workflow: Workflow = {
      id,
      name,
      description: newDesc.trim(),
      status: "draft",
      updatedAt: new Date().toISOString().split("T")[0],
      nodes: [],
      edges: [],
      scenarios: [],
    };
    setWorkflows((prev) => [...prev, workflow]);
    setCreateModalOpen(false);
    setNewName("");
    setNewDesc("");
    router.push(`/workflows/${id}`);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", background: T.surfaceSunken }}>
      {/* Page header */}
      <div
        style={{
          padding: "20px 24px 16px",
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, lineHeight: "28px" }}>
            Workflows
          </h1>
          <p style={{ fontSize: 13, color: T.textSubtle, margin: "4px 0 0" }}>
            Design and manage end-to-end process flows for customer discussions
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 4,
            border: "none",
            background: T.brandBold,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 150ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.brandBoldHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = T.brandBold; }}
        >
          + New Workflow
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, padding: "16px 24px" }}>
        <div
          style={{
            background: T.surface,
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${COL.chevron}px ${COL.name} ${COL.status}px ${COL.scenarios}px ${COL.nodes}px ${COL.updated}px ${COL.action}px`,
              alignItems: "center",
              height: 36,
              borderBottom: `1px solid ${T.border}`,
              background: T.surfaceSunken,
            }}
          >
            <div />
            <HeaderCell>WORKFLOW</HeaderCell>
            <HeaderCell>STATUS</HeaderCell>
            <HeaderCell align="center">SCENARIOS</HeaderCell>
            <HeaderCell align="center">NODES</HeaderCell>
            <HeaderCell>UPDATED</HeaderCell>
            <div />
          </div>

          {/* Rows */}
          {workflows.map((w) => (
            <WorkflowRow key={w.id} workflow={w} />
          ))}

          {workflows.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: T.textSubtlest, fontSize: 14 }}>
              No workflows yet
            </div>
          )}
        </div>
      </div>

      {/* New Workflow Modal */}
      {createModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(9,30,66,0.54)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{
              background: T.surface,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              boxShadow: "0 8px 32px rgba(9,30,66,0.2)",
              width: 440,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 16px" }}>
              New Workflow
            </h2>

            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textSubtle, display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>
                NAME *
              </span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) handleCreate(); if (e.key === "Escape") setCreateModalOpen(false); }}
                autoFocus
                placeholder="e.g. Customer Onboarding"
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 4,
                  border: `2px solid ${T.border}`,
                  fontSize: 13,
                  color: T.text,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textSubtle, display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>
                DESCRIPTION
              </span>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="Short description of this workflow…"
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 4,
                  border: `2px solid ${T.border}`,
                  fontSize: 13,
                  color: T.text,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  color: T.textSubtle,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{
                  padding: "6px 16px",
                  borderRadius: 4,
                  border: "none",
                  background: newName.trim() ? T.brandBold : T.border,
                  color: newName.trim() ? "#fff" : T.textSubtlest,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: newName.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  transition: "all 150ms",
                }}
              >
                Create &amp; Open Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

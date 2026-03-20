"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/tokens";
import type { Workflow } from "./types";
import { createWorkflow, deleteWorkflow, updateWorkflow, duplicateWorkflow } from "@/lib/supabase/workflows";

interface Props {
  workflows: Workflow[];
}

type WorkflowStatus = "active" | "draft" | "archived";
type SortKey = "name" | "updated" | "nodes" | "scenarios";
type SortDir = "asc" | "desc";

const STATUS_STYLE: Record<WorkflowStatus, { bg: string; text: string; label: string }> = {
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
  action:    168,
};

const GRID = `${COL.chevron}px ${COL.name} ${COL.status}px ${COL.scenarios}px ${COL.nodes}px ${COL.updated}px ${COL.action}px`;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function SortableHeader({
  children,
  align = "left",
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  sortKey: SortKey;
  activeSortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sortKey === activeSortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        color: isActive ? T.brandBold : T.textSubtlest,
        letterSpacing: "0.05em",
        textAlign: align,
        padding: "0 8px",
        userSelect: "none",
        background: "none",
        border: "none",
        cursor: "pointer",
        width: "100%",
        height: "100%",
        transition: "color 120ms",
      }}
    >
      {children}
      <span style={{ fontSize: 9, opacity: isActive ? 1 : 0.3 }}>
        {isActive ? (sortDir === "asc" ? "▲" : "▼") : "▲"}
      </span>
    </button>
  );
}

function StaticHeader({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
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

interface WorkflowRowProps {
  workflow: Workflow;
  onMenuOpen: (id: string, rect: DOMRect) => void;
}

function WorkflowRow({ workflow, onMenuOpen }: WorkflowRowProps) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLE[workflow.status];
  const hasScenarios = workflow.scenarios.length > 0;
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
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

        {/* Status badge */}
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

        {/* Actions */}
        <div
          style={{ padding: "0 8px", display: "flex", alignItems: "center", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/workflows/${workflow.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 4,
              border: `1px solid ${T.border}`,
              background: T.surface,
              color: T.textSubtle,
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 150ms",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.brandSubtle; e.currentTarget.style.color = T.brandBold; e.currentTarget.style.borderColor = T.brandBold; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.textSubtle; e.currentTarget.style.borderColor = T.border; }}
          >
            Open Canvas
          </Link>

          <button
            ref={menuBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              onMenuOpen(workflow.id, rect);
            }}
            title="More actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 4,
              border: `1px solid transparent`,
              background: "transparent",
              color: T.textSubtlest,
              fontSize: 16,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 120ms",
              letterSpacing: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSubtle; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = T.textSubtlest; }}
          >
            ···
          </button>
        </div>
      </div>

      {/* Scenario child rows */}
      {expanded && workflow.scenarios.map((scenario) => (
        <div
          key={scenario.id}
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            alignItems: "center",
            height: 44,
            borderBottom: `1px solid ${T.borderSubtle}`,
            background: T.surfaceSunken,
            transition: "background 120ms",
          }}
          onMouseEnter={(el) => { el.currentTarget.style.background = T.surfaceHovered; }}
          onMouseLeave={(el) => { el.currentTarget.style.background = T.surfaceSunken; }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, color: T.textSubtlest }}>└</span>
          </div>

          <div style={{ padding: "0 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: scenario.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: T.textSubtle, fontWeight: 500 }}>{scenario.label}</span>
          </div>

          <div />

          <div style={{ padding: "0 8px", textAlign: "center", fontSize: 12, color: T.textSubtlest }}>
            {scenario.nodeIds.length} nodes
          </div>

          <div style={{ padding: "0 8px", textAlign: "center", fontSize: 12, color: T.textSubtlest }}>
            {scenario.edgeIds.length} edges
          </div>

          <div />

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

// ── Modal helpers ──────────────────────────────────────────────────────────────

function inputStyle(focused: boolean) {
  return {
    width: "100%",
    padding: "7px 10px",
    borderRadius: 4,
    border: `2px solid ${focused ? T.brandBold : T.border}`,
    fontSize: 13,
    color: T.text,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    background: T.surface,
    transition: "border-color 150ms",
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: T.textSubtle, display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function WorkflowListView({ workflows: initial }: Props) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>(initial);

  // ── List controls ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkflowStatus>("all");
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Modals & menus ───────────────────────────────────────────────────────
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<WorkflowStatus>("draft");

  const [deletingWorkflow, setDeletingWorkflow] = useState<Workflow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [activeMenu, setActiveMenu] = useState<{ id: string; top: number; right: number } | null>(null);

  // Field focus states
  const [newNameFocused, setNewNameFocused] = useState(false);
  const [newDescFocused, setNewDescFocused] = useState(false);
  const [editNameFocused, setEditNameFocused] = useState(false);
  const [editDescFocused, setEditDescFocused] = useState(false);

  // ── Sort toggling ────────────────────────────────────────────────────────
  const handleSort = useCallback((key: SortKey) => {
    setSortBy((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir(key === "name" ? "asc" : "desc");
      return key;
    });
  }, []);

  // ── Computed display list ────────────────────────────────────────────────
  const displayedWorkflows = useMemo(() => {
    let list = [...workflows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      list = list.filter((w) => w.status === statusFilter);
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "updated") cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      else if (sortBy === "nodes") cmp = a.nodes.length - b.nodes.length;
      else if (sortBy === "scenarios") cmp = a.scenarios.length - b.scenarios.length;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [workflows, searchQuery, statusFilter, sortBy, sortDir]);

  // ── Create ───────────────────────────────────────────────────────────────
  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const id = await createWorkflow(name, newDesc.trim());
    const workflow: Workflow = {
      id, name, description: newDesc.trim(), status: "draft",
      updatedAt: new Date().toISOString().split("T")[0],
      nodes: [], edges: [], scenarios: [],
    };
    setWorkflows((prev) => [workflow, ...prev]);
    setCreateModalOpen(false);
    setNewName("");
    setNewDesc("");
    router.push(`/workflows/${id}`);
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  function openEdit(workflow: Workflow) {
    setEditingWorkflow(workflow);
    setEditName(workflow.name);
    setEditDesc(workflow.description);
    setEditStatus(workflow.status);
    setActiveMenu(null);
  }

  async function handleUpdate() {
    if (!editingWorkflow) return;
    const name = editName.trim();
    if (!name) return;
    await updateWorkflow(editingWorkflow.id, name, editDesc.trim(), editStatus);
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === editingWorkflow.id
          ? { ...w, name, description: editDesc.trim(), status: editStatus, updatedAt: new Date().toISOString().split("T")[0] }
          : w
      )
    );
    setEditingWorkflow(null);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  function openDelete(workflow: Workflow) {
    setDeletingWorkflow(workflow);
    setActiveMenu(null);
  }

  async function handleDelete() {
    if (!deletingWorkflow) return;
    setDeleteLoading(true);
    try {
      await deleteWorkflow(deletingWorkflow.id);
      setWorkflows((prev) => prev.filter((w) => w.id !== deletingWorkflow.id));
      setDeletingWorkflow(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Duplicate ─────────────────────────────────────────────────────────────
  async function handleDuplicate(workflow: Workflow) {
    setActiveMenu(null);
    const newId = await duplicateWorkflow(workflow);
    const copied: Workflow = {
      ...workflow,
      id: newId,
      name: `${workflow.name} (Copy)`,
      status: "draft",
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setWorkflows((prev) => [copied, ...prev]);
  }

  // ── Row menu ──────────────────────────────────────────────────────────────
  const handleMenuOpen = useCallback((id: string, rect: DOMRect) => {
    setActiveMenu({ id, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  }, []);

  const menuWorkflow = activeMenu ? workflows.find((w) => w.id === activeMenu.id) : null;

  // ── Render ────────────────────────────────────────────────────────────────
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

      {/* Search + filter toolbar */}
      <div
        style={{
          padding: "10px 24px",
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 260px" }}>
          <span
            style={{
              position: "absolute",
              left: 9,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: T.textSubtlest,
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            style={{
              width: "100%",
              padding: "6px 10px 6px 28px",
              borderRadius: 4,
              border: `1.5px solid ${T.border}`,
              fontSize: 13,
              color: T.text,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              background: T.surface,
              transition: "border-color 150ms",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {(["all", "draft", "active", "archived"] as const).map((f) => {
            const isActive = statusFilter === f;
            const label = f === "all" ? "All" : STATUS_STYLE[f].label;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 3,
                  border: `1.5px solid ${isActive ? T.brandBold : T.border}`,
                  background: isActive ? T.brandSubtle : "transparent",
                  color: isActive ? T.brandBold : T.textSubtle,
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 120ms",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.color = T.text; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSubtle; } }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <span style={{ fontSize: 12, color: T.textSubtlest, marginLeft: "auto" }}>
          {displayedWorkflows.length} workflow{displayedWorkflows.length !== 1 ? "s" : ""}
        </span>
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
              gridTemplateColumns: GRID,
              alignItems: "center",
              height: 36,
              borderBottom: `1px solid ${T.border}`,
              background: T.surfaceSunken,
            }}
          >
            <div />
            <SortableHeader sortKey="name" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort}>
              WORKFLOW
            </SortableHeader>
            <StaticHeader>STATUS</StaticHeader>
            <SortableHeader sortKey="scenarios" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort} align="center">
              SCENARIOS
            </SortableHeader>
            <SortableHeader sortKey="nodes" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort} align="center">
              NODES
            </SortableHeader>
            <SortableHeader sortKey="updated" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort}>
              UPDATED
            </SortableHeader>
            <div />
          </div>

          {/* Rows */}
          {displayedWorkflows.map((w) => (
            <WorkflowRow key={w.id} workflow={w} onMenuOpen={handleMenuOpen} />
          ))}

          {/* Empty state */}
          {workflows.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: T.textSubtlest, fontSize: 14 }}>
              No workflows yet
            </div>
          )}
          {workflows.length > 0 && displayedWorkflows.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: T.textSubtlest, fontSize: 14 }}>
              No workflows match your search
            </div>
          )}
        </div>
      </div>

      {/* Row context menu (position:fixed to escape overflow:hidden) */}
      {activeMenu && menuWorkflow && (
        <>
          <div
            onClick={() => setActiveMenu(null)}
            style={{ position: "fixed", inset: 0, zIndex: 98 }}
          />
          <div
            style={{
              position: "fixed",
              top: activeMenu.top,
              right: activeMenu.right,
              zIndex: 99,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              boxShadow: "0 4px 16px rgba(9,30,66,0.18)",
              minWidth: 168,
              overflow: "hidden",
            }}
          >
            {[
              { label: "Edit", icon: "✎", action: () => openEdit(menuWorkflow) },
              { label: "Duplicate", icon: "⧉", action: () => handleDuplicate(menuWorkflow) },
              { label: "Delete", icon: "✕", action: () => openDelete(menuWorkflow), danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
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
                  color: item.danger ? "#C9372C" : T.text,
                  textAlign: "left",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = item.danger ? "#FFF0EE" : T.surfaceHovered; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
              >
                <span style={{ fontSize: 12, opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Create Workflow Modal */}
      {createModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.54)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(9,30,66,0.2)", width: 440, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 16px" }}>New Workflow</h2>

            <label style={{ display: "block", marginBottom: 14 }}>
              <FieldLabel>NAME *</FieldLabel>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) handleCreate(); if (e.key === "Escape") setCreateModalOpen(false); }}
                autoFocus
                placeholder="e.g. Customer Onboarding"
                style={inputStyle(newNameFocused)}
                onFocus={() => setNewNameFocused(true)}
                onBlur={() => setNewNameFocused(false)}
              />
            </label>

            <label style={{ display: "block", marginBottom: 20 }}>
              <FieldLabel>DESCRIPTION</FieldLabel>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="Short description of this workflow…"
                style={{ ...inputStyle(newDescFocused), resize: "vertical" }}
                onFocus={() => setNewDescFocused(true)}
                onBlur={() => setNewDescFocused(false)}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setCreateModalOpen(false)} style={{ padding: "6px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: "transparent", color: T.textSubtle, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{ padding: "6px 16px", borderRadius: 4, border: "none", background: newName.trim() ? T.brandBold : T.border, color: newName.trim() ? "#fff" : T.textSubtlest, fontSize: 13, fontWeight: 600, cursor: newName.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 150ms" }}
              >
                Create &amp; Open Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workflow Modal */}
      {editingWorkflow && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.54)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={() => setEditingWorkflow(null)}
        >
          <div
            style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(9,30,66,0.2)", width: 440, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 16px" }}>Edit Workflow</h2>

            <label style={{ display: "block", marginBottom: 14 }}>
              <FieldLabel>NAME *</FieldLabel>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && editName.trim()) handleUpdate(); if (e.key === "Escape") setEditingWorkflow(null); }}
                autoFocus
                style={inputStyle(editNameFocused)}
                onFocus={() => setEditNameFocused(true)}
                onBlur={() => setEditNameFocused(false)}
              />
            </label>

            <label style={{ display: "block", marginBottom: 14 }}>
              <FieldLabel>DESCRIPTION</FieldLabel>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                style={{ ...inputStyle(editDescFocused), resize: "vertical" }}
                onFocus={() => setEditDescFocused(true)}
                onBlur={() => setEditDescFocused(false)}
              />
            </label>

            <div style={{ marginBottom: 20 }}>
              <FieldLabel>STATUS</FieldLabel>
              <div style={{ display: "flex", gap: 6 }}>
                {(["draft", "active", "archived"] as WorkflowStatus[]).map((s) => {
                  const style = STATUS_STYLE[s];
                  const isSelected = editStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setEditStatus(s)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 3,
                        border: `1.5px solid ${isSelected ? style.text : T.border}`,
                        background: isSelected ? style.bg : "transparent",
                        color: isSelected ? style.text : T.textSubtle,
                        fontSize: 12,
                        fontWeight: isSelected ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 120ms",
                      }}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setEditingWorkflow(null)} style={{ padding: "6px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: "transparent", color: T.textSubtle, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!editName.trim()}
                style={{ padding: "6px 16px", borderRadius: 4, border: "none", background: editName.trim() ? T.brandBold : T.border, color: editName.trim() ? "#fff" : T.textSubtlest, fontSize: 13, fontWeight: 600, cursor: editName.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 150ms" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWorkflow && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.54)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={() => !deleteLoading && setDeletingWorkflow(null)}
        >
          <div
            style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(9,30,66,0.2)", width: 400, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>Delete Workflow</h2>
            <p style={{ fontSize: 13, color: T.textSubtle, margin: "0 0 20px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: T.text }}>{deletingWorkflow.name}</strong>?
              This will remove the workflow and all its nodes, edges, and scenarios.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setDeletingWorkflow(null)}
                disabled={deleteLoading}
                style={{ padding: "6px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: "transparent", color: T.textSubtle, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{ padding: "6px 16px", borderRadius: 4, border: "none", background: deleteLoading ? T.border : "#C9372C", color: "#fff", fontSize: 13, fontWeight: 600, cursor: deleteLoading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 150ms" }}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

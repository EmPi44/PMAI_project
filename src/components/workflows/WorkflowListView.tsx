"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/tokens";
import type { Workflow } from "./types";
import {
  createWorkflow,
  deleteWorkflow,
  updateWorkflow,
  updateWorkflowStatus,
  duplicateWorkflow,
} from "@/lib/supabase/workflows";

interface Props {
  workflows: Workflow[];
  projectId: string;
}

type WorkflowStatus = "active" | "draft" | "archived";
type SortKey = "name" | "updated" | "nodes" | "scenarios";
type SortDir = "asc" | "desc";

const STATUS_STYLE: Record<WorkflowStatus, { bg: string; text: string; label: string }> = {
  active:   { bg: "#DFFCF0", text: "#1F845A", label: "Active" },
  draft:    { bg: "#F1F2F4", text: "#44546F", label: "Draft" },
  archived: { bg: "#F1F2F4", text: "#626F86", label: "Archived" },
};

// Grid: checkbox | chevron | name | status | scenarios | nodes | updated | actions
const GRID = "36px 32px 1fr 96px 96px 72px 110px 168px";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Header cells ──────────────────────────────────────────────────────────────

function SortableHeader({
  children,
  align = "left",
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
}: {
  children: React.ReactNode;
  align?: "left" | "center";
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
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        color: isActive ? T.brandBold : T.textSubtlest,
        letterSpacing: "0.05em",
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

function StaticHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
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

// ── Inline input styles ────────────────────────────────────────────────────────

const inlineInputBase: React.CSSProperties = {
  width: "100%",
  background: T.brandSubtle,
  border: `1.5px solid ${T.brandBold}`,
  borderRadius: 3,
  padding: "2px 6px",
  fontSize: 14,
  fontWeight: 600,
  color: T.text,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

// ── WorkflowRow ────────────────────────────────────────────────────────────────

interface WorkflowRowProps {
  workflow: Workflow;
  selected: boolean;
  selectionActive: boolean;
  onToggleSelect: (id: string) => void;
  onMenuOpen: (id: string, rect: DOMRect) => void;
  onStatusClick: (id: string, rect: DOMRect) => void;
  onInlineUpdate: (id: string, patch: { name?: string; description?: string }) => void;
}

function WorkflowRow({
  workflow,
  selected,
  selectionActive,
  onToggleSelect,
  onMenuOpen,
  onStatusClick,
  onInlineUpdate,
}: WorkflowRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasScenarios = workflow.scenarios.length > 0;
  const status = STATUS_STYLE[workflow.status];

  // Inline name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(workflow.name);
  useEffect(() => { if (!editingName) setNameValue(workflow.name); }, [workflow.name, editingName]);

  // Inline description editing
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(workflow.description);
  useEffect(() => { if (!editingDesc) setDescValue(workflow.description); }, [workflow.description, editingDesc]);

  function commitName() {
    const val = nameValue.trim();
    if (val && val !== workflow.name) onInlineUpdate(workflow.id, { name: val });
    else setNameValue(workflow.name);
    setEditingName(false);
  }

  function commitDesc() {
    const val = descValue.trim();
    if (val !== workflow.description) onInlineUpdate(workflow.id, { description: val });
    setEditingDesc(false);
  }

  const isEditing = editingName || editingDesc;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          alignItems: "center",
          minHeight: 56,
          borderBottom: `1px solid ${T.border}`,
          background: selected ? `${T.brandBold}08` : T.surface,
          transition: "background 120ms",
          cursor: !isEditing && hasScenarios ? "pointer" : "default",
          outline: selected ? `1.5px solid ${T.brandBold}22` : "none",
          outlineOffset: -1,
        }}
        onClick={() => {
          if (isEditing) return;
          if (selectionActive) { onToggleSelect(workflow.id); return; }
          if (hasScenarios) setExpanded((e) => !e);
        }}
        onMouseEnter={(el) => { if (!selected) el.currentTarget.style.background = T.surfaceHovered; }}
        onMouseLeave={(el) => { el.currentTarget.style.background = selected ? `${T.brandBold}08` : T.surface; }}
      >
        {/* Checkbox */}
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(workflow.id)}
            style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.brandBold }}
          />
        </div>

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
        <div
          style={{ padding: "10px 8px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {editingName ? (
            <input
              value={nameValue}
              autoFocus
              style={inlineInputBase}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") { setNameValue(workflow.name); setEditingName(false); }
              }}
            />
          ) : (
            <div
              title="Click to rename"
              onClick={() => setEditingName(true)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: T.text,
                lineHeight: "20px",
                cursor: "text",
                borderRadius: 3,
                padding: "1px 3px",
                marginLeft: -3,
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {workflow.name}
            </div>
          )}

          {editingDesc ? (
            <input
              value={descValue}
              autoFocus
              style={{ ...inlineInputBase, fontSize: 12, fontWeight: 400, marginTop: 3 }}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={commitDesc}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") { setDescValue(workflow.description); setEditingDesc(false); }
              }}
            />
          ) : (
            <div
              title={workflow.description ? "Click to edit description" : "Click to add description"}
              onClick={() => setEditingDesc(true)}
              style={{
                fontSize: 12,
                color: workflow.description ? T.textSubtle : T.textSubtlest,
                lineHeight: "16px",
                marginTop: 2,
                cursor: "text",
                borderRadius: 3,
                padding: "1px 3px",
                marginLeft: -3,
                minHeight: 18,
                transition: "background 100ms",
                fontStyle: workflow.description ? "normal" : "italic",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {workflow.description || "Add description…"}
            </div>
          )}
        </div>

        {/* Status badge — click to change */}
        <div
          style={{ padding: "0 8px" }}
          onClick={(e) => {
            e.stopPropagation();
            onStatusClick(workflow.id, e.currentTarget.getBoundingClientRect());
          }}
        >
          <span
            title="Click to change status"
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
              cursor: "pointer",
              transition: "opacity 120ms",
              userSelect: "none",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            {status.label} ▾
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
            onClick={(e) => { e.stopPropagation(); onMenuOpen(workflow.id, e.currentTarget.getBoundingClientRect()); }}
            title="More actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 4,
              border: "1px solid transparent",
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
          <div />
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function modalInputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "7px 10px",
    borderRadius: 4,
    border: `2px solid ${focused ? T.brandBold : T.border}`,
    fontSize: 13,
    color: T.text,
    outline: "none",
    boxSizing: "border-box",
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

export function WorkflowListView({ workflows: initial, projectId }: Props) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>(initial);

  // List controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkflowStatus>("all");
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newNameFocused, setNewNameFocused] = useState(false);
  const [newDescFocused, setNewDescFocused] = useState(false);

  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fixed popups (position:fixed to escape overflow:hidden)
  const [activeMenu, setActiveMenu] = useState<{ id: string; top: number; right: number } | null>(null);
  const [statusPicker, setStatusPicker] = useState<{ id: string; top: number; left: number } | null>(null);

  // ── Sort ──────────────────────────────────────────────────────────────────
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

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const displayedWorkflows = useMemo(() => {
    let list = [...workflows];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") list = list.filter((w) => w.status === statusFilter);
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

  // ── Select all visible ────────────────────────────────────────────────────
  const allVisibleSelected =
    displayedWorkflows.length > 0 && displayedWorkflows.every((w) => selectedIds.has(w.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedWorkflows.map((w) => w.id)));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const id = await createWorkflow(projectId, name, newDesc.trim());
    setWorkflows((prev) => [
      { id, name, description: newDesc.trim(), status: "draft", updatedAt: new Date().toISOString().split("T")[0], nodes: [], edges: [], scenarios: [] },
      ...prev,
    ]);
    setCreateModalOpen(false);
    setNewName("");
    setNewDesc("");
    router.push(`/workflows/${id}`);
  }

  // ── Inline update (name / description) ───────────────────────────────────
  const handleInlineUpdate = useCallback(
    (id: string, patch: { name?: string; description?: string }) => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString().split("T")[0] } : w
        )
      );
      const wf = workflows.find((w) => w.id === id);
      if (!wf) return;
      updateWorkflow(
        id,
        patch.name ?? wf.name,
        patch.description ?? wf.description,
        wf.status
      ).catch(console.error);
    },
    [workflows]
  );

  // ── Inline status change (single) ─────────────────────────────────────────
  function handleStatusChange(id: string, status: WorkflowStatus) {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status, updatedAt: new Date().toISOString().split("T")[0] } : w))
    );
    updateWorkflowStatus(id, status).catch(console.error);
    setStatusPicker(null);
  }

  // ── Row context menu ──────────────────────────────────────────────────────
  const handleMenuOpen = useCallback((id: string, rect: DOMRect) => {
    setStatusPicker(null);
    setActiveMenu({ id, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  }, []);

  const handleStatusClick = useCallback((id: string, rect: DOMRect) => {
    setActiveMenu(null);
    setStatusPicker((prev) =>
      prev?.id === id ? null : { id, top: rect.bottom + 4, left: rect.left }
    );
  }, []);

  const menuWorkflow = activeMenu ? workflows.find((w) => w.id === activeMenu.id) : null;
  const statusPickerWorkflow = statusPicker ? workflows.find((w) => w.id === statusPicker.id) : null;

  // ── Duplicate ─────────────────────────────────────────────────────────────
  async function handleDuplicate(workflow: Workflow) {
    setActiveMenu(null);
    const newId = await duplicateWorkflow(workflow, projectId);
    setWorkflows((prev) => [
      { ...workflow, id: newId, name: `${workflow.name} (Copy)`, status: "draft", updatedAt: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
  }

  // ── Delete (single or bulk) ───────────────────────────────────────────────
  function openDeleteSingle(id: string) {
    setActiveMenu(null);
    setDeletingIds([id]);
  }

  function openDeleteBulk() {
    setDeletingIds([...selectedIds]);
  }

  async function confirmDelete() {
    setDeleteLoading(true);
    try {
      await Promise.all(deletingIds.map((id) => deleteWorkflow(id)));
      setWorkflows((prev) => prev.filter((w) => !deletingIds.includes(w.id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deletingIds.forEach((id) => next.delete(id));
        return next;
      });
      setDeletingIds([]);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Bulk status change ────────────────────────────────────────────────────
  async function bulkSetStatus(status: WorkflowStatus) {
    const ids = [...selectedIds];
    setWorkflows((prev) =>
      prev.map((w) =>
        ids.includes(w.id) ? { ...w, status, updatedAt: new Date().toISOString().split("T")[0] } : w
      )
    );
    await Promise.all(ids.map((id) => updateWorkflowStatus(id, status).catch(console.error)));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const selectionActive = someSelected;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", background: T.surfaceSunken }}>

      {/* Page header */}
      <div style={{ padding: "20px 24px 16px", background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, lineHeight: "28px" }}>Workflows</h1>
          <p style={{ fontSize: 13, color: T.textSubtle, margin: "4px 0 0" }}>
            Design and manage end-to-end process flows for customer discussions
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 4, border: "none", background: T.brandBold, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0, transition: "background 150ms" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.brandBoldHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = T.brandBold; }}
        >
          + New Workflow
        </button>
      </div>

      {/* Search + filter toolbar */}
      <div style={{ padding: "10px 24px", background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: "0 0 260px" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.textSubtlest, pointerEvents: "none" }}>⌕</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            style={{ width: "100%", padding: "6px 10px 6px 28px", borderRadius: 4, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: T.surface, transition: "border-color 150ms" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {(["all", "draft", "active", "archived"] as const).map((f) => {
            const isActive = statusFilter === f;
            const label = f === "all" ? "All" : STATUS_STYLE[f].label;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{ padding: "4px 10px", borderRadius: 3, border: `1.5px solid ${isActive ? T.brandBold : T.border}`, background: isActive ? T.brandSubtle : "transparent", color: isActive ? T.brandBold : T.textSubtle, fontSize: 12, fontWeight: isActive ? 600 : 400, cursor: "pointer", transition: "all 120ms", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.color = T.text; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSubtle; } }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: 12, color: T.textSubtlest, marginLeft: "auto" }}>
          {displayedWorkflows.length} workflow{displayedWorkflows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, padding: "16px 24px" }}>
        <div style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, overflow: "hidden" }}>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: GRID, alignItems: "center", height: 36, borderBottom: `1px solid ${T.border}`, background: T.surfaceSunken }}>
            {/* Select-all checkbox */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected && !allVisibleSelected; }}
                onChange={toggleSelectAll}
                style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.brandBold }}
                title={allVisibleSelected ? "Deselect all" : "Select all"}
              />
            </div>
            <div />
            <SortableHeader sortKey="name" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort}>WORKFLOW</SortableHeader>
            <StaticHeader>STATUS</StaticHeader>
            <SortableHeader sortKey="scenarios" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort} align="center">SCENARIOS</SortableHeader>
            <SortableHeader sortKey="nodes" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort} align="center">NODES</SortableHeader>
            <SortableHeader sortKey="updated" activeSortKey={sortBy} sortDir={sortDir} onSort={handleSort}>UPDATED</SortableHeader>
            <div />
          </div>

          {/* Rows */}
          {displayedWorkflows.map((w) => (
            <WorkflowRow
              key={w.id}
              workflow={w}
              selected={selectedIds.has(w.id)}
              selectionActive={selectionActive}
              onToggleSelect={toggleSelectOne}
              onMenuOpen={handleMenuOpen}
              onStatusClick={handleStatusClick}
              onInlineUpdate={handleInlineUpdate}
            />
          ))}

          {workflows.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: T.textSubtlest, fontSize: 14 }}>No workflows yet</div>
          )}
          {workflows.length > 0 && displayedWorkflows.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: T.textSubtlest, fontSize: 14 }}>No workflows match your search</div>
          )}
        </div>
      </div>

      {/* ── Fixed overlays ───────────────────────────────────────────────────── */}

      {/* Global click-away for popups */}
      {(activeMenu || statusPicker) && (
        <div
          onClick={() => { setActiveMenu(null); setStatusPicker(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 98 }}
        />
      )}

      {/* Row context menu */}
      {activeMenu && menuWorkflow && (
        <div style={{ position: "fixed", top: activeMenu.top, right: activeMenu.right, zIndex: 99, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, boxShadow: "0 4px 16px rgba(9,30,66,0.18)", minWidth: 168, overflow: "hidden" }}>
          {[
            { label: "Duplicate", icon: "⧉", action: () => handleDuplicate(menuWorkflow) },
            { label: "Delete", icon: "✕", action: () => openDeleteSingle(menuWorkflow.id), danger: true },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: item.danger ? "#C9372C" : T.text, textAlign: "left", transition: "background 100ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = item.danger ? "#FFF0EE" : T.surfaceHovered; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              <span style={{ fontSize: 12, opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Status picker popup */}
      {statusPicker && statusPickerWorkflow && (
        <div style={{ position: "fixed", top: statusPicker.top, left: statusPicker.left, zIndex: 99, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, boxShadow: "0 4px 16px rgba(9,30,66,0.18)", overflow: "hidden", minWidth: 130 }}>
          {(["draft", "active", "archived"] as WorkflowStatus[]).map((s) => {
            const st = STATUS_STYLE[s];
            const isCurrent = statusPickerWorkflow.status === s;
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(statusPicker.id, s)}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: isCurrent ? T.surfaceHovered : "none", border: "none", cursor: "pointer", fontSize: 12, color: T.text, textAlign: "left", transition: "background 100ms", fontWeight: isCurrent ? 600 : 400 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isCurrent ? T.surfaceHovered : "none"; }}
              >
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: st.text, flexShrink: 0 }} />
                {st.label}
                {isCurrent && <span style={{ marginLeft: "auto", fontSize: 10, color: T.textSubtlest }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Bulk action bar ──────────────────────────────────────────────────── */}
      {someSelected && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "#1D2125",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(9,30,66,0.32)",
            whiteSpace: "nowrap",
          }}
        >
          {/* Count */}
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginRight: 4 }}>
            {selectedIds.size} selected
          </span>

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />

          {/* Set status label */}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Set status:</span>

          {(["draft", "active", "archived"] as WorkflowStatus[]).map((s) => {
            const st = STATUS_STYLE[s];
            return (
              <button
                key={s}
                onClick={() => bulkSetStatus(s)}
                style={{ padding: "4px 10px", borderRadius: 3, border: `1.5px solid ${st.text}40`, background: `${st.text}15`, color: st.text, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 120ms" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${st.text}30`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${st.text}15`; }}
              >
                {st.label}
              </button>
            );
          })}

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />

          {/* Bulk delete */}
          <button
            onClick={openDeleteBulk}
            style={{ padding: "4px 12px", borderRadius: 3, border: "1.5px solid #C9372C60", background: "#C9372C20", color: "#FF8F73", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 120ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#C9372C35"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#C9372C20"; }}
          >
            ✕ Delete {selectedIds.size}
          </button>

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />

          {/* Deselect */}
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{ padding: "4px 8px", borderRadius: 3, border: "none", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", transition: "color 120ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            title="Deselect all"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* Create */}
      {createModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.54)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => setCreateModalOpen(false)}>
          <div style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(9,30,66,0.2)", width: 440, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 16px" }}>New Workflow</h2>
            <label style={{ display: "block", marginBottom: 14 }}>
              <FieldLabel>NAME *</FieldLabel>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) handleCreate(); if (e.key === "Escape") setCreateModalOpen(false); }} autoFocus placeholder="e.g. Customer Onboarding" style={modalInputStyle(newNameFocused)} onFocus={() => setNewNameFocused(true)} onBlur={() => setNewNameFocused(false)} />
            </label>
            <label style={{ display: "block", marginBottom: 20 }}>
              <FieldLabel>DESCRIPTION</FieldLabel>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} placeholder="Short description of this workflow…" style={{ ...modalInputStyle(newDescFocused), resize: "vertical" }} onFocus={() => setNewDescFocused(true)} onBlur={() => setNewDescFocused(false)} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setCreateModalOpen(false)} style={{ padding: "6px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: "transparent", color: T.textSubtle, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleCreate} disabled={!newName.trim()} style={{ padding: "6px 16px", borderRadius: 4, border: "none", background: newName.trim() ? T.brandBold : T.border, color: newName.trim() ? "#fff" : T.textSubtlest, fontSize: 13, fontWeight: 600, cursor: newName.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 150ms" }}>
                Create &amp; Open Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingIds.length > 0 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.54)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => { if (!deleteLoading) setDeletingIds([]); }}>
          <div style={{ background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(9,30,66,0.2)", width: 400, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
              {deletingIds.length === 1 ? "Delete Workflow" : `Delete ${deletingIds.length} Workflows`}
            </h2>
            <p style={{ fontSize: 13, color: T.textSubtle, margin: "0 0 20px", lineHeight: 1.6 }}>
              {deletingIds.length === 1 ? (
                <>Are you sure you want to delete <strong style={{ color: T.text }}>{workflows.find((w) => w.id === deletingIds[0])?.name}</strong>?</>
              ) : (
                <>Are you sure you want to delete <strong style={{ color: T.text }}>{deletingIds.length} workflows</strong>?</>
              )}
              {" "}This will remove all nodes, edges, and scenarios.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setDeletingIds([])} disabled={deleteLoading} style={{ padding: "6px 14px", borderRadius: 4, border: `1px solid ${T.border}`, background: "transparent", color: T.textSubtle, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleteLoading} style={{ padding: "6px 16px", borderRadius: 4, border: "none", background: deleteLoading ? T.border : "#C9372C", color: "#fff", fontSize: 13, fontWeight: 600, cursor: deleteLoading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 150ms" }}>
                {deleteLoading ? "Deleting..." : `Delete${deletingIds.length > 1 ? ` ${deletingIds.length}` : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { T, FONT_STACK } from "@/lib/tokens";
import {
  useRequirements,
  useCreateRequirement,
  useUpdateRequirement,
  useDeleteRequirement,
} from "@/domains/requirements";
import type {
  Requirement,
  RequirementType,
  RequirementStatus,
  RequirementPriority,
  NFRCategory,
  CreateRequirementDTO,
  UpdateRequirementDTO,
} from "@/domains/requirements";

// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_ID = "default";

const TYPE_STYLES: Record<RequirementType, { bg: string; text: string; label: string }> = {
  functional:     { bg: "#E9F2FF", text: "#0C66E4", label: "Functional" },
  "non-functional": { bg: "#F3F0FF", text: "#5E4DB2", label: "Non-Functional" },
};

const STATUS_STYLES: Record<RequirementStatus, { bg: string; text: string; label: string }> = {
  draft:      { bg: "#F1F2F4", text: "#44546F",  label: "Draft" },
  proposed:   { bg: "#E9F2FF", text: "#0C66E4",  label: "Proposed" },
  approved:   { bg: "#DFFCF0", text: "#1F845A",  label: "Approved" },
  rejected:   { bg: "#FFECEB", text: "#C9372C",  label: "Rejected" },
  deprecated: { bg: "#F1F2F4", text: "#626F86",  label: "Deprecated" },
};

const PRIORITY_STYLES: Record<RequirementPriority, { bg: string; text: string; label: string }> = {
  critical: { bg: "#FFECEB", text: "#C9372C", label: "Critical" },
  high:     { bg: "#FFF7D6", text: "#974F0C", label: "High" },
  medium:   { bg: "#E9F2FF", text: "#0C66E4", label: "Medium" },
  low:      { bg: "#F1F2F4", text: "#44546F", label: "Low" },
};

const NFR_CATEGORY_META: Record<NFRCategory, { label: string; icon: string }> = {
  performance:     { label: "Performance",     icon: "⚡" },
  security:        { label: "Security",        icon: "🔒" },
  reliability:     { label: "Reliability",     icon: "🛡️" },
  scalability:     { label: "Scalability",     icon: "📈" },
  usability:       { label: "Usability",       icon: "👥" },
  maintainability: { label: "Maintainability", icon: "🔧" },
  compliance:      { label: "Compliance",      icon: "⚖️" },
  compatibility:   { label: "Compatibility",   icon: "🔌" },
};

const NFR_CATEGORIES = Object.keys(NFR_CATEGORY_META) as NFRCategory[];
const STATUSES = Object.keys(STATUS_STYLES) as RequirementStatus[];
const PRIORITIES = Object.keys(PRIORITY_STYLES) as RequirementPriority[];
const TYPES: RequirementType[] = ["functional", "non-functional"];

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveTab = "all" | RequirementType;

interface RowDraft {
  type: RequirementType;
  title: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  category: NFRCategory | "";
  author: string;
}

function emptyDraft(tab: ActiveTab): RowDraft {
  const type: RequirementType = tab === "all" ? "functional" : tab;
  return { type, title: "", priority: "medium", status: "draft", category: "", author: "" };
}

function reqToDraft(req: Requirement): RowDraft {
  return {
    type: req.type,
    title: req.title,
    priority: req.priority,
    status: req.status,
    category: req.category ?? "",
    author: req.author ?? "",
  };
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const cellInput: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderBottom: `1px solid ${T.brandBold}`,
  borderRadius: 0,
  padding: "2px 4px",
  fontSize: 13,
  color: T.text,
  fontFamily: FONT_STACK,
  background: "transparent",
  outline: "none",
};

const cellSelect: React.CSSProperties = { ...cellInput, cursor: "pointer" };

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ bg, text, label }: { bg: string; text: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 7px", borderRadius: 3,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase",
      background: bg, color: text, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Edit row ──────────────────────────────────────────────────────────────────

interface EditRowProps {
  draft: RowDraft;
  onChange: (d: RowDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  reqId?: string;
}

function EditRow({ draft, onChange, onSave, onCancel, reqId }: EditRowProps) {
  function set<K extends keyof RowDraft>(key: K, val: RowDraft[K]) {
    onChange({ ...draft, [key]: val });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); if (draft.title.trim()) onSave(); }
    if (e.key === "Escape") onCancel();
  }

  const isNFR = draft.type === "non-functional";

  return (
    <tr style={{ background: "#EEF4FF" }}>
      {/* ID */}
      <td style={{ padding: "6px 12px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.textSubtlest, fontFamily: "ui-monospace, monospace" }}>
          {reqId ?? "—"}
        </span>
      </td>

      {/* Type */}
      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <select
          value={draft.type}
          onChange={(e) => {
            const t = e.target.value as RequirementType;
            set("type", t);
            if (t === "functional") set("category", "");
          }}
          onKeyDown={handleKeyDown}
          style={cellSelect}
        >
          {TYPES.map((t) => <option key={t} value={t}>{TYPE_STYLES[t].label}</option>)}
        </select>
      </td>

      {/* Title */}
      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <input
          autoFocus
          placeholder="Requirement title..."
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          onKeyDown={handleKeyDown}
          style={cellInput}
        />
      </td>

      {/* Category */}
      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        {isNFR ? (
          <select value={draft.category} onChange={(e) => set("category", e.target.value as NFRCategory)} onKeyDown={handleKeyDown} style={cellSelect}>
            <option value="">— none —</option>
            {NFR_CATEGORIES.map((c) => (
              <option key={c} value={c}>{NFR_CATEGORY_META[c].icon} {NFR_CATEGORY_META[c].label}</option>
            ))}
          </select>
        ) : (
          <span style={{ fontSize: 12, color: T.textSubtlest }}>—</span>
        )}
      </td>

      {/* Priority */}
      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <select value={draft.priority} onChange={(e) => set("priority", e.target.value as RequirementPriority)} onKeyDown={handleKeyDown} style={cellSelect}>
          {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_STYLES[p].label}</option>)}
        </select>
      </td>

      {/* Status */}
      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <select value={draft.status} onChange={(e) => set("status", e.target.value as RequirementStatus)} onKeyDown={handleKeyDown} style={cellSelect}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
        </select>
      </td>

      {/* Author */}
      <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <input
          placeholder="Author"
          value={draft.author}
          onChange={(e) => set("author", e.target.value)}
          onKeyDown={handleKeyDown}
          style={cellInput}
        />
      </td>

      {/* Actions */}
      <td style={{ padding: "6px 8px", textAlign: "right", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <button onClick={() => { if (draft.title.trim()) onSave(); }} title="Save (Enter)"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#1F845A", fontSize: 16, padding: "0 4px" }}>
          ✓
        </button>
        <button onClick={onCancel} title="Cancel (Esc)"
          style={{ background: "none", border: "none", cursor: "pointer", color: T.textSubtlest, fontSize: 16, padding: "0 4px" }}>
          ✕
        </button>
      </td>
    </tr>
  );
}

// ── Display row ───────────────────────────────────────────────────────────────

interface DisplayRowProps {
  req: Requirement;
  onEdit: () => void;
  onDelete: () => void;
}

function DisplayRow({ req, onEdit, onDelete }: DisplayRowProps) {
  const [hovered, setHovered] = useState(false);
  const type = TYPE_STYLES[req.type];
  const status = STATUS_STYLES[req.status];
  const priority = PRIORITY_STYLES[req.priority];

  return (
    <tr
      style={{ background: hovered ? T.surfaceHovered : T.surface, cursor: "pointer", transition: "background 100ms" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onEdit}
    >
      <td style={{ padding: "9px 12px", borderBottom: `1px solid ${T.borderSubtle}`, fontSize: 12, fontWeight: 700, color: T.brandBold, fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>
        {req.reqId}
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <Badge bg={type.bg} text={type.text} label={type.label} />
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.borderSubtle}`, fontSize: 13, color: T.text }}>
        {req.title}
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.borderSubtle}`, fontSize: 12, color: T.textSubtle }}>
        {req.category
          ? `${NFR_CATEGORY_META[req.category].icon} ${NFR_CATEGORY_META[req.category].label}`
          : <span style={{ color: T.textSubtlest }}>—</span>}
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <Badge bg={priority.bg} text={priority.text} label={priority.label} />
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.borderSubtle}` }}>
        <Badge bg={status.bg} text={status.text} label={status.label} />
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.borderSubtle}`, fontSize: 12, color: T.textSubtle }}>
        {req.author || <span style={{ color: T.textSubtlest }}>—</span>}
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.borderSubtle}`, textAlign: "right" }}>
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${req.title}"?`)) onDelete(); }}
            title="Delete"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#C9372C", fontSize: 14, padding: 0, lineHeight: 1 }}
          >
            🗑
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function RequirementsView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<RowDraft>(emptyDraft("all"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<RowDraft>(emptyDraft("all"));
  const [search, setSearch] = useState("");

  const { data: all = [], isLoading } = useRequirements(PROJECT_ID);
  const createMutation = useCreateRequirement();
  const updateMutation = useUpdateRequirement();
  const deleteMutation = useDeleteRequirement();

  const frCount  = all.filter((r) => r.type === "functional").length;
  const nfrCount = all.filter((r) => r.type === "non-functional").length;

  const filtered = all
    .filter((r) => activeTab === "all" || r.type === activeTab)
    .filter((r) => !search
      || r.title.toLowerCase().includes(search.toLowerCase())
      || r.reqId.toLowerCase().includes(search.toLowerCase()));

  function switchTab(tab: ActiveTab) {
    setActiveTab(tab);
    setAdding(false);
    setEditingId(null);
    setNewDraft(emptyDraft(tab));
  }

  async function handleCreate() {
    if (!newDraft.title.trim()) return;
    const dto: CreateRequirementDTO = {
      projectId: PROJECT_ID,
      type: newDraft.type,
      title: newDraft.title.trim(),
      priority: newDraft.priority,
      status: newDraft.status,
      category: (newDraft.category as NFRCategory) || undefined,
      author: newDraft.author || undefined,
    };
    await createMutation.mutateAsync(dto);
    setNewDraft(emptyDraft(activeTab));
    setAdding(false);
  }

  function startEdit(req: Requirement) {
    setEditingId(req.id);
    setEditDraft(reqToDraft(req));
    setAdding(false);
  }

  async function handleSaveEdit() {
    if (!editingId || !editDraft.title.trim()) return;
    const dto: UpdateRequirementDTO = {
      title: editDraft.title.trim(),
      priority: editDraft.priority,
      status: editDraft.status,
      category: (editDraft.category as NFRCategory) || undefined,
      author: editDraft.author || undefined,
    };
    await updateMutation.mutateAsync({ id: editingId, dto });
    setEditingId(null);
  }

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    { key: "all",              label: "All",            count: all.length },
    { key: "functional",       label: "Functional",     count: frCount },
    { key: "non-functional",   label: "Non-Functional", count: nfrCount },
  ];

  const thStyle: React.CSSProperties = {
    padding: "7px 8px", textAlign: "left",
    fontSize: 11, fontWeight: 600, color: T.textSubtlest,
    letterSpacing: "0.05em", textTransform: "uppercase",
    background: T.surfaceSunken, borderBottom: `1px solid ${T.border}`,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT_STACK, background: T.surfaceSunken }}>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>Requirements</h1>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: T.textSubtle }}>
            Click a row to edit inline. Press Enter to save, Esc to cancel.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {tabs.map(({ key, label, count }) => {
            const isActive = activeTab === key;
            return (
              <button key={key} onClick={() => switchTab(key)} style={{
                padding: "8px 16px", border: "none",
                borderBottom: isActive ? `2px solid ${T.brandBold}` : "2px solid transparent",
                background: "transparent", color: isActive ? T.brandBold : T.textSubtle,
                fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer", fontFamily: FONT_STACK,
                display: "flex", alignItems: "center", gap: 6, marginBottom: -1,
              }}>
                {label}
                <span style={{
                  padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                  background: isActive ? T.brandSubtle : T.surfaceSunken,
                  color: isActive ? T.brandBold : T.textSubtlest,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 24px", background: T.surface, borderBottom: `1px solid ${T.borderSubtle}`, flexShrink: 0 }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200, border: `1px solid ${T.border}`, borderRadius: 4, padding: "5px 10px", fontSize: 13, color: T.text, fontFamily: FONT_STACK, outline: "none", background: T.surface }}
          onFocus={(e) => { e.currentTarget.style.borderColor = T.brandBold; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
        />
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: T.textSubtlest, fontSize: 13 }}>Loading...</div>
        ) : (
          <div style={{ background: T.surface, borderRadius: 6, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 80 }} />
                <col style={{ width: 130 }} />
                <col />
                <col style={{ width: 150 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 40 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...thStyle, paddingLeft: 12 }}>ID</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Author</th>
                  <th style={thStyle} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && !adding && (
                  <tr>
                    <td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: T.textSubtlest, fontSize: 13 }}>
                      No requirements yet. Click &ldquo;+ Add row&rdquo; below to start.
                    </td>
                  </tr>
                )}

                {filtered.map((req) =>
                  editingId === req.id ? (
                    <EditRow
                      key={req.id}
                      draft={editDraft}
                      onChange={setEditDraft}
                      onSave={handleSaveEdit}
                      onCancel={() => setEditingId(null)}
                      reqId={req.reqId}
                    />
                  ) : (
                    <DisplayRow
                      key={req.id}
                      req={req}
                      onEdit={() => startEdit(req)}
                      onDelete={() => deleteMutation.mutate(req.id)}
                    />
                  )
                )}

                {adding && (
                  <EditRow
                    draft={newDraft}
                    onChange={setNewDraft}
                    onSave={handleCreate}
                    onCancel={() => { setAdding(false); setNewDraft(emptyDraft(activeTab)); }}
                  />
                )}
              </tbody>
            </table>

            {!adding && (
              <button
                onClick={() => { setNewDraft(emptyDraft(activeTab)); setAdding(true); setEditingId(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  width: "100%", padding: "9px 12px", border: "none",
                  borderTop: filtered.length > 0 || adding ? `1px solid ${T.borderSubtle}` : "none",
                  background: "transparent", color: T.textSubtlest,
                  fontSize: 13, cursor: "pointer", fontFamily: FONT_STACK, textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHovered; e.currentTarget.style.color = T.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSubtlest; }}
              >
                + Add row
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

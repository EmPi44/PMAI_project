"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { T, FONT_STACK } from "@/lib/tokens";
import { getProjectSync } from "@/domains/projects/services";
import type { ProjectCharter, Objective, Milestone, Stakeholder, StakeholderType, InfluenceLevel } from "@/domains/projects/types";

// ─── Inline edit helpers ────────────────────────────────────────────────────

function EditableText({
  value,
  onChange,
  placeholder = "Click to edit…",
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  function save() { setEditing(false); onChange(draft); }

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        style={{
          fontFamily: FONT_STACK,
          fontSize: "inherit",
          fontWeight: "inherit",
          color: T.text,
          background: T.brandSubtle,
          border: `1.5px solid ${T.borderFocused}`,
          borderRadius: 4,
          padding: "1px 6px",
          outline: "none",
          width: "100%",
          ...style,
        }}
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
      style={{
        cursor: "text",
        borderRadius: 4,
        padding: "1px 2px",
        transition: "background 120ms",
        display: "inline-block",
        ...style,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = T.surfaceHovered; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {value || <span style={{ color: T.textDisabled }}>{placeholder}</span>}
    </span>
  );
}

function EditableTextarea({
  value,
  onChange,
  placeholder = "Click to edit…",
  minRows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [editing]);

  function save() { setEditing(false); onChange(draft); }

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        rows={minRows}
        style={{
          fontFamily: FONT_STACK,
          fontSize: 14,
          lineHeight: "22px",
          color: T.text,
          background: T.brandSubtle,
          border: `1.5px solid ${T.borderFocused}`,
          borderRadius: 6,
          padding: "8px 10px",
          outline: "none",
          width: "100%",
          resize: "none",
          overflow: "hidden",
        }}
      />
    );
  }

  return (
    <p
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
      style={{
        fontSize: 14,
        lineHeight: "22px",
        color: value ? T.text : T.textDisabled,
        cursor: "text",
        margin: 0,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1.5px solid transparent",
        transition: "background 120ms, border-color 120ms",
        whiteSpace: "pre-wrap",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = T.surfaceHovered;
        (e.currentTarget as HTMLElement).style.borderColor = T.border;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
      }}
    >
      {value || placeholder}
    </p>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────

const STATUS_CYCLE: ProjectCharter["status"][] = ["on-track", "at-risk", "off-track", "planning"];

const STATUS_LABEL: Record<ProjectCharter["status"], string> = {
  "on-track":  "On Track",
  "at-risk":   "At Risk",
  "off-track": "Off Track",
  "planning":  "Planning",
};

const STATUS_STYLE: Record<ProjectCharter["status"], { bg: string; text: string }> = {
  "on-track":  { bg: T.bgSuccessSubtle, text: T.textSuccess },
  "at-risk":   { bg: T.bgWarningSubtle, text: T.textWarning },
  "off-track": { bg: T.bgDangerSubtle,  text: T.textDanger },
  "planning":  { bg: T.bgNeutral,       text: T.textSubtle },
};

function StatusBadge({
  status,
  onChange,
}: {
  status: ProjectCharter["status"];
  onChange: (s: ProjectCharter["status"]) => void;
}) {
  function cycle() {
    const idx = STATUS_CYCLE.indexOf(status);
    onChange(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  }
  const s = STATUS_STYLE[status];
  return (
    <button
      onClick={cycle}
      title="Click to change status"
      style={{
        background: s.bg,
        color: s.text,
        border: "none",
        borderRadius: 3,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: FONT_STACK,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "opacity 120ms",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
    >
      {STATUS_LABEL[status]}
    </button>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: T.textSubtlest,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: 8,
        padding: "20px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Editable list ───────────────────────────────────────────────────────────

function EditableList({
  items,
  onChange,
  addPlaceholder,
  accentColor,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  addPlaceholder: string;
  accentColor: string;
}) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (adding) addRef.current?.focus(); }, [adding]);

  function commitAdd() {
    if (newItem.trim()) onChange([...items, newItem.trim()]);
    setNewItem("");
    setAdding(false);
  }

  function updateItem(idx: number, val: string) {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item, idx) => (
        <ListItemRow
          key={idx}
          value={item}
          onChange={(v) => updateItem(idx, v)}
          onDelete={() => removeItem(idx)}
          accentColor={accentColor}
        />
      ))}

      {adding ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
          <input
            ref={addRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onBlur={commitAdd}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAdd();
              if (e.key === "Escape") { setAdding(false); setNewItem(""); }
            }}
            placeholder={addPlaceholder}
            style={{
              flex: 1,
              fontFamily: FONT_STACK,
              fontSize: 13,
              color: T.text,
              background: T.brandSubtle,
              border: `1.5px solid ${T.borderFocused}`,
              borderRadius: 4,
              padding: "3px 8px",
              outline: "none",
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.textSubtlest,
            fontSize: 12,
            fontFamily: FONT_STACK,
            padding: "4px 0",
            marginTop: 2,
            transition: "color 120ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.brandText; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add item
        </button>
      )}
    </div>
  );
}

function ListItemRow({
  value,
  onChange,
  onDelete,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  onDelete: () => void;
  accentColor: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  function save() { setEditing(false); onChange(draft); }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "3px 0",
        borderRadius: 4,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: accentColor,
          flexShrink: 0,
          marginLeft: 3,
        }}
      />
      {editing ? (
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          style={{
            flex: 1,
            fontFamily: FONT_STACK,
            fontSize: 13,
            color: T.text,
            background: T.brandSubtle,
            border: `1.5px solid ${T.borderFocused}`,
            borderRadius: 4,
            padding: "2px 6px",
            outline: "none",
          }}
        />
      ) : (
        <span
          onClick={() => { setDraft(value); setEditing(true); }}
          style={{ flex: 1, fontSize: 13, color: T.text, cursor: "text" }}
        >
          {value}
        </span>
      )}
      {hovered && !editing && (
        <button
          onClick={onDelete}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.textSubtlest,
            fontSize: 15,
            lineHeight: 1,
            padding: "0 2px",
            borderRadius: 3,
            transition: "color 120ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.textDanger; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
          title="Remove"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── Objective row ────────────────────────────────────────────────────────────

function ObjectiveRow({
  obj,
  onChange,
  onDelete,
}: {
  obj: Objective;
  onChange: (o: Objective) => void;
  onDelete: () => void;
}) {
  const [editingText, setEditingText] = useState(false);
  const [draft, setDraft] = useState(obj.text);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingText) ref.current?.focus(); }, [editingText]);

  function saveText() { setEditingText(false); onChange({ ...obj, text: draft }); }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0", borderBottom: `1px solid ${T.borderSubtle}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.brandBold, flexShrink: 0 }} />
        {editingText ? (
          <input
            ref={ref}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveText}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveText();
              if (e.key === "Escape") { setDraft(obj.text); setEditingText(false); }
            }}
            style={{
              flex: 1,
              fontFamily: FONT_STACK,
              fontSize: 13,
              color: T.text,
              background: T.brandSubtle,
              border: `1.5px solid ${T.borderFocused}`,
              borderRadius: 4,
              padding: "2px 6px",
              outline: "none",
            }}
          />
        ) : (
          <span
            onClick={() => { setDraft(obj.text); setEditingText(true); }}
            style={{ flex: 1, fontSize: 13, color: T.text, cursor: "text" }}
          >
            {obj.text}
          </span>
        )}
        {hovered && (
          <button
            onClick={onDelete}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: T.textSubtlest, fontSize: 15, lineHeight: 1,
              padding: "0 2px", borderRadius: 3, transition: "color 120ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.textDanger; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
            title="Remove"
          >×</button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 16 }}>
        <div style={{ flex: 1, height: 6, background: T.surfacePressed, borderRadius: 99, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${obj.progress}%`,
              background: obj.progress >= 80 ? T.bgSuccessBold : obj.progress >= 40 ? T.brandBold : T.bgWarningBold,
              borderRadius: 99,
              transition: "width 300ms ease",
            }}
          />
        </div>
        <input
          type="number"
          min={0}
          max={100}
          value={obj.progress}
          onChange={(e) => onChange({ ...obj, progress: Math.min(100, Math.max(0, Number(e.target.value))) })}
          style={{
            width: 44,
            fontFamily: FONT_STACK,
            fontSize: 11,
            fontWeight: 600,
            color: T.textSubtle,
            background: "transparent",
            border: "none",
            outline: "none",
            textAlign: "right",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: 11, color: T.textSubtlest }}>%</span>
      </div>
    </div>
  );
}

// ─── Milestone row ────────────────────────────────────────────────────────────

const MILESTONE_STATUS_CYCLE: Milestone["status"][] = ["upcoming", "in-progress", "completed"];

const MILESTONE_STYLE: Record<Milestone["status"], { dot: string; label: string; labelColor: string }> = {
  completed:   { dot: T.bgSuccessBold, label: "Completed",   labelColor: T.textSuccess },
  "in-progress": { dot: T.brandBold,   label: "In Progress", labelColor: T.textInfo },
  upcoming:    { dot: T.borderBold,    label: "Upcoming",    labelColor: T.textSubtlest },
};

function MilestoneRow({
  milestone,
  onChange,
  onDelete,
  isLast,
}: {
  milestone: Milestone;
  onChange: (m: Milestone) => void;
  onDelete: () => void;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const s = MILESTONE_STYLE[milestone.status];

  function cycleStatus() {
    const idx = MILESTONE_STATUS_CYCLE.indexOf(milestone.status);
    onChange({ ...milestone, status: MILESTONE_STATUS_CYCLE[(idx + 1) % MILESTONE_STATUS_CYCLE.length] });
  }

  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Timeline line */}
      {!isLast && (
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 20,
            bottom: -16,
            width: 1,
            background: T.border,
          }}
        />
      )}
      {/* Dot */}
      <button
        onClick={cycleStatus}
        title="Click to change status"
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: s.dot,
          border: `2px solid ${milestone.status === "upcoming" ? T.border : s.dot}`,
          flexShrink: 0,
          marginTop: 2,
          cursor: "pointer",
          transition: "background 150ms",
          zIndex: 1,
        }}
      />
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <EditableText
            value={milestone.name}
            onChange={(v) => onChange({ ...milestone, name: v })}
            style={{ fontSize: 13, fontWeight: 600, color: T.text }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: s.labelColor,
              cursor: "pointer",
            }}
            onClick={cycleStatus}
          >
            {s.label}
          </span>
          {hovered && (
            <button
              onClick={onDelete}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: T.textSubtlest, fontSize: 15, lineHeight: 1,
                padding: "0 2px", borderRadius: 3, marginLeft: "auto", transition: "color 120ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.textDanger; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
              title="Remove"
            >×</button>
          )}
        </div>
        <EditableText
          value={milestone.date}
          onChange={(v) => onChange({ ...milestone, date: v })}
          style={{ fontSize: 11, color: T.textSubtlest }}
          placeholder="Add date…"
        />
      </div>
    </div>
  );
}

// ─── Project type selector ───────────────────────────────────────────────────

type ProjectType = "greenfield" | "migration" | "enhancement";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  greenfield:  "Greenfield",
  migration:   "Migration",
  enhancement: "Enhancement",
};

function ProjectTypeSelector({
  value,
  onChange,
}: {
  value: ProjectType;
  onChange: (v: ProjectType) => void;
}) {
  const types: ProjectType[] = ["greenfield", "migration", "enhancement"];
  return (
    <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", border: `1px solid ${T.border}`, width: "fit-content" }}>
      {types.map((type, i) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          style={{
            padding: "4px 14px",
            fontSize: 12,
            fontWeight: value === type ? 600 : 400,
            fontFamily: FONT_STACK,
            background: value === type ? T.brandBold : T.surface,
            color: value === type ? "#fff" : T.textSubtle,
            border: "none",
            borderRight: i < types.length - 1 ? `1px solid ${T.border}` : "none",
            cursor: "pointer",
            transition: "background 150ms, color 150ms",
          }}
        >
          {PROJECT_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}

// ─── Stakeholder card ─────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#0C66E4", "#6554C0", "#00875A", "#E56910", "#AE2E24", "#0055CC"];

const STAKEHOLDER_TYPES: StakeholderType[] = ["internal", "external", "sponsor", "user"];
const TYPE_STYLE: Record<StakeholderType, { bg: string; text: string; label: string }> = {
  internal: { bg: T.bgInfoSubtle,    text: T.textInfo,    label: "Internal" },
  external: { bg: "#EFE8FF",         text: "#5E4DB2",     label: "External" },
  sponsor:  { bg: T.bgWarningSubtle, text: T.textWarning, label: "Sponsor"  },
  user:     { bg: T.bgSuccessSubtle, text: T.textSuccess, label: "User"     },
};

const INFLUENCE_LEVELS: InfluenceLevel[] = ["high", "medium", "low"];
const INFLUENCE_STYLE: Record<InfluenceLevel, { color: string; label: string }> = {
  high:   { color: T.textDanger,   label: "High"   },
  medium: { color: T.textWarning,  label: "Medium" },
  low:    { color: T.textSubtlest, label: "Low"    },
};

function StakeholderCard({
  stakeholder,
  colorIndex,
  onChange,
  onDelete,
}: {
  stakeholder: Stakeholder;
  colorIndex: number;
  onChange: (s: Stakeholder) => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const initials = stakeholder.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();
  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  function cycleType() {
    const idx = STAKEHOLDER_TYPES.indexOf(stakeholder.type);
    onChange({ ...stakeholder, type: STAKEHOLDER_TYPES[(idx + 1) % STAKEHOLDER_TYPES.length] });
  }

  function cycleInfluence() {
    const idx = INFLUENCE_LEVELS.indexOf(stakeholder.influence);
    onChange({ ...stakeholder, influence: INFLUENCE_LEVELS[(idx + 1) % INFLUENCE_LEVELS.length] });
  }

  const ts = TYPE_STYLE[stakeholder.type];
  const inf = INFLUENCE_STYLE[stakeholder.influence];

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: 8,
        padding: "14px 16px",
        position: "relative",
        transition: "box-shadow 150ms",
        boxShadow: hovered ? "0 2px 8px rgba(9,30,66,0.08)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <button
          onClick={onDelete}
          style={{
            position: "absolute", top: 8, right: 8,
            background: "none", border: "none", cursor: "pointer",
            color: T.textSubtlest, fontSize: 16, lineHeight: 1,
            padding: "0 4px", borderRadius: 3, transition: "color 120ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.textDanger; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
          title="Remove"
        >×</button>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: avatarColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}
        >
          {initials || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 1 }}>
            <EditableText
              value={stakeholder.name}
              onChange={(v) => onChange({ ...stakeholder, name: v })}
              style={{ fontSize: 13, fontWeight: 600, color: T.text }}
              placeholder="Name…"
            />
          </div>
          <EditableText
            value={stakeholder.role}
            onChange={(v) => onChange({ ...stakeholder, role: v })}
            style={{ fontSize: 12, color: T.textSubtle }}
            placeholder="Role…"
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={cycleType}
          title="Click to change type"
          style={{
            background: ts.bg, color: ts.text,
            border: "none", borderRadius: 3,
            padding: "2px 7px", fontSize: 11, fontWeight: 600,
            fontFamily: FONT_STACK, letterSpacing: "0.03em",
            cursor: "pointer", transition: "opacity 120ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          {ts.label}
        </button>
        <button
          onClick={cycleInfluence}
          title="Click to change influence"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer", padding: 0,
            transition: "opacity 120ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.65"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: inf.color, display: "inline-block" }} />
          <span style={{ fontSize: 11, color: inf.color, fontWeight: 500 }}>{inf.label}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ProjectOverviewView() {
  const project = getProjectSync();
  const [charter, setCharter] = useState<ProjectCharter>({ ...project.charter });

  const update = useCallback(<K extends keyof ProjectCharter>(key: K, value: ProjectCharter[K]) => {
    setCharter((prev) => ({ ...prev, [key]: value }));
  }, []);

  function updateObjective(id: string, obj: Objective) {
    setCharter((prev) => ({
      ...prev,
      objectives: prev.objectives.map((o) => (o.id === id ? obj : o)),
    }));
  }

  function deleteObjective(id: string) {
    setCharter((prev) => ({ ...prev, objectives: prev.objectives.filter((o) => o.id !== id) }));
  }

  function addObjective() {
    const id = `obj-${Date.now()}`;
    setCharter((prev) => ({
      ...prev,
      objectives: [...prev.objectives, { id, text: "", progress: 0 }],
    }));
  }

  function updateMilestone(id: string, m: Milestone) {
    setCharter((prev) => ({
      ...prev,
      milestones: prev.milestones.map((ms) => (ms.id === id ? m : ms)),
    }));
  }

  function deleteMilestone(id: string) {
    setCharter((prev) => ({ ...prev, milestones: prev.milestones.filter((m) => m.id !== id) }));
  }

  function addMilestone() {
    const id = `ms-${Date.now()}`;
    setCharter((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { id, name: "", date: "", status: "upcoming" }],
    }));
  }

  function updateStakeholder(id: string, s: Stakeholder) {
    setCharter((prev) => ({
      ...prev,
      stakeholders: prev.stakeholders.map((sh) => (sh.id === id ? s : sh)),
    }));
  }

  function deleteStakeholder(id: string) {
    setCharter((prev) => ({ ...prev, stakeholders: prev.stakeholders.filter((sh) => sh.id !== id) }));
  }

  function addStakeholder() {
    const id = `sh-${Date.now()}`;
    setCharter((prev) => ({
      ...prev,
      stakeholders: [...prev.stakeholders, { id, name: "", role: "", type: "internal", influence: "medium" }],
    }));
  }

  return (
    <div
      style={{
        fontFamily: FONT_STACK,
        background: T.surfaceSunken,
        minHeight: "100%",
        padding: "32px 40px 64px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
            padding: "20px 24px",
            background: T.surface,
            border: `1px solid ${T.borderSubtle}`,
            borderRadius: 8,
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(135deg, #579DFF 0%, #6554C0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {project.name.charAt(0)}
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: T.text }}>
                {project.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.textSubtlest,
                  background: T.bgNeutral,
                  padding: "1px 6px",
                  borderRadius: 3,
                  letterSpacing: "0.04em",
                }}
              >
                {project.key}
              </span>
              <StatusBadge
                status={charter.status}
                onChange={(s) => update("status", s)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.textSubtle }}>
                <span style={{ color: T.textSubtlest, marginRight: 4 }}>Lead</span>
                <EditableText
                  value={charter.lead}
                  onChange={(v) => update("lead", v)}
                  style={{ fontSize: 12, fontWeight: 500, color: T.textSubtle }}
                  placeholder="Add lead…"
                />
              </span>
              <span style={{ fontSize: 12, color: T.textSubtle }}>
                <span style={{ color: T.textSubtlest, marginRight: 4 }}>Start</span>
                <EditableText
                  value={charter.startDate}
                  onChange={(v) => update("startDate", v)}
                  style={{ fontSize: 12, color: T.textSubtle }}
                  placeholder="Add date…"
                />
              </span>
              <span style={{ fontSize: 12, color: T.textSubtle }}>
                <span style={{ color: T.textSubtlest, marginRight: 4 }}>Target</span>
                <EditableText
                  value={charter.targetDate}
                  onChange={(v) => update("targetDate", v)}
                  style={{ fontSize: 12, color: T.textSubtle }}
                  placeholder="Add date…"
                />
              </span>
            </div>
          </div>
        </div>

        {/* ── Vision ── */}
        <Section style={{ marginBottom: 16 }}>
          <SectionTitle>Vision</SectionTitle>
          <EditableTextarea
            value={charter.vision}
            onChange={(v) => update("vision", v)}
            placeholder="Describe the long-term vision for this project…"
            minRows={2}
          />
        </Section>

        {/* ── Problem Statement ── */}
        <Section style={{ marginBottom: 16 }}>
          <SectionTitle>Problem Statement</SectionTitle>
          <EditableTextarea
            value={charter.problemStatement}
            onChange={(v) => update("problemStatement", v)}
            placeholder="What problem does this project solve, and for whom?"
            minRows={2}
          />
        </Section>

        {/* ── Context ── */}
        <Section style={{ marginBottom: 16 }}>
          <SectionTitle>Context</SectionTitle>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: T.textSubtlest, marginBottom: 6, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}>Project type</div>
            <ProjectTypeSelector
              value={charter.projectType}
              onChange={(v) => update("projectType", v)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textSubtlest, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", marginBottom: 2 }}>Current state</div>
              <EditableTextarea
                value={charter.currentState}
                onChange={(v) => update("currentState", v)}
                placeholder="How is this problem solved today?"
                minRows={3}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textSubtlest, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", marginBottom: 2 }}>Target users</div>
              <EditableTextarea
                value={charter.targetUsers}
                onChange={(v) => update("targetUsers", v)}
                placeholder="Who uses this, and how?"
                minRows={3}
              />
            </div>
          </div>
        </Section>

        {/* ── Objectives + Milestones (two-column) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Section>
            <SectionTitle>Objectives</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {charter.objectives.map((obj) => (
                <ObjectiveRow
                  key={obj.id}
                  obj={obj}
                  onChange={(o) => updateObjective(obj.id, o)}
                  onDelete={() => deleteObjective(obj.id)}
                />
              ))}
            </div>
            <button
              onClick={addObjective}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textSubtlest,
                fontSize: 12,
                fontFamily: FONT_STACK,
                padding: "8px 0 0",
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.brandText; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add objective
            </button>
          </Section>

          <Section>
            <SectionTitle>Milestones</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {charter.milestones.map((ms, idx) => (
                <MilestoneRow
                  key={ms.id}
                  milestone={ms}
                  onChange={(m) => updateMilestone(ms.id, m)}
                  onDelete={() => deleteMilestone(ms.id)}
                  isLast={idx === charter.milestones.length - 1}
                />
              ))}
            </div>
            <button
              onClick={addMilestone}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textSubtlest,
                fontSize: 12,
                fontFamily: FONT_STACK,
                padding: "8px 0 0",
                marginTop: charter.milestones.length > 0 ? 8 : 0,
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.brandText; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add milestone
            </button>
          </Section>
        </div>

        {/* ── Scope ── */}
        <Section style={{ marginBottom: 16 }}>
          <SectionTitle>Scope</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.textSuccess,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 10,
                }}
              >
                In Scope
              </div>
              <EditableList
                items={charter.inScope}
                onChange={(items) => update("inScope", items)}
                addPlaceholder="Add in-scope item…"
                accentColor={T.bgSuccessBold}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.textDanger,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 10,
                }}
              >
                Out of Scope
              </div>
              <EditableList
                items={charter.outOfScope}
                onChange={(items) => update("outOfScope", items)}
                addPlaceholder="Add out-of-scope item…"
                accentColor={T.bgDangerBold}
              />
            </div>
          </div>
        </Section>

        {/* ── Stakeholders ── */}
        <Section style={{ marginTop: 0 }}>
          <SectionTitle>Stakeholders</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 4 }}>
            {charter.stakeholders.map((sh, idx) => (
              <StakeholderCard
                key={sh.id}
                stakeholder={sh}
                colorIndex={idx}
                onChange={(s) => updateStakeholder(sh.id, s)}
                onDelete={() => deleteStakeholder(sh.id)}
              />
            ))}
          </div>
          <button
            onClick={addStakeholder}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: T.textSubtlest, fontSize: 12, fontFamily: FONT_STACK,
              padding: "10px 0 0", transition: "color 120ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = T.brandText; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.textSubtlest; }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add stakeholder
          </button>
        </Section>

      </div>
    </div>
  );
}

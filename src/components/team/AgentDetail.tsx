"use client";

import { useState } from "react";
import { T } from "@/lib/tokens";
import { ALL_TOOLS, ALL_MCP_SERVERS, ALL_SKILLS, MODELS } from "./types";
import type { Agent, AgentTool, McpServer, AgentSkill, EffortLevel, PermissionMode } from "./types";

// ─── Local helpers ────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: T.textSubtlest,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: T.textSubtlest, marginBottom: 5 }}>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        background: checked ? T.brandBold : T.surfacePressed,
        cursor: "pointer",
        position: "relative",
        transition: "background 200ms",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 200ms",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

const SERVER_EMOJI: Record<string, string> = {
  Supabase: "🗄",
  Notion:   "📝",
  HubSpot:  "🎯",
  context7: "📚",
};

const STATUS_CONFIG = {
  idle:    { label: "Idle",    bg: T.bgNeutral,      text: T.textSubtle  },
  running: { label: "Running", bg: T.bgInfoSubtle,   text: T.textInfo    },
  error:   { label: "Error",   bg: T.bgDangerSubtle, text: T.textDanger  },
};

const AGENT_AVATAR_COLORS: string[] = [
  "linear-gradient(135deg, #579DFF 0%, #6554C0 100%)",
  "linear-gradient(135deg, #4BCE97 0%, #0C66E4 100%)",
  "linear-gradient(135deg, #F87462 0%, #CF9F02 100%)",
  "linear-gradient(135deg, #9F8FEF 0%, #E774BB 100%)",
];

function agentGradient(id: string) {
  const idx = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AGENT_AVATAR_COLORS[idx % AGENT_AVATAR_COLORS.length];
}

// ─── Shared style constants ───────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  borderRadius: 4,
  border: `1px solid ${T.border}`,
  background: T.surface,
  fontSize: 13,
  color: T.text,
  outline: "none",
  cursor: "pointer",
};

const numberInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  borderRadius: 4,
  border: `1px solid ${T.border}`,
  background: T.surface,
  fontSize: 13,
  color: T.text,
  outline: "none",
  boxSizing: "border-box",
};

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  agent: Agent;
  onChange: (agent: Agent) => void;
  onSave: (agent: Agent) => Promise<void>;
  onDelete: () => void;
}

export function AgentDetail({ agent, onChange, onSave, onDelete }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const patch = (changes: Partial<Agent>) => onChange({ ...agent, ...changes });

  const handleSave = async () => {
    setSaving(true);
    await onSave(agent);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const status = STATUS_CONFIG[agent.status];
  const initials = agent.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          padding: "14px 28px",
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
        }}
      >
        {/* Avatar */}
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: agentGradient(agent.id),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          {initials}
        </span>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <input
            value={agent.name}
            onChange={(e) => patch({ name: e.target.value })}
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: T.text,
              border: "none",
              background: "transparent",
              padding: 0,
              width: "100%",
              outline: "none",
              lineHeight: "22px",
            }}
          />
          <input
            value={agent.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Add a description…"
            style={{
              fontSize: 13,
              color: T.textSubtle,
              border: "none",
              background: "transparent",
              padding: 0,
              width: "100%",
              outline: "none",
              marginTop: 2,
            }}
          />
        </div>

        {/* Status lozenge */}
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 3,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            background: status.bg,
            color: status.text,
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* ── Scrollable form body ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "22px 28px 0" }}
      >
        {/* Model & Effort */}
        <Section label="Model & Effort">
          <div className="flex gap-5 items-start">
            <div style={{ flex: 1 }}>
              <FieldLabel>Model</FieldLabel>
              <select
                value={agent.model}
                onChange={(e) => patch({ model: e.target.value })}
                style={selectStyle}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Effort</FieldLabel>
              <div className="flex gap-1">
                {(["low", "medium", "high", "max"] as EffortLevel[]).map((level) => {
                  const active = agent.effort === level;
                  return (
                    <button
                      key={level}
                      onClick={() => patch({ effort: level })}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 4,
                        border: `1px solid ${active ? T.brandBold : T.border}`,
                        background: active ? T.brandSubtle : "transparent",
                        color: active ? T.brandText : T.textSubtle,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: "all 120ms",
                      }}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* System Prompt */}
        <Section label="System Prompt">
          <textarea
            value={agent.systemPrompt}
            onChange={(e) => patch({ systemPrompt: e.target.value })}
            placeholder="Define the agent's role, behavior, and constraints…"
            rows={6}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${T.border}`,
              borderRadius: 4,
              fontSize: 13,
              color: T.text,
              background: T.surface,
              fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace',
              lineHeight: "1.65",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </Section>

        {/* Tools */}
        <Section label="Tools">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 6,
            }}
          >
            {ALL_TOOLS.map((tool) => {
              const checked = agent.tools.includes(tool);
              return (
                <label
                  key={tool}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 8px",
                    borderRadius: 4,
                    border: `1px solid ${checked ? T.borderSelected : T.border}`,
                    background: checked ? T.brandSubtle : "transparent",
                    cursor: "pointer",
                    fontSize: 12,
                    color: checked ? T.brandText : T.textSubtle,
                    fontWeight: checked ? 500 : 400,
                    transition: "all 120ms",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? ([...agent.tools, tool] as AgentTool[])
                        : (agent.tools.filter((t) => t !== tool) as AgentTool[]);
                      patch({ tools: next });
                    }}
                    style={{ display: "none" }}
                  />
                  {/* Custom checkbox */}
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: `1.5px solid ${checked ? T.brandBold : T.borderBold}`,
                      background: checked ? T.brandBold : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 120ms",
                    }}
                  >
                    {checked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {tool}
                </label>
              );
            })}
          </div>
        </Section>

        {/* MCP Servers */}
        <Section label="MCP Servers">
          <div className="flex flex-col gap-2">
            {ALL_MCP_SERVERS.map((server) => {
              const enabled = agent.mcpServers.includes(server);
              return (
                <div
                  key={server}
                  className="flex items-center justify-between"
                  style={{
                    padding: "9px 14px",
                    borderRadius: 6,
                    border: `1px solid ${enabled ? T.borderSelected : T.border}`,
                    background: enabled ? T.brandSubtle : T.surface,
                    transition: "all 120ms",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 16, lineHeight: 1 }}>
                      {SERVER_EMOJI[server] ?? "🔌"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: enabled ? T.brandText : T.text,
                      }}
                    >
                      {server}
                    </span>
                  </div>
                  <Toggle
                    checked={enabled}
                    onChange={(v) => {
                      const next = v
                        ? ([...agent.mcpServers, server] as McpServer[])
                        : (agent.mcpServers.filter((s) => s !== server) as McpServer[]);
                      patch({ mcpServers: next });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Section>

        {/* Skills */}
        <Section label="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {agent.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 4,
                  background: T.bgNeutral,
                  fontSize: 12,
                  color: T.textSubtle,
                  fontWeight: 500,
                }}
              >
                {skill}
                <button
                  onClick={() =>
                    patch({ skills: agent.skills.filter((s) => s !== skill) })
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: T.textSubtlest,
                    fontSize: 15,
                    lineHeight: 1,
                    padding: 0,
                    display: "flex",
                  }}
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
            {ALL_SKILLS.filter((s) => !agent.skills.includes(s)).length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  const skill = e.target.value as AgentSkill;
                  if (skill) patch({ skills: [...agent.skills, skill] });
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: `1px dashed ${T.border}`,
                  background: "transparent",
                  fontSize: 12,
                  color: T.textSubtlest,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="">+ Add skill</option>
                {ALL_SKILLS.filter((s) => !agent.skills.includes(s)).map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            )}
          </div>
        </Section>

        {/* Memory & Thinking */}
        <Section label="Memory & Thinking">
          <div className="flex gap-3">
            {[
              {
                key: "memory" as const,
                label: "Persistent Memory",
                sub: "Retain learnings across sessions",
              },
              {
                key: "extendedThinking" as const,
                label: "Extended Thinking",
                sub: "Chain-of-thought reasoning",
              },
            ].map(({ key, label, sub }) => (
              <div
                key={key}
                className="flex items-center justify-between flex-1"
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: `1px solid ${T.border}`,
                  background: T.surface,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: T.textSubtlest, marginTop: 2 }}>
                    {sub}
                  </div>
                </div>
                <Toggle
                  checked={agent[key]}
                  onChange={(v) => patch({ [key]: v })}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Advanced (collapsible) */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: T.textSubtlest,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              textTransform: "uppercase",
            }}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              style={{
                transform: showAdvanced ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 180ms",
              }}
            >
              <path d="M2 1l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            Advanced
          </button>

          {showAdvanced && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <FieldLabel>Permission Mode</FieldLabel>
                <select
                  value={agent.permissionMode}
                  onChange={(e) =>
                    patch({ permissionMode: e.target.value as PermissionMode })
                  }
                  style={selectStyle}
                >
                  <option value="default">Default — prompt for unapproved tools</option>
                  <option value="dontAsk">Don't Ask — silently deny unapproved</option>
                  <option value="acceptEdits">Accept Edits — auto-approve file edits</option>
                  <option value="bypassPermissions">Bypass — run everything without asking</option>
                  <option value="plan">Plan only — no execution</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div style={{ flex: 1 }}>
                  <FieldLabel>Max Turns</FieldLabel>
                  <input
                    type="number"
                    value={agent.maxTurns ?? ""}
                    onChange={(e) =>
                      patch({ maxTurns: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Unlimited"
                    style={numberInputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <FieldLabel>Max Budget (USD)</FieldLabel>
                  <input
                    type="number"
                    step="0.01"
                    value={agent.maxBudget ?? ""}
                    onChange={(e) =>
                      patch({ maxBudget: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="No limit"
                    style={numberInputStyle}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spacer so content isn't hidden behind sticky bar */}
        <div style={{ height: 72 }} />
      </div>

      {/* ── Sticky action bar ── */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={{
          padding: "10px 28px",
          borderTop: `1px solid ${T.border}`,
          background: T.surface,
        }}
      >
        <button
          style={{
            padding: "6px 16px",
            borderRadius: 4,
            border: "none",
            background: T.brandBold,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
          </svg>
          Run
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: `1px solid ${T.border}`,
            background: saved ? T.bgSuccessSubtle : "transparent",
            color: saved ? T.textSuccess : T.textSubtle,
            fontSize: 13,
            fontWeight: 500,
            cursor: saving ? "not-allowed" : "pointer",
            transition: "all 200ms",
            minWidth: 60,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={onDelete}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: `1px solid ${T.bgDangerBold}`,
            background: "transparent",
            color: T.textDanger,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

"use client";

import { T } from "@/lib/tokens";
import { MODELS } from "./types";
import type { Agent } from "./types";

const STATUS_COLOR: Record<string, string> = {
  idle:    T.bgNeutralBold,
  running: T.bgInfoBold,
  error:   T.bgDangerBold,
};

interface Props {
  agents: Agent[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function AgentList({ agents, selectedId, onSelect, onNew }: Props) {
  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        width: 240,
        borderRight: `1px solid ${T.border}`,
        background: T.surface,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "14px 16px 10px",
          borderBottom: `1px solid ${T.borderSubtle}`,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: T.textSubtlest,
          }}
        >
          AGENTS ({agents.length})
        </span>
        <button
          onClick={onNew}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "3px 8px",
            borderRadius: 4,
            border: `1px solid ${T.border}`,
            background: "transparent",
            fontSize: 12,
            fontWeight: 500,
            color: T.textSubtle,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.surfaceHovered;
            e.currentTarget.style.color = T.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = T.textSubtle;
          }}
        >
          + New
        </button>
      </div>

      {/* Agent rows */}
      <div className="flex-1 overflow-y-auto py-1">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedId;
          const modelShort =
            MODELS.find((m) => m.id === agent.model)?.short ?? agent.model;

          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                width: "100%",
                padding: "8px 14px",
                textAlign: "left",
                border: "none",
                borderLeft: isSelected
                  ? `3px solid ${T.brandBold}`
                  : "3px solid transparent",
                background: isSelected ? T.brandSubtle : "transparent",
                cursor: "pointer",
                transition: "background 120ms",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = T.surfaceHovered;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Status dot */}
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: STATUS_COLOR[agent.status],
                  marginTop: 5,
                  flexShrink: 0,
                  boxShadow:
                    agent.status === "running"
                      ? `0 0 0 3px rgba(12,102,228,0.15)`
                      : "none",
                }}
              />
              <div className="min-w-0">
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? T.brandBold : T.text,
                    lineHeight: "18px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {agent.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: T.textSubtlest,
                    lineHeight: "16px",
                    marginTop: 1,
                  }}
                >
                  {modelShort} · {agent.tools.length} tools
                  {agent.mcpServers.length > 0 && ` · MCP:${agent.mcpServers.length}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ActivityNode as ActivityNodeType, ActorType } from "../types";

const ACTOR_CONFIG: Record<ActorType, { bg: string; accent: string; icon: string; label: string }> = {
  human: {
    bg: "#E9F2FF",
    accent: "#0C66E4",
    icon: "👤",
    label: "Human",
  },
  automated: {
    bg: "#F3F0FF",
    accent: "#6554C0",
    icon: "⚡",
    label: "Automated",
  },
  system: {
    bg: "#F7F8F9",
    accent: "#44546F",
    icon: "⚙",
    label: "System",
  },
};

function ActivityNodeComponent({ data }: NodeProps<ActivityNodeType>) {
  const { highlighted, dimmed, highlightColor } = data;
  const actor = ACTOR_CONFIG[data.actor];
  const opacity = dimmed ? 0.2 : 1;
  const borderColor = highlighted ? highlightColor! : actor.accent;
  const bg = highlighted ? `${highlightColor}12` : actor.bg;
  const shadow = highlighted
    ? `0 0 0 2px ${highlightColor}40, 0 2px 8px ${highlightColor}20`
    : "0 1px 3px rgba(9,30,66,0.12)";

  return (
    <div
      style={{
        width: 200,
        borderRadius: 8,
        background: bg,
        border: `1.5px solid ${borderColor}`,
        boxShadow: shadow,
        opacity,
        transition: "all 200ms ease",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Actor badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          background: `${borderColor}18`,
          borderBottom: `1px solid ${borderColor}30`,
          fontSize: 10,
          fontWeight: 600,
          color: borderColor,
          letterSpacing: "0.04em",
        }}
      >
        <span style={{ fontSize: 11 }}>{actor.icon}</span>
        {actor.label.toUpperCase()}
      </div>

      {/* Label */}
      <div
        style={{
          padding: "10px 12px",
          fontSize: 13,
          fontWeight: 600,
          color: "#1D2125",
          lineHeight: "18px",
        }}
      >
        {data.label}
      </div>

      <Handle type="target" position={Position.Top} style={{ background: borderColor }} />
      <Handle type="source" position={Position.Bottom} style={{ background: borderColor }} />
    </div>
  );
}

export const ActivityNode = memo(ActivityNodeComponent);

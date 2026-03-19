"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { EndNode as EndNodeType } from "../types";

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Hired:    { bg: "#DFFCF0", text: "#1F845A", border: "#1F845A" },
  Rejected: { bg: "#FFEDEB", text: "#AE2A19", border: "#C9372C" },
};

export function EndNode({ data }: NodeProps<EndNodeType>) {
  const { highlighted, dimmed, highlightColor } = data;
  const palette = COLORS[data.label] ?? { bg: "#F1F2F4", text: "#44546F", border: "#758195" };
  const border = highlighted ? `2px solid ${highlightColor}` : `2px solid ${palette.border}`;
  const opacity = dimmed ? 0.2 : 1;
  const shadow = highlighted ? `0 0 0 3px ${highlightColor}30` : "none";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 140,
        height: 44,
        borderRadius: 22,
        background: highlighted ? `${highlightColor}18` : palette.bg,
        border,
        boxShadow: shadow,
        opacity,
        fontSize: 12,
        fontWeight: 700,
        color: highlighted ? highlightColor : palette.text,
        letterSpacing: "0.02em",
        transition: "all 200ms ease",
        userSelect: "none",
      }}
    >
      ■ {data.label}
      <Handle type="target" position={Position.Top} style={{ background: palette.border }} />
    </div>
  );
}

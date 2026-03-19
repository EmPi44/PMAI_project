"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { StartNode as StartNodeType } from "../types";

export function StartNode({ data }: NodeProps<StartNodeType>) {
  const { highlighted, dimmed, highlightColor } = data;
  const border = highlighted ? `2px solid ${highlightColor}` : "2px solid #1F845A";
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
        background: highlighted ? `${highlightColor}18` : "#DFFCF0",
        border,
        boxShadow: shadow,
        opacity,
        fontSize: 12,
        fontWeight: 700,
        color: highlighted ? highlightColor : "#1F845A",
        letterSpacing: "0.02em",
        transition: "all 200ms ease",
        userSelect: "none",
      }}
    >
      ▶ {data.label}
      <Handle type="source" position={Position.Bottom} style={{ background: "#1F845A" }} />
    </div>
  );
}

"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { DecisionNode as DecisionNodeType } from "../types";

const W = 160;
const H = 80;

function DecisionNodeComponent({ data }: NodeProps<DecisionNodeType>) {
  const { highlighted, dimmed, highlightColor } = data;
  const opacity = dimmed ? 0.2 : 1;
  const strokeColor = highlighted ? highlightColor! : "#CF9F02";
  const fillColor = highlighted ? `${highlightColor}18` : "#FFF7D6";
  const shadow = highlighted
    ? `drop-shadow(0 0 6px ${highlightColor}50)`
    : "drop-shadow(0 1px 2px rgba(9,30,66,0.15))";

  return (
    <div style={{ position: "relative", width: W, height: H, opacity, transition: "all 200ms ease", userSelect: "none" }}>
      {/* SVG diamond */}
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, filter: shadow }}
        overflow="visible"
      >
        <polygon
          points={`${W / 2},2 ${W - 2},${H / 2} ${W / 2},${H - 2} 2,${H / 2}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
      </svg>

      {/* Text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 28px",
          fontSize: 11,
          fontWeight: 700,
          color: highlighted ? highlightColor : "#7F5F01",
          lineHeight: "15px",
          pointerEvents: "none",
        }}
      >
        {data.label}
      </div>

      {/* Handles: top=in, left=no, right=yes */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)", background: strokeColor }}
      />
      <Handle
        type="source"
        id="yes"
        position={Position.Right}
        style={{ top: "50%", right: 0, transform: "translate(50%, -50%)", background: strokeColor }}
      />
      <Handle
        type="source"
        id="no"
        position={Position.Left}
        style={{ top: "50%", left: 0, transform: "translate(-50%, -50%)", background: strokeColor }}
      />
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeComponent);

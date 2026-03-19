"use client";

import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import type { AddNodeType } from "../WorkflowToolbar";

const INSERT_OPTIONS: { label: string; icon: string; spec: AddNodeType; color: string }[] = [
  { label: "Activity — Human",  icon: "👤", spec: { type: "activity", actor: "human" },     color: "#0C66E4" },
  { label: "Activity — Auto",   icon: "⚡", spec: { type: "activity", actor: "automated" }, color: "#6554C0" },
  { label: "Activity — System", icon: "⚙",  spec: { type: "activity", actor: "system" },    color: "#44546F" },
  { label: "Decision",          icon: "◆", spec: { type: "decision" },                     color: "#CF9F02" },
];

const NODE_OFFSETS: Record<string, { x: number; y: number }> = {
  activity: { x: -100, y: -32 },
  decision:  { x: -80,  y: -40 },
  start:     { x: -70,  y: -22 },
  end:       { x: -70,  y: -22 },
};

type AddableEdgeProps = EdgeProps & { sourceHandle?: string; targetHandle?: string };

export function AddableEdge(props: AddableEdgeProps) {
  const {
    id, source, target,
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    sourceHandle, targetHandle,
    style, markerEnd,
    label, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius,
  } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  function insertNode(spec: AddNodeType) {
    const newId = `${spec.type}-${Date.now()}`;
    const offset = NODE_OFFSETS[spec.type] ?? { x: -100, y: -32 };

    const newNode = {
      id: newId,
      type: spec.type,
      position: {
        x: (sourceX + targetX) / 2 + offset.x,
        y: (sourceY + targetY) / 2 + offset.y,
      },
      data:
        spec.type === "activity"
          ? { label: "New Activity", actor: spec.actor }
          : spec.type === "decision"
          ? { label: "Decision?" }
          : { label: spec.type === "start" ? "Start" : "End" },
    };

    const edgeDefaults = { type: "addable", style, markerEnd };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setNodes((prev) => [...prev, newNode as any]);
    setEdges((prev) => [
      ...prev.filter((e) => e.id !== id),
      {
        ...edgeDefaults,
        id: `${newId}-in`,
        source,
        target: newId,
        ...(sourceHandle ? { sourceHandle } : {}),
      },
      {
        ...edgeDefaults,
        id: `${newId}-out`,
        source: newId,
        target,
        ...(targetHandle ? { targetHandle } : {}),
      },
    ]);
    setMenuOpen(false);
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        label={label}
        labelX={labelX}
        labelY={labelY}
        labelStyle={labelStyle}
        labelBgStyle={labelBgStyle}
        labelBgPadding={labelBgPadding}
        labelBgBorderRadius={labelBgBorderRadius}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + (label ? 18 : 0)}px)`,
            pointerEvents: "all",
            zIndex: 10,
          }}
          className="nodrag nopan"
        >
          {/* + button */}
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            title="Insert node here"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "1.5px solid #758195",
              background: "#fff",
              color: "#44546F",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              padding: 0,
              transition: "all 150ms",
              boxShadow: "0 1px 3px rgba(9,30,66,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0C66E4";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#0C66E4";
              e.currentTarget.style.transform = "scale(1.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#44546F";
              e.currentTarget.style.borderColor = "#758195";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            +
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9 }}
                onClick={() => setMenuOpen(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                  background: "#fff",
                  border: "1px solid #DFE1E6",
                  borderRadius: 6,
                  boxShadow: "0 4px 16px rgba(9,30,66,0.18)",
                  minWidth: 192,
                  overflow: "hidden",
                  padding: "4px 0",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#626F86",
                    letterSpacing: "0.05em",
                    padding: "6px 12px 4px",
                  }}
                >
                  INSERT BETWEEN
                </div>
                {INSERT_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={(e) => { e.stopPropagation(); insertNode(opt.spec); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "7px 12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#1D2125",
                      textAlign: "left",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F7F8F9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 3,
                        background: `${opt.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {opt.icon}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

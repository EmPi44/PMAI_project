"use client";

import { useCallback, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { initialNodes, initialEdges, scenarios } from "./data/hrApplicationFlow";
import { getLayoutedElements } from "./utils/layout";
import { WorkflowToolbar } from "./WorkflowToolbar";
import { JsonPanel } from "./JsonPanel";
import type { WorkflowScenario } from "./types";

export function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [activeScenario, setActiveScenario] = useState<WorkflowScenario | null>(null);
  const [jsonPanelOpen, setJsonPanelOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAutoLayout = useCallback(() => {
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
    setNodes(ln);
    setEdges(le);
  }, [nodes, edges, setNodes, setEdges]);

  const onScenarioSelect = useCallback((s: WorkflowScenario) => {
    setActiveScenario((prev) => (prev?.id === s.id ? null : s));
  }, []);

  // Apply scenario highlight styles without mutating original nodes/edges
  const styledNodes = useMemo(() => {
    if (!activeScenario) return nodes;
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        highlighted: activeScenario.nodeIds.includes(node.id),
        dimmed: !activeScenario.nodeIds.includes(node.id),
        highlightColor: activeScenario.color,
      },
    }));
  }, [nodes, activeScenario]);

  const styledEdges = useMemo(() => {
    if (!activeScenario) return edges;
    return edges.map((edge) => {
      const isActive = activeScenario.edgeIds.includes(edge.id);
      return {
        ...edge,
        animated: isActive,
        style: isActive
          ? { stroke: activeScenario.color, strokeWidth: 2.5 }
          : { stroke: "#C1C7D0", strokeWidth: 1, opacity: 0.3 },
        labelStyle: isActive ? { fill: activeScenario.color, fontWeight: 600 } : { opacity: 0.3 },
      };
    });
  }, [edges, activeScenario]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <WorkflowToolbar
        scenarios={scenarios}
        activeScenario={activeScenario}
        onScenarioSelect={onScenarioSelect}
        onAutoLayout={onAutoLayout}
        onToggleJson={() => setJsonPanelOpen((o) => !o)}
        jsonPanelOpen={jsonPanelOpen}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { strokeWidth: 1.5, stroke: "#758195" },
            labelStyle: { fontSize: 11, fontWeight: 500, fill: "#44546F" },
            labelBgStyle: { fill: "#fff", fillOpacity: 0.85 },
            labelBgPadding: [4, 3],
            labelBgBorderRadius: 3,
          }}
          proOptions={{ hideAttribution: false }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#C1C7D0"
          />
          <Controls />
          <MiniMap
            nodeStrokeWidth={2}
            nodeColor={(node) => {
              if (node.type === "start") return "#1F845A";
              if (node.type === "end") return "#C9372C";
              if (node.type === "decision") return "#CF9F02";
              const actor = (node.data as { actor?: string }).actor;
              if (actor === "automated") return "#6554C0";
              if (actor === "human") return "#0C66E4";
              return "#44546F";
            }}
            style={{ background: "#F7F8F9", border: "1px solid #DFE1E6" }}
          />
        </ReactFlow>

        {jsonPanelOpen && (
          <JsonPanel
            nodes={nodes}
            edges={edges}
            onApply={(n, e) => {
              setNodes(n);
              setEdges(e);
            }}
          />
        )}
      </div>
    </div>
  );
}

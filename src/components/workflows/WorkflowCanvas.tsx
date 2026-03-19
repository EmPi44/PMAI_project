"use client";

import { useCallback, useState, useMemo, useRef } from "react";
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
  type ReactFlowInstance,
  type NodeMouseHandler,
} from "@xyflow/react";

import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import { getLayoutedElements } from "./utils/layout";
import { WorkflowToolbar, type AddNodeType } from "./WorkflowToolbar";
import { JsonPanel } from "./JsonPanel";
import { NodeEditPanel } from "./NodeEditPanel";
import type { Workflow, WorkflowNode, WorkflowScenario } from "./types";

interface Props {
  workflow: Workflow;
  initialScenarioId?: string;
}

export function WorkflowCanvas({ workflow, initialScenarioId }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(workflow.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(workflow.edges as Edge[]);

  const initialScenario = initialScenarioId
    ? (workflow.scenarios.find((s) => s.id === initialScenarioId) ?? null)
    : null;

  const [activeScenario, setActiveScenario] = useState<WorkflowScenario | null>(initialScenario);
  const [jsonPanelOpen, setJsonPanelOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const rfInstance = useRef<ReactFlowInstance | null>(null);

  // ── Connections ──────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // ── Layout ───────────────────────────────────────────────────────────────
  const onAutoLayout = useCallback(() => {
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
    setNodes(ln);
    setEdges(le);
  }, [nodes, edges, setNodes, setEdges]);

  // ── Scenario ─────────────────────────────────────────────────────────────
  const onScenarioSelect = useCallback((s: WorkflowScenario) => {
    setActiveScenario((prev) => (prev?.id === s.id ? null : s));
  }, []);

  // ── Add node ─────────────────────────────────────────────────────────────
  const onAddNode = useCallback((spec: AddNodeType) => {
    const rf = rfInstance.current;
    const center = rf
      ? rf.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
      : { x: 200, y: 200 };

    const id = `${spec.type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type: spec.type,
      position: { x: center.x - 100, y: center.y - 40 },
      data:
        spec.type === "activity"
          ? { label: "New Activity", actor: spec.actor }
          : spec.type === "decision"
          ? { label: "Decision?" }
          : { label: spec.type === "start" ? "Start" : "End" },
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  }, [setNodes]);

  // ── Edit node data ────────────────────────────────────────────────────────
  const onUpdateNode = useCallback(
    (nodeId: string, patch: Record<string, unknown>) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n))
      );
    },
    [setNodes]
  );

  // ── Delete node ───────────────────────────────────────────────────────────
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
    },
    [setNodes, setEdges]
  );

  // ── Node click / pane click ───────────────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
    setJsonPanelOpen(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ── Resolve selected node from current state ───────────────────────────────
  const selectedNode = useMemo(
    () => (selectedNodeId ? (nodes.find((n) => n.id === selectedNodeId) as WorkflowNode | undefined) : undefined),
    [nodes, selectedNodeId]
  );

  // ── Scenario highlight styles ─────────────────────────────────────────────
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
        workflowName={workflow.name}
        scenarios={workflow.scenarios}
        activeScenario={activeScenario}
        onScenarioSelect={onScenarioSelect}
        onAddNode={onAddNode}
        onAutoLayout={onAutoLayout}
        onToggleJson={() => { setJsonPanelOpen((o) => !o); setSelectedNodeId(null); }}
        jsonPanelOpen={jsonPanelOpen}
      />

      <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <ReactFlow
            nodes={styledNodes}
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={(instance) => { rfInstance.current = instance; }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            deleteKeyCode={["Backspace", "Delete"]}
            defaultEdgeOptions={{
              type: "addable",
              style: { strokeWidth: 1.5, stroke: "#758195" },
              labelStyle: { fontSize: 11, fontWeight: 500, fill: "#44546F" },
              labelBgStyle: { fill: "#fff", fillOpacity: 0.85 },
              labelBgPadding: [4, 3],
              labelBgBorderRadius: 3,
            }}
            proOptions={{ hideAttribution: false }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#C1C7D0" />
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

          {/* Right panel: node edit takes priority over JSON */}
          {selectedNode && (
            <NodeEditPanel
              node={selectedNode}
              onUpdate={onUpdateNode}
              onDelete={onDeleteNode}
              onClose={() => setSelectedNodeId(null)}
            />
          )}

          {!selectedNode && jsonPanelOpen && (
            <JsonPanel
              nodes={nodes}
              edges={edges}
              onApply={(n, e) => { setNodes(n); setEdges(e); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

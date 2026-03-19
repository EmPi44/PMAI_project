"use client";

import { useCallback, useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
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
  type EdgeMouseHandler,
} from "@xyflow/react";

import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import { getLayoutedElements } from "./utils/layout";
import { WorkflowToolbar, type AddNodeType } from "./WorkflowToolbar";
import { JsonPanel } from "./JsonPanel";
import { NodeEditPanel } from "./NodeEditPanel";
import { EdgeEditPanel } from "./EdgeEditPanel";
import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowScenario } from "./types";
import { saveScenarios, saveCanvas } from "@/lib/supabase/workflows";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
type HistoryEntry = { nodes: Node[]; edges: Edge[] };

interface Props {
  workflow: Workflow;
  initialScenarioId?: string;
}

export function WorkflowCanvas({ workflow, initialScenarioId }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(workflow.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(workflow.edges as Edge[]);

  const [scenarios, setScenarios] = useState<WorkflowScenario[]>(workflow.scenarios);

  const initialScenario = initialScenarioId
    ? (workflow.scenarios.find((s) => s.id === initialScenarioId) ?? null)
    : null;

  const [activeScenario, setActiveScenario] = useState<WorkflowScenario | null>(initialScenario);
  const [jsonPanelOpen, setJsonPanelOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // History for undo/redo
  const historyRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Always-current refs — avoids stale closures in stable callbacks
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  // Sync after every render (useLayoutEffect avoids the "mutate during render" lint rule)
  useLayoutEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  });

  // New Scenario modal state
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [newScenarioLabel, setNewScenarioLabel] = useState("");
  const [newScenarioColor, setNewScenarioColor] = useState("#1F845A");

  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveCanvas(
          workflow.id,
          nodesRef.current as WorkflowNode[],
          edgesRef.current as WorkflowEdge[]
        );
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("error");
      }
    }, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [nodes, edges, workflow.id]);

  // ── History helpers ───────────────────────────────────────────────────────
  const pushHistory = useCallback(() => {
    historyRef.current = [
      ...historyRef.current.slice(-49),
      {
        nodes: JSON.parse(JSON.stringify(nodesRef.current)),
        edges: JSON.parse(JSON.stringify(edgesRef.current)),
      },
    ];
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    futureRef.current = [
      {
        nodes: JSON.parse(JSON.stringify(nodesRef.current)),
        edges: JSON.parse(JSON.stringify(edgesRef.current)),
      },
      ...futureRef.current.slice(0, 49),
    ];
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    const next = futureRef.current.shift();
    if (!next) return;
    historyRef.current = [
      ...historyRef.current,
      {
        nodes: JSON.parse(JSON.stringify(nodesRef.current)),
        edges: JSON.parse(JSON.stringify(edgesRef.current)),
      },
    ];
    setNodes(next.nodes);
    setEdges(next.edges);
    setCanRedo(futureRef.current.length > 0);
    setCanUndo(true);
  }, [setNodes, setEdges]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const isMac = /mac/i.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  // ── Connections ──────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      pushHistory();
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, pushHistory]
  );

  // ── Layout ───────────────────────────────────────────────────────────────
  const onAutoLayout = useCallback(() => {
    pushHistory();
    const { nodes: ln, edges: le } = getLayoutedElements(nodesRef.current, edgesRef.current);
    setNodes(ln);
    setEdges(le);
  }, [setNodes, setEdges, pushHistory]);

  // ── Fit to view ───────────────────────────────────────────────────────────
  const onFitView = useCallback(() => {
    rfInstance.current?.fitView({ padding: 0.15, duration: 300 });
  }, []);

  // ── Scenario ─────────────────────────────────────────────────────────────
  const onScenarioSelect = useCallback((s: WorkflowScenario) => {
    setActiveScenario((prev) => (prev?.id === s.id ? null : s));
  }, []);

  // ── Scenario node toggle ──────────────────────────────────────────────────
  const onToggleNodeInScenario = useCallback(
    (scenarioId: string, nodeId: string) => {
      setScenarios((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== scenarioId) return s;
          const has = s.nodeIds.includes(nodeId);
          return {
            ...s,
            nodeIds: has ? s.nodeIds.filter((id) => id !== nodeId) : [...s.nodeIds, nodeId],
          };
        });
        setActiveScenario((active) => {
          if (!active || active.id !== scenarioId) return active;
          return updated.find((s) => s.id === scenarioId) ?? active;
        });
        saveScenarios(workflow.id, updated).catch(console.error);
        return updated;
      });
    },
    [workflow.id]
  );

  // ── Add node ─────────────────────────────────────────────────────────────
  const onAddNode = useCallback(
    (spec: AddNodeType) => {
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

      pushHistory();
      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(id);
    },
    [setNodes, pushHistory]
  );

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
      pushHistory();
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
    },
    [setNodes, setEdges, pushHistory]
  );

  // ── Update edge label ─────────────────────────────────────────────────────
  const onUpdateEdgeLabel = useCallback(
    (edgeId: string, label: string) => {
      setEdges((prev) => prev.map((e) => (e.id === edgeId ? { ...e, label } : e)));
    },
    [setEdges]
  );

  // ── Scenario creation ─────────────────────────────────────────────────────
  const onOpenScenarioModal = useCallback(() => {
    setNewScenarioLabel("");
    setNewScenarioColor("#1F845A");
    setScenarioModalOpen(true);
  }, []);

  const onCreateScenario = useCallback(() => {
    const label = newScenarioLabel.trim();
    if (!label) return;
    const newScenario: WorkflowScenario = {
      id: `scenario-${Date.now()}`,
      label,
      color: newScenarioColor,
      nodeIds: [],
      edgeIds: [],
    };
    const updated = [...scenarios, newScenario];
    setScenarios(updated);
    saveScenarios(workflow.id, updated).catch(console.error);
    setActiveScenario(newScenario);
    setScenarioModalOpen(false);
  }, [newScenarioLabel, newScenarioColor, scenarios, workflow.id]);

  // ── Node / edge / pane click ──────────────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setJsonPanelOpen(false);
  }, []);

  const onEdgeClick: EdgeMouseHandler = useCallback((_event, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setJsonPanelOpen(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  // Push history before drag moves a node
  const onNodeDragStart: NodeMouseHandler = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  // ── Resolve selected items ────────────────────────────────────────────────
  const selectedNode = useMemo(
    () =>
      selectedNodeId
        ? (nodes.find((n) => n.id === selectedNodeId) as WorkflowNode | undefined)
        : undefined,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => (selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) : undefined),
    [edges, selectedEdgeId]
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

  const isEmpty = nodes.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <WorkflowToolbar
        workflowName={workflow.name}
        scenarios={scenarios}
        activeScenario={activeScenario}
        onScenarioSelect={onScenarioSelect}
        onAddNode={onAddNode}
        onAddScenario={onOpenScenarioModal}
        onAutoLayout={onAutoLayout}
        onToggleJson={() => {
          setJsonPanelOpen((o) => !o);
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
        jsonPanelOpen={jsonPanelOpen}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onFitView={onFitView}
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
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeDragStart={onNodeDragStart}
            onInit={(instance) => {
              rfInstance.current = instance;
            }}
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

            {/* Empty state */}
            {isEmpty && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    padding: "28px 36px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.92)",
                    border: "1.5px dashed #C1C7D0",
                    maxWidth: 300,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      opacity: 0.25,
                    }}
                  >
                    {["#1F845A", "#0C66E4", "#CF9F02"].map((c) => (
                      <div
                        key={c}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: c,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1D2125" }}>
                    Empty workflow
                  </div>
                  <div style={{ fontSize: 12, color: "#626F86", lineHeight: 1.6 }}>
                    Click <strong>+ Add</strong> in the toolbar to place your first node.
                  </div>
                </div>
              </div>
            )}
          </ReactFlow>

          {/* Right panel priority: node edit > edge edit > JSON */}
          {selectedNode && (
            <NodeEditPanel
              node={selectedNode}
              scenarios={scenarios}
              onUpdate={onUpdateNode}
              onDelete={onDeleteNode}
              onClose={() => setSelectedNodeId(null)}
              onToggleScenario={onToggleNodeInScenario}
            />
          )}

          {!selectedNode && selectedEdge && (
            <EdgeEditPanel
              edge={selectedEdge}
              onUpdateLabel={onUpdateEdgeLabel}
              onClose={() => setSelectedEdgeId(null)}
            />
          )}

          {!selectedNode && !selectedEdge && jsonPanelOpen && (
            <JsonPanel
              nodes={nodes}
              edges={edges}
              onApply={(n, e) => {
                pushHistory();
                setNodes(n);
                setEdges(e);
              }}
            />
          )}
        </div>
      </div>

      {/* New Scenario Modal */}
      {scenarioModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(9,30,66,0.54)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setScenarioModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #DFE1E6",
              boxShadow: "0 8px 32px rgba(9,30,66,0.2)",
              width: 400,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1D2125", margin: "0 0 16px" }}>
              New Scenario
            </h2>

            <label style={{ display: "block", marginBottom: 14 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#44546F",
                  display: "block",
                  marginBottom: 4,
                  letterSpacing: "0.04em",
                }}
              >
                LABEL *
              </span>
              <input
                value={newScenarioLabel}
                onChange={(e) => setNewScenarioLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newScenarioLabel.trim()) onCreateScenario();
                  if (e.key === "Escape") setScenarioModalOpen(false);
                }}
                autoFocus
                placeholder="e.g. Happy Path, Error Case..."
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 4,
                  border: "2px solid #DFE1E6",
                  fontSize: 13,
                  color: "#1D2125",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0C66E4";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#DFE1E6";
                }}
              />
            </label>

            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#44546F",
                  display: "block",
                  marginBottom: 8,
                  letterSpacing: "0.04em",
                }}
              >
                COLOR
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {["#1F845A", "#0C66E4", "#C9372C", "#F18D13", "#6554C0", "#00B8D9"].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => setNewScenarioColor(color)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: color,
                        border:
                          newScenarioColor === color
                            ? `3px solid #1D2125`
                            : "3px solid transparent",
                        cursor: "pointer",
                        outline: newScenarioColor === color ? `2px solid ${color}` : "none",
                        outlineOffset: 2,
                        transition: "all 120ms",
                        flexShrink: 0,
                      }}
                    />
                  )
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setScenarioModalOpen(false)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  border: "1px solid #DFE1E6",
                  background: "transparent",
                  color: "#44546F",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onCreateScenario}
                disabled={!newScenarioLabel.trim()}
                style={{
                  padding: "6px 16px",
                  borderRadius: 4,
                  border: "none",
                  background: newScenarioLabel.trim() ? "#0C66E4" : "#DFE1E6",
                  color: newScenarioLabel.trim() ? "#fff" : "#8993A5",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: newScenarioLabel.trim() ? "pointer" : "not-allowed",
                  transition: "all 150ms",
                }}
              >
                Create Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

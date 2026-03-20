import { supabase } from "./client";
import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowScenario } from "@/components/workflows/types";

// ── DB row types ──────────────────────────────────────────────────────────────

interface WorkflowRow {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "draft" | "archived";
  updated_at: string;
}

interface NodeRow {
  id: string;
  workflow_id: string;
  node_key: string;
  type: string;
  position_x: number;
  position_y: number;
  data: Record<string, unknown>;
}

interface EdgeRow {
  id: string;
  workflow_id: string;
  edge_key: string;
  source_key: string;
  target_key: string;
  label: string | null;
  data: Record<string, unknown>;
}

interface ScenarioRow {
  id: string;
  workflow_id: string;
  label: string;
  color: string;
  node_keys: string[];
  edge_keys: string[];
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapNode(row: NodeRow): WorkflowNode {
  return {
    id: row.node_key,
    type: row.type as WorkflowNode["type"],
    position: { x: row.position_x, y: row.position_y },
    data: row.data,
  } as WorkflowNode;
}

function mapEdge(row: EdgeRow): WorkflowEdge {
  return {
    id: row.edge_key,
    source: row.source_key,
    target: row.target_key,
    ...(row.label ? { label: row.label } : {}),
    ...row.data,
  } as WorkflowEdge;
}

function mapScenario(row: ScenarioRow): WorkflowScenario {
  return {
    id: row.id,
    label: row.label,
    color: row.color,
    nodeIds: row.node_keys,
    edgeIds: row.edge_keys,
  };
}

function mapWorkflow(
  row: WorkflowRow,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  scenarios: WorkflowScenario[]
): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    status: row.status,
    updatedAt: row.updated_at.split("T")[0],
    nodes,
    edges,
    scenarios,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Returns all non-deleted workflows, each with its nodes/edges/scenarios. */
export async function listWorkflows(): Promise<Workflow[]> {
  const { data: rows, error } = await supabase
    .from("workflows")
    .select("id, name, description, status, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const ids = rows.map((r: WorkflowRow) => r.id);

  const [{ data: nodeRows, error: ne }, { data: edgeRows, error: ee }, { data: scenarioRows, error: se }] =
    await Promise.all([
      supabase
        .from("workflow_nodes")
        .select("id, workflow_id, node_key, type, position_x, position_y, data")
        .in("workflow_id", ids)
        .is("deleted_at", null),
      supabase
        .from("workflow_edges")
        .select("id, workflow_id, edge_key, source_key, target_key, label, data")
        .in("workflow_id", ids)
        .is("deleted_at", null),
      supabase
        .from("workflow_scenarios")
        .select("id, workflow_id, label, color, node_keys, edge_keys")
        .in("workflow_id", ids)
        .is("deleted_at", null),
    ]);

  if (ne) throw ne;
  if (ee) throw ee;
  if (se) throw se;

  return rows.map((row: WorkflowRow) => {
    const nodes = (nodeRows as NodeRow[] ?? []).filter((n) => n.workflow_id === row.id).map(mapNode);
    const edges = (edgeRows as EdgeRow[] ?? []).filter((e) => e.workflow_id === row.id).map(mapEdge);
    const scenarios = (scenarioRows as ScenarioRow[] ?? []).filter((s) => s.workflow_id === row.id).map(mapScenario);
    return mapWorkflow(row, nodes, edges, scenarios);
  });
}

/** Fetches a single workflow by UUID, including its nodes/edges/scenarios. */
export async function getWorkflow(id: string): Promise<Workflow | null> {
  const { data: row, error } = await supabase
    .from("workflows")
    .select("id, name, description, status, updated_at")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }

  const [{ data: nodeRows, error: ne }, { data: edgeRows, error: ee }, { data: scenarioRows, error: se }] =
    await Promise.all([
      supabase
        .from("workflow_nodes")
        .select("id, workflow_id, node_key, type, position_x, position_y, data")
        .eq("workflow_id", id)
        .is("deleted_at", null),
      supabase
        .from("workflow_edges")
        .select("id, workflow_id, edge_key, source_key, target_key, label, data")
        .eq("workflow_id", id)
        .is("deleted_at", null),
      supabase
        .from("workflow_scenarios")
        .select("id, workflow_id, label, color, node_keys, edge_keys")
        .eq("workflow_id", id)
        .is("deleted_at", null),
    ]);

  if (ne) throw ne;
  if (ee) throw ee;
  if (se) throw se;

  const nodes = (nodeRows as NodeRow[] ?? []).map(mapNode);
  const edges = (edgeRows as EdgeRow[] ?? []).map(mapEdge);
  const scenarios = (scenarioRows as ScenarioRow[] ?? []).map(mapScenario);

  return mapWorkflow(row as WorkflowRow, nodes, edges, scenarios);
}

/** Creates a new workflow row and returns its UUID. */
export async function createWorkflow(
  name: string,
  description: string
): Promise<string> {
  const { data, error } = await supabase
    .from("workflows")
    .insert({ name, description: description || null, status: "draft" })
    .select("id")
    .single();

  if (error) throw error;
  return (data as { id: string }).id;
}

/** Replaces all scenarios for a workflow (delete non-present, upsert present). */
export async function saveScenarios(
  workflowId: string,
  scenarios: WorkflowScenario[]
): Promise<void> {
  // Soft-delete all existing scenarios for this workflow
  const { error: delErr } = await supabase
    .from("workflow_scenarios")
    .update({ deleted_at: new Date().toISOString() })
    .eq("workflow_id", workflowId)
    .is("deleted_at", null);

  if (delErr) throw delErr;
  if (scenarios.length === 0) return;

  const rows = scenarios.map((s) => ({
    id: s.id.startsWith("scenario-") ? undefined : s.id, // let DB generate uuid for temp ids
    workflow_id: workflowId,
    label: s.label,
    color: s.color,
    node_keys: s.nodeIds,
    edge_keys: s.edgeIds,
  }));

  const { error: insErr } = await supabase.from("workflow_scenarios").insert(rows);
  if (insErr) throw insErr;
}

/** Soft-deletes a workflow by ID. */
export async function deleteWorkflow(id: string): Promise<void> {
  const { error } = await supabase
    .from("workflows")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Updates name, description, and status of a workflow. */
export async function updateWorkflow(
  id: string,
  name: string,
  description: string,
  status: "active" | "draft" | "archived"
): Promise<void> {
  const { error } = await supabase
    .from("workflows")
    .update({ name, description: description || null, status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Duplicates a workflow (nodes, edges, scenarios) and returns the new workflow ID. */
export async function duplicateWorkflow(source: Workflow): Promise<string> {
  const newId = await createWorkflow(`${source.name} (Copy)`, source.description);

  if (source.nodes.length > 0) {
    const nodeRows = source.nodes.map((n) => ({
      workflow_id: newId,
      node_key: n.id,
      type: n.type,
      position_x: n.position.x,
      position_y: n.position.y,
      data: n.data,
    }));
    const { error } = await supabase.from("workflow_nodes").insert(nodeRows);
    if (error) throw error;
  }

  if (source.edges.length > 0) {
    const edgeRows = source.edges.map((e) => ({
      workflow_id: newId,
      edge_key: e.id,
      source_key: e.source,
      target_key: e.target,
      label: typeof (e as { label?: unknown }).label === "string" ? (e as { label?: string }).label : null,
      data: {},
    }));
    const { error } = await supabase.from("workflow_edges").insert(edgeRows);
    if (error) throw error;
  }

  if (source.scenarios.length > 0) {
    const scenarioRows = source.scenarios.map((s) => ({
      workflow_id: newId,
      label: s.label,
      color: s.color,
      node_keys: s.nodeIds,
      edge_keys: s.edgeIds,
    }));
    const { error } = await supabase.from("workflow_scenarios").insert(scenarioRows);
    if (error) throw error;
  }

  return newId;
}

/** Upserts all nodes and edges for a workflow (replaces canvas state). */
export async function saveCanvas(
  workflowId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<void> {
  const nodeKeys = nodes.map((n) => n.id);
  const edgeKeys = edges.map((e) => e.id);

  // Hard-delete rows that are no longer in the canvas
  const deleteOps = [
    supabase
      .from("workflow_nodes")
      .delete()
      .eq("workflow_id", workflowId)
      .not("node_key", "in", `(${nodeKeys.length > 0 ? nodeKeys.map((k) => `"${k}"`).join(",") : '""'})`),
    supabase
      .from("workflow_edges")
      .delete()
      .eq("workflow_id", workflowId)
      .not("edge_key", "in", `(${edgeKeys.length > 0 ? edgeKeys.map((k) => `"${k}"`).join(",") : '""'})`),
  ];
  await Promise.all(deleteOps);

  // Upsert current nodes - resolves on (workflow_id, node_key) unique constraint
  if (nodes.length > 0) {
    const nodeRows = nodes.map((n) => ({
      workflow_id: workflowId,
      node_key: n.id,
      type: n.type,
      position_x: n.position.x,
      position_y: n.position.y,
      data: n.data,
    }));
    const { error } = await supabase
      .from("workflow_nodes")
      .upsert(nodeRows, { onConflict: "workflow_id,node_key" });
    if (error) throw error;
  }

  // Upsert current edges - resolves on (workflow_id, edge_key) unique constraint
  if (edges.length > 0) {
    const edgeRows = edges.map((e) => {
      const { id, source, target, label, type, style, animated, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius, sourceHandle, ...rest } = e as WorkflowEdge & {
        type?: string; style?: unknown; animated?: boolean; labelStyle?: unknown;
        labelBgStyle?: unknown; labelBgPadding?: unknown; labelBgBorderRadius?: unknown;
        sourceHandle?: string;
      };
      return {
        workflow_id: workflowId,
        edge_key: id,
        source_key: source,
        target_key: target,
        label: typeof label === "string" ? label : null,
        data: { type, style, animated, labelStyle, labelBgStyle, labelBgPadding, labelBgBorderRadius, sourceHandle, ...rest },
      };
    });
    const { error } = await supabase
      .from("workflow_edges")
      .upsert(edgeRows, { onConflict: "workflow_id,edge_key" });
    if (error) throw error;
  }

  // Touch updated_at on the workflow
  await supabase
    .from("workflows")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", workflowId);
}

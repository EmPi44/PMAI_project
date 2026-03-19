import type { Node, Edge } from "@xyflow/react";

export type ActorType = "human" | "automated" | "system";

export interface ActivityData extends Record<string, unknown> {
  label: string;
  actor: ActorType;
  description?: string;
  highlighted?: boolean;
  dimmed?: boolean;
  highlightColor?: string;
}

export interface DecisionData extends Record<string, unknown> {
  label: string;
  description?: string;
  highlighted?: boolean;
  dimmed?: boolean;
  highlightColor?: string;
}

export interface TerminalData extends Record<string, unknown> {
  label: string;
  highlighted?: boolean;
  dimmed?: boolean;
  highlightColor?: string;
}

export type ActivityNode = Node<ActivityData, "activity">;
export type DecisionNode = Node<DecisionData, "decision">;
export type StartNode = Node<TerminalData, "start">;
export type EndNode = Node<TerminalData, "end">;

export type WorkflowNode = ActivityNode | DecisionNode | StartNode | EndNode;

export interface WorkflowScenario {
  id: string;
  label: string;
  color: string;
  nodeIds: string[];
  edgeIds: string[];
}

export type WorkflowEdge = Edge;

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "archived";
  updatedAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  scenarios: WorkflowScenario[];
}

import Dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 64;
const DECISION_SIZE = 120;

export function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 60 });

  nodes.forEach((node) => {
    const isDecision = node.type === "decision";
    const isTerminal = node.type === "start" || node.type === "end";
    const w = isDecision ? DECISION_SIZE : NODE_WIDTH;
    const h = isDecision ? DECISION_SIZE : isTerminal ? 44 : NODE_HEIGHT;
    g.setNode(node.id, { width: w, height: h });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const pos = g.node(node.id);
      const isDecision = node.type === "decision";
      const isTerminal = node.type === "start" || node.type === "end";
      const w = isDecision ? DECISION_SIZE : NODE_WIDTH;
      const h = isDecision ? DECISION_SIZE : isTerminal ? 44 : NODE_HEIGHT;
      return {
        ...node,
        position: { x: pos.x - w / 2, y: pos.y - h / 2 },
      };
    }),
    edges,
  };
}

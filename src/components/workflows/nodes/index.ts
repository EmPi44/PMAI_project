import type { NodeTypes } from "@xyflow/react";
import { StartNode } from "./StartNode";
import { EndNode } from "./EndNode";
import { ActivityNode } from "./ActivityNode";
import { DecisionNode } from "./DecisionNode";

export const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  activity: ActivityNode,
  decision: DecisionNode,
};

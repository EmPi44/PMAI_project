import type { Workflow, WorkflowScenario } from "../types";
import { initialNodes, initialEdges, scenarios } from "./hrApplicationFlow";

export const workflows: Workflow[] = [
  {
    id: "hr-application",
    name: "HR Application Flow",
    description: "End-to-end process from application submission to hiring decision",
    status: "active",
    updatedAt: "2026-03-18",
    nodes: initialNodes,
    edges: initialEdges,
    scenarios,
  },
  {
    id: "onboarding",
    name: "Employee Onboarding",
    description: "Day-1 setup, documentation, and team integration process",
    status: "draft",
    updatedAt: "2026-03-15",
    nodes: [],
    edges: [],
    scenarios: [],
  },
];

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}

export function addWorkflow(workflow: Workflow): void {
  workflows.push(workflow);
}

export function updateWorkflowScenarios(id: string, newScenarios: WorkflowScenario[]): void {
  const w = workflows.find((wf) => wf.id === id);
  if (w) w.scenarios = newScenarios;
}

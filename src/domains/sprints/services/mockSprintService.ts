import type { Sprint } from "../types";

const SPRINTS: Sprint[] = [
  {
    id: "sprint-24",
    name: "NOVA Sprint 24",
    dateRange: "Mar 4 – Mar 18",
    projectKey: "NOVA",
    status: "active",
  },
];

const delay = (ms: number = 100) => new Promise((r) => setTimeout(r, ms));

export async function fetchSprints(projectKey?: string): Promise<Sprint[]> {
  await delay();
  if (projectKey) {
    return SPRINTS.filter((s) => s.projectKey === projectKey);
  }
  return [...SPRINTS];
}

export async function fetchSprint(id: string): Promise<Sprint | null> {
  await delay();
  return SPRINTS.find((s) => s.id === id) ?? null;
}

export function getSprintSync(id: string): Sprint | null {
  return SPRINTS.find((s) => s.id === id) ?? null;
}

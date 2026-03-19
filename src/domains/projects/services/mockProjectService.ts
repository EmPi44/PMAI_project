import type { Project } from "../types";

const PROJECT: Project = {
  key: "NOVA",
  name: "Nova Platform",
  type: "Software project",
};

const delay = (ms: number = 100) => new Promise((r) => setTimeout(r, ms));

export async function fetchProject(key: string): Promise<Project | null> {
  await delay();
  if (key === PROJECT.key) {
    return { ...PROJECT };
  }
  return null;
}

export function getProjectSync(): Project {
  return { ...PROJECT };
}

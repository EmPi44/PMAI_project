import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { TeamView } from "@/components/team/TeamView";
import type { Agent } from "@/components/team/types";

async function loadAgents(): Promise<Agent[]> {
  const dir = join(process.cwd(), ".claude", "agents");
  try {
    const files = await readdir(dir);
    const agents = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const content = await readFile(join(dir, f), "utf-8");
          return JSON.parse(content) as Agent;
        })
    );
    return agents;
  } catch {
    return [];
  }
}

export default async function TeamPage() {
  const agents = await loadAgents();
  return <TeamView initialAgents={agents} />;
}

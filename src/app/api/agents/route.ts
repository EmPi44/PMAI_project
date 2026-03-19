import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Agent } from "@/components/team/types";

const AGENTS_DIR = join(process.cwd(), ".claude", "agents");

async function ensureDir() {
  await mkdir(AGENTS_DIR, { recursive: true });
}

export async function GET() {
  await ensureDir();
  const files = await readdir(AGENTS_DIR).catch(() => [] as string[]);
  const agents: Agent[] = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const content = await readFile(join(AGENTS_DIR, f), "utf-8");
        return JSON.parse(content) as Agent;
      })
  );
  return Response.json(agents);
}

export async function POST(request: Request) {
  await ensureDir();
  const agent = (await request.json()) as Agent;
  await writeFile(
    join(AGENTS_DIR, `${agent.id}.json`),
    JSON.stringify(agent, null, 2)
  );
  return Response.json({ ok: true });
}

import { unlink } from "fs/promises";
import { join } from "path";

const AGENTS_DIR = join(process.cwd(), ".claude", "agents");

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/agents/[id]">
) {
  const { id } = await ctx.params;
  await unlink(join(AGENTS_DIR, `${id}.json`));
  return Response.json({ ok: true });
}

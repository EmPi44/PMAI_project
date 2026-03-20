import { unlink } from "fs/promises";
import { join } from "path";

const AGENTS_DIR = join(process.cwd(), ".claude", "agents");

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await unlink(join(AGENTS_DIR, `${id}.json`));
  return Response.json({ ok: true });
}

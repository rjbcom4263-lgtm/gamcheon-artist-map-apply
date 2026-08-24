import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../../admin/admin-auth";

export const runtime = "edge";
const allowedStatuses = new Set(["pending", "active", "suspended"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { status?: string };
  if (!body.status || !allowedStatuses.has(body.status)) return Response.json({ error: "올바르지 않은 상태입니다." }, { status: 400 });
  const result = await env.DB.prepare("UPDATE accounts SET status = ? WHERE id = ? AND role = 'artist'").bind(body.status, id).run();
  if (!result.meta.changes) return Response.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ ok: true, status: body.status });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  const result = await env.DB.prepare("UPDATE accounts SET status = 'deleted' WHERE id = ? AND role = 'artist'").bind(id).run();
  if (!result.meta.changes) return Response.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ ok: true });
}

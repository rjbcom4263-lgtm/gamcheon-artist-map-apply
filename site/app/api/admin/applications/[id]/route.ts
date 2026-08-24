import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../../admin/admin-auth";

export const runtime = "edge";
const allowedStatuses = new Set(["received", "reviewing", "approved", "hold", "rejected", "cancelled"]);

async function authorized() {
  return !!await requireAdmin();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await authorized()) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json() as { status?: string; reviewNote?: string };
  if (!body.status || !allowedStatuses.has(body.status)) return Response.json({ error: "올바르지 않은 상태입니다." }, { status: 400 });
  const note = typeof body.reviewNote === "string" ? body.reviewNote.trim().slice(0, 2000) : "";
  if ((body.status === "rejected" || body.status === "cancelled") && !note) return Response.json({ error: "처리 사유를 입력해주세요." }, { status: 400 });
  const current = await env.DB.prepare("SELECT payload_json FROM artist_applications WHERE id = ?").bind(id).first<{ payload_json: string }>();
  if (!current) return Response.json({ error: "신청서를 찾을 수 없습니다." }, { status: 404 });
  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(current.payload_json); } catch {}
  payload.adminReview = { status: body.status, note, processedAt: new Date().toISOString() };
  const payloadJson = JSON.stringify(payload);
  const result = await env.DB.prepare("UPDATE artist_applications SET status = ?, payload_json = ? WHERE id = ?").bind(body.status, payloadJson, id).run();
  if (!result.meta.changes) return Response.json({ error: "신청서를 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ ok: true, status: body.status, payload_json: payloadJson });
}

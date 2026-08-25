import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../../admin/admin-auth";

export const runtime = "edge";
const allowedStatuses = new Set(["pending", "active", "suspended"]);

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { status?: string; resetPassword?: boolean };
  if (body.resetPassword) {
    const temporaryPassword = "1234";
    const result = await env.DB.prepare("UPDATE accounts SET password_hash = ? WHERE id = ? AND role = 'artist'")
      .bind(await sha256Hex(temporaryPassword), id).run();
    if (!result.meta.changes) return Response.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ ok: true, temporaryPassword });
  }
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

import { adminCookie, createAdminSession, verifyAdminCredentials } from "../../../admin/admin-auth";
export const runtime = "edge";
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { username?: string; password?: string };
  if (!body.username || !body.password || !await verifyAdminCredentials(body.username, body.password)) return Response.json({ error: "로그인 정보가 올바르지 않습니다." }, { status: 401 });
  const session = await createAdminSession(body.username);
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": `${adminCookie.name}=${session}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${adminCookie.maxAge}` } });
}

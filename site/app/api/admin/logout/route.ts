import { adminCookie } from "../../../admin/admin-auth";
export const runtime = "edge";
export async function GET(request: Request) {
  return new Response(null, { status: 303, headers: { location: new URL("/admin/login", request.url).toString(), "set-cookie": `${adminCookie.name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` } });
}

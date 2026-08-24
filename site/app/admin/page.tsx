import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { requireAdmin } from "./admin-auth";
import AdminDashboard, { type Application } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS artist_applications (
    id TEXT PRIMARY KEY, artist_name TEXT NOT NULL, phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'received',
    payload_json TEXT NOT NULL, image_keys_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  const result = await env.DB.prepare("SELECT id, artist_name, phone, email, status, payload_json, image_keys_json, created_at FROM artist_applications ORDER BY created_at DESC LIMIT 1000").all<Application>();
  return <AdminDashboard initial={result.results || []} adminName={admin.username}/>;
}

import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { requireAdmin } from "./admin-auth";
import AdminDashboard, { type Account, type Application } from "./AdminDashboard";

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
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY NOT NULL,
    login_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'artist')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
    display_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  )`).run();
  const result = await env.DB.prepare("SELECT id, artist_name, phone, email, status, payload_json, image_keys_json, created_at FROM artist_applications ORDER BY created_at DESC LIMIT 1000").all<Application>();
  const accounts = await env.DB.prepare("SELECT id, login_id, role, status, display_name, phone, email, created_at, last_login_at FROM accounts WHERE role = 'artist' AND status != 'deleted' ORDER BY created_at DESC LIMIT 1000").all<Account>();
  return <AdminDashboard initial={result.results || []} initialAccounts={accounts.results || []} adminName={admin.displayName}/>;
}

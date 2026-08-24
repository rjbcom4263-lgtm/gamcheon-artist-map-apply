import { redirect } from "next/navigation";
import { requireAdmin } from "../admin-auth";
import LoginForm from "./LoginForm";
export const dynamic = "force-dynamic";
export default async function AdminLoginPage() {
  if (await requireAdmin()) redirect("/admin");
  return <main className="admin-login-page"><LoginForm/></main>;
}

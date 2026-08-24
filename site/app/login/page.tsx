import { redirect } from "next/navigation";
import { requireSession } from "../admin/admin-auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await requireSession();
  if (user?.role === "admin") redirect("/admin");
  if (user?.role === "artist") redirect("/artist");
  return <main className="admin-login-page"><LoginForm/></main>;
}

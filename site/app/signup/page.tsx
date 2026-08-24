import { redirect } from "next/navigation";
import { requireSession } from "../admin/admin-auth";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await requireSession();
  if (user?.role === "admin") redirect("/admin");
  if (user?.role === "artist") redirect("/artist");
  return <main className="admin-login-page"><SignupForm/></main>;
}

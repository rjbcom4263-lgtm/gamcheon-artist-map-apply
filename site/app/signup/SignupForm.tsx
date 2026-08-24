"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ loginId: "", password: "", displayName: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (name: keyof typeof form, value: string) => setForm((current) => ({ ...current, [name]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json().catch(() => ({})) as { error?: string; redirectTo?: string };
    setLoading(false);
    if (!response.ok) { setError(result.error || "회원가입을 완료하지 못했습니다."); return; }
    router.replace(result.redirectTo || "/artist");
    router.refresh();
  }

  return <form onSubmit={submit} className="admin-login-card signup-card">
    <div className="login-mark">작가</div><p>GAMCHEON ARTIST MAP</p><h1>작가 회원가입</h1><span>가입 후 운영자 확인을 거쳐 지도 공개 준비를 진행합니다.</span>
    <label>아이디<input value={form.loginId} onChange={(e) => update("loginId", e.target.value)} autoComplete="username" required autoFocus/></label>
    <label>비밀번호<input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" minLength={4} required/></label>
    <label>작가명<input value={form.displayName} onChange={(e) => update("displayName", e.target.value)} required/></label>
    <label>휴대전화<input value={form.phone} onChange={(e) => update("phone", e.target.value)} required/></label>
    <label>이메일<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}/></label>
    {error && <div className="login-error" role="alert">{error}</div>}
    <button disabled={loading}>{loading ? "가입 중..." : "회원가입"}</button>
    <div className="login-links"><a href="/login">이미 계정이 있어요</a><a href="/">신청 페이지</a></div>
  </form>;
}

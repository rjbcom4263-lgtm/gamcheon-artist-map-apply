"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ loginId, password }) });
    const result = await response.json().catch(() => ({})) as { error?: string; redirectTo?: string };
    setLoading(false);
    if (!response.ok) { setError(result.error || "로그인 정보를 다시 확인해주세요."); return; }
    router.replace(result.redirectTo || "/artist");
    router.refresh();
  }

  return <form onSubmit={submit} className="admin-login-card">
    <div className="login-mark">감천</div><p>GAMCHEON ARTIST MAP</p><h1>로그인</h1><span>운영자는 관리자 화면으로, 작가님은 작가 페이지로 이동합니다.</span>
    <label>아이디<input value={loginId} onChange={(e) => setLoginId(e.target.value)} autoComplete="username" required autoFocus/></label>
    <label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required/></label>
    {error && <div className="login-error" role="alert">{error}</div>}
    <button disabled={loading}>{loading ? "확인 중..." : "로그인"}</button>
    <div className="login-links"><a href="/signup">작가 회원가입</a><a href="/apply">신청 페이지</a></div>
  </form>;
}

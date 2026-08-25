"use client";

import { FormEvent, useState } from "react";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/artist/password", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);
    if (!response.ok) { setMessage(result.error || "비밀번호를 변경하지 못했습니다."); return; }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("비밀번호가 변경되었습니다.");
  }

  return <form className="artist-password-form" onSubmit={submit}>
    <div><p>ACCOUNT</p><h2>비밀번호 변경</h2><span>운영자가 임시 비밀번호로 초기화한 뒤 작가님이 직접 새 비밀번호로 바꿀 수 있습니다.</span></div>
    <label>현재 비밀번호<input type="password" value={currentPassword} minLength={4} onChange={(event) => setCurrentPassword(event.target.value)} required/></label>
    <label>새 비밀번호<input type="password" value={newPassword} minLength={4} onChange={(event) => setNewPassword(event.target.value)} required/></label>
    {message && <strong>{message}</strong>}
    <button disabled={saving}>{saving ? "변경 중..." : "비밀번호 변경"}</button>
  </form>;
}

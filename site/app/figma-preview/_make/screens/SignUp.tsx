import { useState } from "react";
import type { ChangeEvent } from "react";

import type { Screen } from "../App";

interface Props {
  onNavigate: (s: Screen) => void;
}

export default function SignUp({ onNavigate }: Props) {
  const [form, setForm] = useState({
    userId: "", password: "", passwordCheck: "",
    artistName: "", phone: "", email: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  function set(k: keyof typeof form) {
    return (e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5"
        style={{ background: "var(--background)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(43,85,64,0.1)" }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M7 18l8 8L29 10" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-center mb-2" style={{ color: "var(--primary)" }}>가입 완료!</h2>
        <p className="text-sm text-center leading-relaxed mb-8" style={{ color: "var(--muted-foreground)" }}>
          감천 작가 지도 작가 계정이 생성되었습니다.
        </p>
        <button onClick={() => onNavigate("login")}
          className="w-full py-3.5 rounded-xl font-semibold text-sm"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          로그인하러 가기
        </button>
      </div>
    );
  }

  const fields: { key: keyof typeof form; label: string; type?: string; placeholder: string; required: boolean }[] = [
    { key: "userId", label: "아이디", placeholder: "영문, 숫자 조합 4-20자", required: true },
    { key: "password", label: "비밀번호", type: "password", placeholder: "8자 이상, 특수문자 포함", required: true },
    { key: "passwordCheck", label: "비밀번호 확인", type: "password", placeholder: "비밀번호를 다시 입력하세요", required: true },
    { key: "artistName", label: "작가명", placeholder: "활동명 또는 본명", required: true },
    { key: "phone", label: "연락처", placeholder: "010-0000-0000", required: true },
    { key: "email", label: "이메일", type: "email", placeholder: "이메일 주소", required: true },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <div className="flex items-center px-5 pt-12 pb-4"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <button onClick={() => onNavigate("login")} className="p-1 -ml-1" style={{ color: "var(--foreground)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-semibold text-sm ml-2" style={{ color: "var(--foreground)" }}>작가 계정 만들기</h1>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar px-5 py-5">
        <div className="flex flex-col gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                {f.label}
                {f.required && <span style={{ color: "#C0392B", marginLeft: "3px" }}>*</span>}
              </label>
              <input type={f.type || "text"} value={form[f.key]} onChange={set(f.key)}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "'Noto Sans KR', sans-serif" }} />
              {f.key === "passwordCheck" && form.password && form.passwordCheck && form.password !== form.passwordCheck && (
                <p className="text-xs mt-1" style={{ color: "#C0392B" }}>비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
          ))}

          {/* Privacy */}
          <div className="p-4 rounded-xl mt-1" style={{ background: "rgba(43,85,64,0.04)", border: "1px solid var(--border)" }}>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--muted-foreground)" }}>
              감천 작가 지도는 작가 참여 심사 및 지도 게재를 위해 제출된 정보를 수집·활용합니다.
              수집된 개인정보는 해당 목적 외에 사용되지 않습니다.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setAgreed(!agreed)}
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: agreed ? "var(--primary)" : "transparent", border: `1.5px solid ${agreed ? "var(--primary)" : "#bbb"}` }}>
                {agreed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>}
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>개인정보 수집·이용에 동의합니다 (필수)</span>
            </label>
          </div>

          <button onClick={() => agreed && setDone(true)} disabled={!agreed}
            className="w-full py-3.5 rounded-xl font-semibold text-sm mt-1 transition-all active:scale-98"
            style={{
              background: agreed ? "var(--primary)" : "var(--muted)",
              color: agreed ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}>
            계정 만들기
          </button>

          <p className="text-center text-sm pb-4">
            <span style={{ color: "var(--muted-foreground)" }}>이미 계정이 있으신가요? </span>
            <button onClick={() => onNavigate("login")} className="font-semibold" style={{ color: "var(--primary)" }}>로그인</button>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import type { Screen, UserRole } from "../App";

interface Props {
  onNavigate: (s: Screen) => void;
  onLogin: (role: UserRole) => void;
}

export default function Login({ onNavigate, onLogin }: Props) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !pw.trim()) {
      setError("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // 관리자 계정: admin / admin
      if (id === "admin" && pw === "admin") {
        onLogin("admin");
      } else if (id.length > 0 && pw.length > 0) {
        // 작가 계정
        onLogin("artist");
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    }, 600);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* 헤더 */}
      <div
        className="flex items-center px-5 pt-12 pb-4"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
      >
        <button onClick={() => onNavigate("home")} className="p-1 -ml-1" style={{ color: "var(--foreground)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="font-semibold text-sm ml-2" style={{ color: "var(--foreground)" }}>로그인</h1>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-10">

        {/* 로고 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "var(--primary)", boxShadow: "0 6px 24px rgba(43,85,64,0.22)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21v-5h6v5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-display font-bold text-base" style={{ color: "var(--primary)" }}>감천 작가 지도</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>GAMCHEON ARTIST MAP</p>
        </div>

        {/* 공용 로그인 안내 배너 */}
        <div
          className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl mb-6"
          style={{ background: "rgba(43,85,64,0.06)", border: "1px solid rgba(43,85,64,0.14)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--primary)" }}>
              작가 및 운영자 공용 로그인
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              작가 계정으로 로그인하면 <strong style={{ color: "var(--foreground)" }}>내 정보 화면</strong>으로,
              운영자 계정으로 로그인하면 <strong style={{ color: "var(--foreground)" }}>운영자 관리 화면</strong>으로 이동합니다.
            </p>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
              아이디
            </label>
            <input
              value={id}
              onChange={e => { setId(e.target.value); setError(""); }}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: "var(--card)",
                border: `1.5px solid ${error ? "rgba(192,57,43,0.4)" : "var(--border)"}`,
                color: "var(--foreground)",
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
              비밀번호
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(""); }}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: "var(--card)",
                border: `1.5px solid ${error ? "rgba(192,57,43,0.4)" : "var(--border)"}`,
                color: "var(--foreground)",
                fontFamily: "'Noto Sans KR', sans-serif",
              }}
            />
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: "#B84A2E" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm mt-1 transition-all active:scale-98"
            style={{
              background: loading ? "var(--muted)" : "var(--primary)",
              color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>처음 방문하셨나요?</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <button
          onClick={() => onNavigate("signup")}
          className="w-full py-3.5 rounded-xl font-medium text-sm transition-all active:scale-98"
          style={{ background: "transparent", color: "var(--primary)", border: "1.5px solid rgba(43,85,64,0.35)" }}
        >
          작가 계정 만들기
        </button>

        <p className="text-center text-xs mt-4" style={{ color: "var(--muted-foreground)" }}>
          아이디 찾기 &middot; 비밀번호 재설정
        </p>

        <div className="mt-auto pt-10 pb-6">
          <p className="text-center text-xs leading-relaxed"
            style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
            테스트 · 운영자 계정: admin / admin
          </p>
        </div>
      </div>
    </div>
  );
}

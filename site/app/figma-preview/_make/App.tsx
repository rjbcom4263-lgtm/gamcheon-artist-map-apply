import { useState } from "react";
import Home from "./screens/Home";
import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import ArtistApplication from "./screens/ArtistApplication";
import ArtistMyInfo from "./screens/ArtistMyInfo";
import MapPreview from "./screens/MapPreview";
import AdminDashboard from "./screens/AdminDashboard";
import BottomTabBar from "./components/BottomTabBar";

export type Screen = "home" | "apply" | "map" | "myinfo" | "login" | "signup" | "admin";
export type UserRole = "guest" | "artist" | "admin";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [role, setRole] = useState<UserRole>("guest");

  function navigate(s: Screen) {
    // 관리자가 아닌 사용자는 admin 화면 접근 불가
    if (s === "admin" && role !== "admin") {
      setScreen("login");
      return;
    }
    if (s === "myinfo" && role === "guest") {
      setScreen("myinfo");
      return;
    }
    setScreen(s);
  }

  function handleLogin(r: UserRole) {
    setRole(r);
    if (r === "admin") {
      setScreen("admin");
    } else {
      setScreen("myinfo");
    }
  }

  function handleLogout() {
    setRole("guest");
    setScreen("home");
  }

  const isAdminView = screen === "admin";

  return (
    <div
      className="flex justify-center min-h-screen"
      style={{ background: "#C0BDB1" }}
    >
      <div
        className="relative w-full max-w-sm flex flex-col overflow-hidden"
        style={{ background: "var(--background)", height: "100dvh" }}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {screen === "home"   && <Home onNavigate={navigate} role={role} />}
          {screen === "login"  && <Login onNavigate={navigate} onLogin={handleLogin} />}
          {screen === "signup" && <SignUp onNavigate={navigate} />}
          {screen === "apply"  && <ArtistApplication onNavigate={navigate} />}
          {screen === "myinfo" && role === "guest" && <LoginRequired onNavigate={navigate} />}
          {screen === "myinfo" && role !== "guest" && <ArtistMyInfo onNavigate={navigate} role={role} onLogout={handleLogout} />}
          {screen === "map"    && <MapPreview onNavigate={navigate} />}
          {screen === "admin"  && role === "admin" && (
            <AdminDashboard onLogout={handleLogout} />
          )}
          {screen === "admin"  && role !== "admin" && (
            // 비인가 접근 시 로그인으로 리다이렉트
            <Login onNavigate={navigate} onLogin={handleLogin} />
          )}
        </div>

        {/* 관리자 화면에서는 일반 탭바 숨김 */}
        {!isAdminView && (
          <BottomTabBar current={screen} onNavigate={navigate} role={role} />
        )}
      </div>
    </div>
  );
}

function LoginRequired({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <div className="flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <h1 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>내 정보</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-20">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
          style={{ background: "rgba(43,85,64,0.1)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="var(--primary)" strokeWidth="1.6" />
            <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-center mb-2" style={{ color: "var(--primary)" }}>
          로그인이 필요합니다
        </h2>
        <p className="text-sm text-center leading-relaxed mb-8" style={{ color: "var(--muted-foreground)" }}>
          작가님의 신청 현황과 제출 정보를 확인하려면<br />작가 계정으로 로그인해 주세요.
        </p>
        <button onClick={() => onNavigate("login")}
          className="w-full py-3.5 rounded-xl font-semibold text-sm mb-2.5"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          로그인
        </button>
        <button onClick={() => onNavigate("signup")}
          className="w-full py-3.5 rounded-xl font-medium text-sm"
          style={{ background: "var(--card)", color: "var(--primary)", border: "1px solid var(--border)" }}>
          작가 회원가입
        </button>
      </div>
    </div>
  );
}

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
          {screen === "myinfo" && <ArtistMyInfo onNavigate={navigate} role={role} />}
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

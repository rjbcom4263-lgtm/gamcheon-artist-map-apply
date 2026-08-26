import type { Screen, UserRole } from "../App";

const tabs: {
  id: Screen;
  label: string;
  icon: (active: boolean) => JSX.Element;
}[] = [
  {
    id: "home",
    label: "홈",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "apply",
    label: "신청",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="4" y="3" width="16" height="18" rx="2"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.1 : 0}
        />
        <path
          d="M8 8h8M8 12h5M12 16h4"
          stroke={active ? "white" : "currentColor"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "map",
    label: "지도",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <circle
          cx="12" cy="9" r="2.5"
          stroke={active ? "white" : "currentColor"}
          strokeWidth={active ? 1.5 : 1.5}
          fill={active ? "white" : "none"}
          fillOpacity={active ? 0.3 : 0}
        />
      </svg>
    ),
  },
  {
    id: "myinfo",
    label: "내정보",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <path
          d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

interface Props {
  current: Screen;
  onNavigate: (s: Screen) => void;
  role: UserRole;
}

export default function BottomTabBar({ current, onNavigate, role: _role }: Props) {
  const mainScreens: Screen[] = ["home", "apply", "map", "myinfo", "login"];
  if (!mainScreens.includes(current)) return null;

  // 내정보 탭은 항상 표시 (비로그인 시 내정보 탭 누르면 로그인으로 이동은 App에서 처리)
  return (
    <nav
      className="flex-shrink-0 flex justify-around items-end w-full"
      style={{
        background: "rgba(250,247,240,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
        paddingTop: "10px",
        paddingBottom: "max(14px, env(safe-area-inset-bottom))",
      }}
    >
      {tabs.map((tab) => {
        const active = current === tab.id || (tab.id === "myinfo" && current === "login");
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center gap-1 px-4 transition-all duration-200"
            style={{ color: active ? "var(--primary)" : "#A09E92" }}
          >
            {tab.icon(active)}
            <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

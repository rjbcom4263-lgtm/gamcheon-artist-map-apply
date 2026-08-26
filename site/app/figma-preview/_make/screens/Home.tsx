import type { Screen, UserRole } from "../App";

interface Props {
  onNavigate: (s: Screen) => void;
  role: UserRole;
}

const VILLAGE_IMG = "https://images.unsplash.com/photo-1786365852056-a90ed6e90a7e?w=700&h=420&fit=crop&auto=format";

const benefits = [
  {
    num: "01",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="var(--primary)" strokeWidth="1.5"/>
        <circle cx="12" cy="9" r="2.5" stroke="var(--primary)" strokeWidth="1.5"/>
      </svg>
    ),
    title: "작가님의 공간이 지도가 됩니다",
    desc: "감천문화마을을 찾는 방문객에게 작가님의 이름과 작업 공간이 정식으로 소개됩니다.",
    accentBg: "rgba(43,85,64,0.07)",
    accentBorder: "rgba(43,85,64,0.14)",
  },
  {
    num: "02",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--apricot)" strokeWidth="1.5"/>
        <path d="M3 15l5-5 4 4 3-3 6 6" stroke="var(--apricot)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="var(--apricot)"/>
      </svg>
    ),
    title: "작품을 이야기로 전합니다",
    desc: "작가님이 직접 쓴 소개글과 대표 작품 5점이 방문객을 맞이합니다.",
    accentBg: "rgba(230,145,74,0.06)",
    accentBorder: "rgba(230,145,74,0.16)",
  },
  {
    num: "03",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "언제든 수정하고 갱신할 수 있습니다",
    desc: "승인 후에도 정보를 수정 요청할 수 있어 항상 최신 상태로 유지됩니다.",
    accentBg: "rgba(91,168,160,0.06)",
    accentBorder: "rgba(91,168,160,0.16)",
  },
];

const steps = [
  { n: "1", label: "참여 신청", sub: "온라인 신청서 작성" },
  { n: "2", label: "운영팀 검토", sub: "제출 내용 확인" },
  { n: "3", label: "승인 안내", sub: "이메일로 결과 통보" },
  { n: "4", label: "지도 공개", sub: "감천 작가 지도 등재" },
];

export default function Home({ onNavigate, role }: Props) {
  const isLoggedIn = role === "artist";

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--background)" }}>

      {/* 상단 로고바 */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--primary)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21v-5h6v5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold leading-none" style={{ fontSize: "13px", color: "var(--primary)" }}>감천 작가 지도</p>
            <p style={{ fontSize: "8.5px", color: "var(--muted-foreground)", letterSpacing: "0.12em", marginTop: "2px" }}>GAMCHEON ARTIST MAP</p>
          </div>
        </div>

        {/* 비로그인 시 로그인 버튼, 로그인 시 내정보 바로가기 */}
        {!isLoggedIn ? (
          <button
            onClick={() => onNavigate("login")}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{ color: "var(--primary)", border: "1px solid rgba(43,85,64,0.35)" }}
          >
            로그인
          </button>
        ) : (
          <button
            onClick={() => onNavigate("myinfo")}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{ background: "rgba(43,85,64,0.08)", color: "var(--primary)" }}
          >
            내 신청 현황
          </button>
        )}
      </div>

      {/* 히어로 이미지 */}
      <div className="relative overflow-hidden" style={{ height: "240px" }}>
        <img
          src={VILLAGE_IMG}
          alt="감천문화마을 전경"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(28,48,33,0.9) 0%, rgba(28,48,33,0.6) 50%, rgba(28,48,33,0.15) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-7">
          <p className="text-xs font-medium mb-2 tracking-widest" style={{ color: "rgba(217,168,50,0.88)" }}>
            작가 참여 안내
          </p>
          <h1 className="font-display font-bold leading-snug" style={{ fontSize: "23px", color: "#FAF7F0" }}>
            감천의 예술을<br />함께 기록합니다
          </h1>
          <p className="mt-2.5 leading-relaxed" style={{ color: "rgba(245,241,232,0.68)", fontSize: "12.5px" }}>
            감천문화마을 작가·공방·예술 공간을<br />
            하나의 지도에 담아 더 많은 이들에게 전합니다.
          </p>
        </div>
      </div>

      {/* 메인 CTA */}
      <div className="px-5 mt-5 flex flex-col gap-2.5">
        <button
          onClick={() => onNavigate("apply")}
          className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-98"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            boxShadow: "0 4px 20px rgba(43,85,64,0.25)",
          }}
        >
          작가 참여 신청하기
        </button>
        {!isLoggedIn && (
          <button
            onClick={() => onNavigate("login")}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all active:scale-98"
            style={{
              background: "transparent",
              color: "var(--primary)",
              border: "1.5px solid rgba(43,85,64,0.28)",
            }}
          >
            이미 신청하셨나요? 로그인
          </button>
        )}
      </div>

      {/* 참여 대상 안내 */}
      <div className="mx-5 mt-4 px-4 py-3.5 rounded-xl flex items-start gap-3"
        style={{ background: "rgba(217,168,50,0.09)", border: "1px solid rgba(217,168,50,0.24)" }}>
        <span style={{ fontSize: "15px", flexShrink: 0, marginTop: "1px" }}>✦</span>
        <p className="text-xs leading-relaxed" style={{ color: "#6B5810" }}>
          <strong>감천문화마을에서 활동 중인 작가·공방·예술 공간</strong>이라면
          누구든 무료로 참여하실 수 있습니다.
          신청 후 운영팀 검토를 거쳐 지도에 게재됩니다.
        </p>
      </div>

      {/* 구분선 */}
      <div className="mx-5 mt-7 mb-6 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>참여하면 달라지는 것</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* 혜택 3가지 */}
      <div className="px-5 flex flex-col gap-3">
        {benefits.map((b) => (
          <div
            key={b.num}
            className="flex gap-4 p-4 rounded-xl"
            style={{ background: b.accentBg, border: `1px solid ${b.accentBorder}` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(255,255,255,0.6)" }}>
              {b.icon}
            </div>
            <div>
              <p className="font-semibold text-sm mb-1 leading-snug" style={{ color: "var(--foreground)" }}>{b.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 신청 흐름 */}
      <div className="px-5 mt-8">
        <h2 className="font-display font-bold text-base mb-5" style={{ color: "var(--foreground)" }}>
          신청부터 지도 등재까지
        </h2>
        <div className="flex items-start">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {i < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-px"
                  style={{ background: "var(--border)", zIndex: 0 }} />
              )}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center z-10 mb-2 font-bold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: "13px",
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              >
                {s.n}
              </div>
              <p className="text-[11px] font-semibold text-center leading-tight mb-0.5"
                style={{ color: "var(--foreground)" }}>{s.label}</p>
              <p className="text-[10px] text-center leading-tight"
                style={{ color: "var(--muted-foreground)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 지도 보기 — 보조 섹션 */}
      <div className="mx-5 mt-8 p-4 rounded-xl flex items-start gap-3"
        style={{ background: "rgba(91,168,160,0.06)", border: "1px solid rgba(91,168,160,0.18)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            stroke="var(--teal)" strokeWidth="1.5"/>
          <circle cx="12" cy="9" r="2.5" stroke="var(--teal)" strokeWidth="1.5"/>
        </svg>
        <div className="flex-1">
          <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--teal)" }}>감천 작가 지도 미리보기</p>
          <p className="text-xs leading-relaxed mb-2.5" style={{ color: "var(--muted-foreground)" }}>
            현재 <strong style={{ color: "var(--foreground)" }}>38개</strong> 공간이 등록되어 있습니다.
            승인된 작가님의 공간은 지도 카드로 공개됩니다.
          </p>
          <button
            onClick={() => onNavigate("map")}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: "var(--teal)" }}
          >
            지도 보기
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 푸터 */}
      <div className="px-5 mt-8 pt-5 pb-2" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
          문의 · 감천 작가 지도 운영팀
        </p>
        <p className="text-xs text-center mt-1" style={{ color: "var(--muted-foreground)", opacity: 0.65 }}>
          gamcheon.artist.map@gmail.com
        </p>
      </div>
    </div>
  );
}

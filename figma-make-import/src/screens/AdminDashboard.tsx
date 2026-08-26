import { useState } from "react";

interface Props {
  onLogout: () => void;
}

/* ── 타입 ── */
type AppStatus = "pending" | "review" | "approved" | "hold" | "rejected";
type AdminMenu = "list" | "accounts" | "images" | "settings";

interface Application {
  id: number;
  name: string;
  field: string;
  workshop: string;
  date: string;
  status: AppStatus;
  img: string;
  email: string;
  address: string;
  visit: string;
  oneliner: string;
  memo: string;
  artworks: { title: string; img: string; sale: boolean }[];
}

/* ── 상태 설정 ── */
const STATUS: Record<AppStatus, { label: string; bg: string; color: string }> = {
  pending:  { label: "대기",    bg: "rgba(91,168,160,0.13)",  color: "#2B6B66" },
  review:   { label: "검토 중", bg: "rgba(217,168,50,0.15)",  color: "#7A5B10" },
  approved: { label: "승인",    bg: "rgba(43,85,64,0.11)",    color: "#1E4A31" },
  hold:     { label: "보류",    bg: "rgba(120,100,60,0.12)",  color: "#5C4A20" },
  rejected: { label: "반려",    bg: "rgba(192,57,43,0.11)",   color: "#7A2E20" },
};

const MOCK: Application[] = [
  {
    id: 1, name: "홍길동", field: "도예·공예", workshop: "바람빛 도예", date: "2025.08.26",
    status: "review", email: "hong@art.kr", address: "부산 사하구 감천2동 203-1",
    visit: "방문 예약 가능", oneliner: "흙과 불로 감천의 이야기를 빚습니다.",
    memo: "방문 가능 시간 정보를 추가해주세요.",
    img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=160&h=160&fit=crop&auto=format",
    artworks: [
      { title: "감천 항아리", img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop&auto=format", sale: true },
      { title: "빚어낸 오후", img: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop&auto=format", sale: false },
    ],
  },
  {
    id: 2, name: "김감천", field: "유리공예", workshop: "빛의 유리 공방", date: "2025.08.25",
    status: "approved", email: "kim@glass.kr", address: "부산 사하구 감천1동 55-4",
    visit: "오픈 스튜디오", oneliner: "빛과 색으로 감천을 담습니다.",
    memo: "",
    img: "https://images.unsplash.com/photo-1509822929464-92b183d7d968?w=160&h=160&fit=crop&auto=format",
    artworks: [
      { title: "빛의 조각", img: "https://images.unsplash.com/photo-1509822929464-92b183d7d968?w=200&h=200&fit=crop&auto=format", sale: true },
    ],
  },
  {
    id: 3, name: "이하늘", field: "회화", workshop: "하늘 색채 화실", date: "2025.08.24",
    status: "hold", email: "lee@paint.kr", address: "부산 사하구 감천2동 67-2",
    visit: "사전 연락 필수", oneliner: "감천의 하늘과 골목을 수채화로 담습니다.",
    memo: "작품 이미지 해상도를 높여주세요.",
    img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=160&h=160&fit=crop&auto=format",
    artworks: [
      { title: "감천의 봄", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop&auto=format", sale: false },
    ],
  },
  {
    id: 4, name: "박예술", field: "사진", workshop: "감천 갤러리 스튜디오", date: "2025.08.23",
    status: "rejected", email: "park@photo.kr", address: "부산 사하구 감천3동 91-3",
    visit: "전시 기간 한정", oneliner: "렌즈로 기록하는 감천문화마을의 시간.",
    memo: "주소 정보가 불명확합니다. 정확한 주소로 재신청 부탁드립니다.",
    img: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=160&h=160&fit=crop&auto=format",
    artworks: [
      { title: "골목의 오후", img: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=200&h=200&fit=crop&auto=format", sale: true },
    ],
  },
  {
    id: 5, name: "최섬유", field: "섬유·자수", workshop: "바늘과 실", date: "2025.08.22",
    status: "pending", email: "choi@textile.kr", address: "부산 사하구 감천1동 12-8",
    visit: "방문 예약 가능", oneliner: "실 한 올로 감천의 이야기를 수놓습니다.",
    memo: "",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&h=160&fit=crop&auto=format",
    artworks: [],
  },
];

const FILTER_OPTIONS: { key: "all" | AppStatus; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "대기" },
  { key: "review", label: "검토 중" },
  { key: "hold", label: "보류" },
  { key: "approved", label: "승인" },
  { key: "rejected", label: "반려" },
];

/* ── 컴포넌트 ── */
export default function AdminDashboard({ onLogout }: Props) {
  const [menu, setMenu] = useState<AdminMenu>("list");
  const [apps, setApps] = useState<Application[]>(MOCK);
  const [filter, setFilter] = useState<"all" | AppStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [memo, setMemo] = useState("");

  const selected = apps.find(a => a.id === selectedId);

  function changeStatus(id: number, s: AppStatus) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: s } : a));
  }
  function saveMemo(id: number, m: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, memo: m } : a));
  }
  function deleteApp(id: number) {
    setApps(prev => prev.filter(a => a.id !== id));
    setSelectedId(null);
  }

  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === "pending").length,
    review: apps.filter(a => a.status === "review").length,
    hold: apps.filter(a => a.status === "hold").length,
    approved: apps.filter(a => a.status === "approved").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  const filtered = apps.filter(a => {
    const matchFilter = filter === "all" || a.status === filter;
    const matchSearch = !search || a.name.includes(search) || a.workshop.includes(search);
    return matchFilter && matchSearch;
  });

  /* ── 상세 화면 ── */
  if (selectedId !== null && selected) {
    const cfg = STATUS[selected.status];
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
        {/* 상세 헤더 */}
        <div
          className="flex items-center justify-between px-5 pt-12 pb-4"
          style={{ background: "var(--primary)" }}
        >
          <button onClick={() => setSelectedId(null)} className="p-1 -ml-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="rgba(245,241,232,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-semibold text-sm" style={{ color: "#FAF7F0" }}>신청 상세</span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: cfg.bg, color: cfg.color, backdropFilter: "blur(8px)" }}>
            {cfg.label}
          </span>
        </div>

        <div className="flex-1 overflow-auto no-scrollbar px-5 py-5 flex flex-col gap-4">

          {/* 작가 기본 카드 */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--muted)" }}>
              {selected.img && <img src={selected.img} alt={selected.name} className="w-full h-full object-cover"/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>{selected.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {selected.field} · {selected.workshop}
              </p>
              <p className="text-xs mt-1 italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                "{selected.oneliner}"
              </p>
            </div>
          </div>

          {/* 신청 정보 */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="px-4 py-2.5" style={{ background: "rgba(43,85,64,0.04)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>신청 정보</span>
            </div>
            {[
              { label: "이메일",   value: selected.email },
              { label: "주소",     value: selected.address },
              { label: "방문 방식", value: selected.visit },
              { label: "신청일",   value: selected.date },
            ].map(row => (
              <div key={row.label} className="flex px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs w-20 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                <span className="text-xs flex-1" style={{ color: "var(--foreground)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* 대표 작품 */}
          {selected.artworks.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ background: "rgba(43,85,64,0.04)", borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                  대표 작품 ({selected.artworks.length}점)
                </span>
                <button className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--teal)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v14M5 11l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  전체 다운로드
                </button>
              </div>
              {selected.artworks.map((art, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < selected.artworks.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--muted)" }}>
                    {art.img && <img src={art.img} alt={art.title} className="w-full h-full object-cover"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{art.title}</p>
                    {art.sale && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(230,145,74,0.12)", color: "var(--apricot)" }}>판매 가능</span>
                    )}
                  </div>
                  <button className="p-2" style={{ color: "var(--muted-foreground)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v14M5 11l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 운영자 메모 */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="px-4 py-2.5 flex items-center justify-between"
              style={{ background: "rgba(43,85,64,0.04)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>운영자 메모</span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>작가에게 표시됩니다</span>
            </div>
            <div className="p-4">
              <textarea
                defaultValue={selected.memo}
                onChange={e => setMemo(e.target.value)}
                onBlur={() => saveMemo(selected.id, memo || selected.memo)}
                placeholder="수정 요청 사항이나 안내 내용을 입력해 주세요."
                rows={3}
                className="w-full px-3.5 py-3 rounded-xl text-sm resize-none"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  lineHeight: 1.7,
                }}
              />
            </div>
          </div>

          {/* 처리 버튼 — 승인 / 검토 중 / 보류 / 반려 / 삭제 */}
          <div>
            <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--muted-foreground)" }}>신청 처리</p>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { status: "approved" as AppStatus, label: "승인하기",   bg: "var(--primary)", color: "var(--primary-foreground)", border: "none" },
                { status: "review"   as AppStatus, label: "검토 중으로", bg: "rgba(91,168,160,0.1)", color: "var(--teal)", border: "1.5px solid rgba(91,168,160,0.3)" },
                { status: "hold"     as AppStatus, label: "보류",        bg: "rgba(120,100,60,0.08)", color: "#5C4A20", border: "1.5px solid rgba(120,100,60,0.2)" },
                { status: "rejected" as AppStatus, label: "반려하기",   bg: "rgba(192,57,43,0.07)", color: "#B84A2E", border: "1.5px solid rgba(192,57,43,0.2)" },
              ] as const).map(btn => (
                <button
                  key={btn.status}
                  onClick={() => changeStatus(selected.id, btn.status)}
                  className="py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-98"
                  style={{ background: btn.bg, color: btn.color, border: btn.border }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => deleteApp(selected.id)}
              className="w-full mt-2.5 py-3 rounded-xl font-medium text-sm transition-all"
              style={{ background: "transparent", color: "var(--muted-foreground)", border: "1.5px solid var(--border)" }}
            >
              신청 삭제
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 관리자 메인 화면 ── */
  return (
    <div className="min-h-screen pb-10 flex flex-col" style={{ background: "var(--background)" }}>

      {/* 관리자 전용 헤더 */}
      <div style={{ background: "var(--primary)" }}>
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {/* 잠금 아이콘으로 관리자 전용 느낌 강조 */}
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "rgba(245,241,232,0.15)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(245,241,232,0.7)" strokeWidth="1.5"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(245,241,232,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-xs font-medium" style={{ color: "rgba(245,241,232,0.55)", letterSpacing: "0.1em" }}>
                ADMIN · 운영자 전용
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ background: "rgba(245,241,232,0.1)", color: "rgba(245,241,232,0.75)", border: "1px solid rgba(245,241,232,0.16)" }}
            >
              로그아웃
            </button>
          </div>
          <h1 className="font-display font-bold text-2xl mt-1" style={{ color: "#FAF7F0" }}>운영자 관리</h1>
        </div>

        {/* 현황 요약 */}
        <div className="grid grid-cols-5 gap-1.5 px-5 pb-4">
          {[
            { label: "전체",   count: counts.all,      color: "rgba(245,241,232,0.85)" },
            { label: "대기",   count: counts.pending,  color: "rgba(184,221,217,0.85)" },
            { label: "검토",   count: counts.review,   color: "rgba(217,168,50,0.8)" },
            { label: "보류",   count: counts.hold,     color: "rgba(200,175,120,0.85)" },
            { label: "승인",   count: counts.approved, color: "rgba(184,221,217,0.9)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl py-2.5 text-center"
              style={{ background: "rgba(245,241,232,0.07)" }}>
              <p className="font-display font-bold text-lg leading-none" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[9px] mt-1" style={{ color: "rgba(245,241,232,0.45)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* 관리자 메뉴 탭 */}
        <div className="flex" style={{ borderTop: "1px solid rgba(245,241,232,0.1)" }}>
          {([
            { key: "list" as AdminMenu, label: "신청 관리" },
            { key: "accounts" as AdminMenu, label: "계정 관리" },
            { key: "images" as AdminMenu, label: "이미지" },
            { key: "settings" as AdminMenu, label: "설정" },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMenu(tab.key)}
              className="flex-1 py-3 text-xs font-semibold transition-colors"
              style={{
                color: menu === tab.key ? "#FAF7F0" : "rgba(245,241,232,0.45)",
                borderBottom: menu === tab.key ? "2px solid rgba(217,168,50,0.8)" : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 신청 관리 ── */}
      {menu === "list" && (
        <>
          {/* 검색 */}
          <div className="px-5 pt-4 pb-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="var(--muted-foreground)" strokeWidth="1.5"/>
                <path d="M21 21l-4.35-4.35" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="작가명 또는 공방명으로 검색"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}
              />
            </div>
          </div>

          {/* 필터 칩 */}
          <div className="px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: filter === f.key ? "var(--primary)" : "var(--card)",
                  color: filter === f.key ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  border: `1px solid ${filter === f.key ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {f.label}
                {f.key !== "all" && counts[f.key] > 0 && (
                  <span className="ml-1 opacity-60">({counts[f.key]})</span>
                )}
              </button>
            ))}
          </div>

          {/* 목록 */}
          <div className="px-5 flex flex-col gap-2.5">
            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>해당하는 신청이 없습니다.</p>
              </div>
            )}
            {filtered.map(app => {
              const cfg = STATUS[app.status];
              return (
                <button
                  key={app.id}
                  onClick={() => { setSelectedId(app.id); setMemo(app.memo); }}
                  className="w-full text-left p-4 rounded-2xl transition-all active:scale-99"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--muted)" }}>
                      {app.img && <img src={app.img} alt={app.name} className="w-full h-full object-cover"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{app.name}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
                            {app.field} · {app.workshop}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{app.date}</span>
                        </div>
                      </div>
                      {app.memo && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <span style={{ fontSize: "11px", color: "var(--apricot)", flexShrink: 0 }}>📝</span>
                          <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{app.memo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── 계정 관리 ── */}
      {menu === "accounts" && (
        <div className="px-5 pt-5 flex flex-col gap-2.5">
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>
            등록된 작가 계정 ({apps.length}명)
          </p>
          {apps.map(a => {
            const cfg = STATUS[a.status];
            return (
              <div key={a.id} className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--muted)" }}>
                  {a.img && <img src={a.img} alt={a.name} className="w-full h-full object-cover"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{a.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{a.email}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 이미지 다운로드 ── */}
      {menu === "images" && (
        <div className="px-5 pt-5 flex flex-col gap-4">
          <div className="p-4 rounded-xl" style={{ background: "rgba(43,85,64,0.05)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--primary)" }}>작품 이미지 일괄 다운로드</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              승인된 작가의 대표 작품 이미지를 ZIP 파일로 다운로드할 수 있습니다.
            </p>
          </div>
          {apps.filter(a => a.artworks.length > 0).map(a => (
            <div key={a.id} className="rounded-xl overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{a.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{a.artworks.length}점</p>
                </div>
                <button className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(43,85,64,0.08)", color: "var(--primary)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v14M5 11l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  다운로드
                </button>
              </div>
              <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar">
                {a.artworks.map((art, i) => (
                  <div key={i} className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden"
                    style={{ background: "var(--muted)" }}>
                    {art.img && <img src={art.img} alt={art.title} className="w-full h-full object-cover"/>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 설정 ── */}
      {menu === "settings" && (
        <div className="px-5 pt-5 flex flex-col gap-3">
          {[
            { label: "운영팀 이메일", value: "gamcheon.artist.map@gmail.com" },
            { label: "신청 접수 상태", value: "접수 중" },
            { label: "현재 등록 공간", value: "38개" },
            { label: "공지사항 관리", value: "→" },
            { label: "운영자 비밀번호 변경", value: "→" },
          ].map(item => (
            <div key={item.label}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{item.label}</span>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{item.value}</span>
            </div>
          ))}
          <button
            onClick={onLogout}
            className="w-full mt-2 py-3.5 rounded-xl font-medium text-sm transition-all"
            style={{ background: "rgba(192,57,43,0.07)", color: "#B84A2E", border: "1.5px solid rgba(192,57,43,0.2)" }}
          >
            운영자 로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

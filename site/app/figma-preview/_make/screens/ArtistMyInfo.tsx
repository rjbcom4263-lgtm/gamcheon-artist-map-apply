import { useState } from "react";
import type { Screen, UserRole } from "../App";

interface Props {
  onNavigate: (s: Screen) => void;
  role: UserRole;
  onLogout: () => void;
}

type AppStatus = "pending" | "review" | "approved" | "rejected";

const statusConfig: Record<AppStatus, {
  label: string;
  subLabel: string;
  bg: string;
  textColor: string;
  dotColor: string;
  actionText: string;
}> = {
  pending: {
    label: "신청 완료",
    subLabel: "운영팀 검토를 기다리고 있습니다.",
    bg: "var(--primary)",
    textColor: "#FAF7F0",
    dotColor: "rgba(217,168,50,0.8)",
    actionText: "신청 내용 보기",
  },
  review: {
    label: "검토 중",
    subLabel: "운영팀이 신청 내용을 확인하고 있습니다.\n수정 요청이 있을 경우 아래 메모를 확인해 주세요.",
    bg: "var(--primary)",
    textColor: "#FAF7F0",
    dotColor: "rgba(217,168,50,0.9)",
    actionText: "신청 내용 보기",
  },
  approved: {
    label: "등재 완료",
    subLabel: "감천 작가 지도에 등재되었습니다. 방문객이 작가님의 공간을 찾을 수 있습니다.",
    bg: "var(--primary)",
    textColor: "#FAF7F0",
    dotColor: "rgba(184,221,217,0.9)",
    actionText: "지도에서 내 카드 보기",
  },
  rejected: {
    label: "반려",
    subLabel: "신청이 반려되었습니다. 운영자 메모를 확인하고 내용을 수정해 주세요.",
    bg: "#5E2412",
    textColor: "#FAF7F0",
    dotColor: "rgba(230,145,74,0.8)",
    actionText: "수정 후 재신청하기",
  },
};

const mockArtworks = [
  { title: "감천의 봄", desc: "캔버스 유화, 80×60cm, 2023", sale: true, img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=240&h=240&fit=crop&auto=format" },
  { title: "계단 위의 빛", desc: "수채화, 60×45cm, 2024", sale: false, img: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=240&h=240&fit=crop&auto=format" },
  { title: "마을 풍경 연작 #3", desc: "아크릴, 100×80cm, 2024", sale: true, img: "https://images.unsplash.com/photo-1509822929464-92b183d7d968?w=240&h=240&fit=crop&auto=format" },
  { title: "골목의 기억", desc: "혼합 재료, 50×50cm, 2023", sale: false, img: "" },
  { title: "담벼락 연가", desc: "판화, 40×30cm, 2024", sale: true, img: "" },
];

const infoRows = [
  { label: "작가명", value: "김예술" },
  { label: "예술 분야", value: "회화" },
  { label: "공방명", value: "감천스튜디오" },
  { label: "주소", value: "부산 사하구 감천2동 203-1" },
  { label: "방문 방식", value: "방문 예약 가능" },
  { label: "연락처", value: "010-1234-5678" },
  { label: "이메일", value: "art@gamcheon.kr" },
  { label: "인스타그램", value: "@gamcheon_art" },
];

export default function ArtistMyInfo({ onNavigate, role: _role, onLogout }: Props) {
  const [status] = useState<AppStatus>("review");
  const [showPwModal, setShowPwModal] = useState(false);
  const [showInfoDetail, setShowInfoDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const cfg = statusConfig[status];

  async function logout() {
    await fetch("/api/auth/logout", { method: "GET" }).catch(() => null);
    onLogout();
    onNavigate("home");
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <h1 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>내 정보</h1>
        <button style={{ color: "var(--muted-foreground)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">

        {/* 신청 상태 카드 */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: cfg.bg, boxShadow: "0 4px 20px rgba(43,85,64,0.18)" }}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: cfg.dotColor }} />
              <span className="text-xs font-medium" style={{ color: "rgba(250,247,240,0.65)" }}>신청 상태</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-1.5" style={{ color: cfg.textColor }}>
              {cfg.label}
            </h2>
            <p className="text-xs leading-relaxed mb-4 whitespace-pre-line"
              style={{ color: "rgba(250,247,240,0.72)" }}>
              {cfg.subLabel}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "rgba(250,247,240,0.5)" }}>신청일 2025.08.26</span>
              <button className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.15)", color: cfg.textColor, border: "1px solid rgba(255,255,255,0.2)" }}>
                {cfg.actionText}
              </button>
            </div>
          </div>

          {/* 운영자 메모 */}
          {status === "review" && (
            <div className="px-5 pb-4">
              <div className="p-3.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(217,168,50,0.9)" }}>운영자 메모</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,240,0.8)" }}>
                  방문 가능 시간 정보를 추가해주세요.
                </p>
                <p className="text-xs mt-1.5" style={{ color: "rgba(250,247,240,0.45)" }}>2025.08.27</p>
              </div>
            </div>
          )}
        </div>

        {/* 제출 정보 */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <button
            onClick={() => setShowInfoDetail(!showInfoDetail)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: "var(--primary)" }} />
              <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>제출 정보</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--primary)" }}>상세 보기</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                className="transition-transform duration-200"
                style={{ transform: showInfoDetail ? "rotate(90deg)" : "rotate(0deg)", color: "var(--muted-foreground)" }}>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </button>
          {showInfoDetail && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              {infoRows.map((row, i) => (
                <div key={row.label} className="flex px-4 py-2.5"
                  style={{ borderBottom: i < infoRows.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span className="text-xs w-20 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                  <span className="text-xs flex-1" style={{ color: "var(--foreground)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 대표 작품 5점 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: "var(--primary)" }} />
              <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>대표 작품</h2>
            </div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {mockArtworks.filter(a => a.img).length}점 이미지 등록 / 5점
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {mockArtworks.map((art, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                {/* Thumb */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "var(--muted)" }}>
                  {art.img ? (
                    <img src={art.img} alt={art.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold"
                      style={{ color: "var(--muted-foreground)" }}>#{i + 1}</span>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{art.title}</p>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{art.desc}</p>
                  {art.sale && (
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(230,145,74,0.12)", color: "var(--apricot)" }}>
                      판매 가능
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 수정 요청 & 비밀번호 변경 */}
        <div className="flex flex-col gap-2.5 mt-1">
          <button onClick={() => setShowEditModal(true)}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-98"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            정보 수정 요청하기
          </button>
          <button onClick={() => setShowPwModal(true)}
            className="w-full py-3.5 rounded-xl font-medium text-sm transition-all"
            style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
            비밀번호 변경
          </button>
          <button onClick={logout}
            className="w-full py-2.5 text-sm"
            style={{ color: "var(--muted-foreground)" }}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 수정 요청 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/35" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-sm mx-auto rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4"
            style={{ background: "var(--card)" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-1" style={{ background: "var(--border)" }} />
            <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>정보 수정 요청</h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              수정이 필요한 내용을 간략히 적어주세요. 운영팀이 확인 후 수정 권한을 부여하거나 직접 안내드립니다.
            </p>
            <textarea value={editNote} onChange={e => setEditNote(e.target.value)}
              placeholder="예) 공방 주소가 변경되었습니다. / 대표 작품 3번을 새 작품으로 교체하고 싶습니다."
              rows={4}
              className="w-full px-3.5 py-3 rounded-xl text-sm resize-none"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.7 }} />
            <div className="flex gap-2.5">
              <button onClick={() => setShowEditModal(false)}
                className="flex-1 py-3.5 rounded-xl font-medium text-sm"
                style={{ background: "var(--background)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                취소
              </button>
              <button onClick={() => setShowEditModal(false)}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                요청 보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/35" onClick={() => setShowPwModal(false)} />
          <div className="relative w-full max-w-sm mx-auto rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4"
            style={{ background: "var(--card)" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-1" style={{ background: "var(--border)" }} />
            <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>비밀번호 변경</h3>
            {[
              { label: "현재 비밀번호", value: oldPw, set: setOldPw, ph: "현재 비밀번호 입력" },
              { label: "새 비밀번호", value: newPw, set: setNewPw, ph: "새 비밀번호 (8자 이상)" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{f.label}</label>
                <input type="password" value={f.value} onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "'Noto Sans KR', sans-serif" }} />
              </div>
            ))}
            <div className="flex gap-2.5">
              <button onClick={() => setShowPwModal(false)}
                className="flex-1 py-3.5 rounded-xl font-medium text-sm"
                style={{ background: "var(--background)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                취소
              </button>
              <button onClick={() => setShowPwModal(false)}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

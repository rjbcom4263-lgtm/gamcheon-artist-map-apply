import { useState } from "react";
import type { Screen } from "../App";

interface Props {
  onNavigate: (s: Screen) => void;
}

const artists = [
  {
    id: 1,
    name: "김예술",
    field: "회화",
    workshop: "감천스튜디오",
    location: "감천2동 203-1",
    visit: "방문 예약 가능",
    oneliner: "낡은 계단과 담벼락에서 시간의 결을 찾습니다",
    color: "var(--apricot)",
    imgs: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1509822929464-92b183d7d968?w=200&h=200&fit=crop&auto=format",
    ],
    mapPos: { top: "38%", left: "36%" },
  },
  {
    id: 2,
    name: "이수도",
    field: "도예·공예",
    workshop: "흙빛공방",
    location: "감천1동 55-4",
    visit: "오픈 스튜디오",
    oneliner: "흙과 불의 언어로 감천을 빚습니다",
    color: "var(--teal)",
    imgs: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop&auto=format",
    ],
    mapPos: { top: "58%", left: "18%" },
  },
  {
    id: 3,
    name: "박섬유",
    field: "섬유·자수",
    workshop: "바늘과실",
    location: "감천2동 67-2",
    visit: "사전 연락 필수",
    oneliner: "실 한 올로 마을의 이야기를 수놓습니다",
    color: "var(--yellow)",
    imgs: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&auto=format",
    ],
    mapPos: { top: "32%", left: "68%" },
  },
];

export default function MapPreview({ onNavigate: _onNavigate }: Props) {
  const [selectedId, setSelectedId] = useState(1);
  const artist = artists.find(a => a.id === selectedId)!;

  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: "var(--background)" }}>

      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h1 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>감천 작가 지도</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>등록된 작가 공간 미리보기</p>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(43,85,64,0.1)", color: "var(--primary)" }}>
          38개 공간
        </div>
      </div>

      {/* 지도 영역 */}
      <div
        className="relative mx-5 mt-5 rounded-2xl overflow-hidden"
        style={{ height: "210px", background: "#E6E2D6", border: "1.5px solid var(--border)" }}
      >
        {/* 배경 격자 */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(43,85,64,0.2) 0, transparent 1px, transparent 28px),
              repeating-linear-gradient(90deg, rgba(43,85,64,0.2) 0, transparent 1px, transparent 28px)
            `,
          }} />
        {/* 도로 SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 210" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M0 100 Q80 75 180 95 Q270 115 360 85" stroke="rgba(43,85,64,0.18)" strokeWidth="9" fill="none"/>
          <path d="M0 145 Q90 135 170 148 Q250 165 360 140" stroke="rgba(43,85,64,0.13)" strokeWidth="5" fill="none"/>
          <path d="M115 0 Q122 55 118 105 Q114 155 110 210" stroke="rgba(43,85,64,0.13)" strokeWidth="5" fill="none"/>
          <path d="M225 0 Q230 65 235 105 Q240 155 232 210" stroke="rgba(43,85,64,0.1)" strokeWidth="4" fill="none"/>
          {[[55,65],[150,125],[85,148],[262,75],[305,138],[188,55],[235,148]].map(([x,y],i) => (
            <g key={i}>
              <rect x={x-7} y={y} width={14} height={10} rx="2" fill="rgba(43,85,64,0.1)"/>
              <path d={`M${x-9} ${y} L${x} ${y-6} L${x+9} ${y}`} fill="rgba(43,85,64,0.13)"/>
            </g>
          ))}
        </svg>

        {/* 핀 */}
        {artists.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedId(a.id)}
            className="absolute transition-all duration-200"
            style={{ ...a.mapPos, transform: "translate(-50%, -100%)" }}
          >
            <div className="flex flex-col items-center">
              <div
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-md whitespace-nowrap mb-1 transition-all duration-200"
                style={{
                  background: selectedId === a.id ? "var(--primary)" : "rgba(250,247,240,0.95)",
                  color: selectedId === a.id ? "var(--primary-foreground)" : "var(--foreground)",
                  border: `1.5px solid ${a.color}`,
                  transform: selectedId === a.id ? "scale(1.1)" : "scale(1)",
                  boxShadow: selectedId === a.id ? "0 4px 16px rgba(43,85,64,0.3)" : "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                {a.name}
              </div>
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                <path d="M4 5L0 0h8L4 5z"
                  fill={selectedId === a.id ? "var(--primary)" : "rgba(250,247,240,0.95)"} />
              </svg>
            </div>
          </button>
        ))}

        {/* 레이블 */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(250,247,240,0.9)", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
          <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>감천문화마을</span>
        </div>
      </div>

      {/* 작가 카드 */}
      <div className="mx-5 mt-4 rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}>
        <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${artist.color}18`, border: `1.5px solid ${artist.color}30` }}>
              <span className="font-display text-lg font-bold" style={{ color: artist.color }}>
                {artist.name[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>{artist.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${artist.color}16`, color: artist.color }}>
                  {artist.field}
                </span>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {artist.oneliner}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {[
              { icon: "📍", text: `${artist.workshop} · ${artist.location}` },
              { icon: "🕐", text: artist.visit },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ fontSize: "12px" }}>{row.icon}</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{row.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 작품 썸네일 */}
        <div className="p-3">
          <p className="text-xs font-semibold mb-2 ml-0.5" style={{ color: "var(--muted-foreground)" }}>대표 작품</p>
          <div className="flex gap-2">
            {artist.imgs.map((src, i) => (
              <div key={i} className="flex-1 aspect-square rounded-xl overflow-hidden"
                style={{ background: "var(--muted)", maxWidth: "calc(33.33% - 6px)" }}>
                <img src={src} alt="" className="w-full h-full object-cover"/>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 3 - artist.imgs.length) }).map((_, i) => (
              <div key={`e${i}`} className="flex-1 aspect-square rounded-xl flex items-center justify-center"
                style={{ background: "var(--muted)", maxWidth: "calc(33.33% - 6px)" }}>
                <span style={{ color: "var(--muted-foreground)", fontSize: "18px", opacity: 0.4 }}>+</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 작가 선택 */}
      <div className="px-5 mt-4">
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>등록된 작가</p>
        <div className="flex gap-2">
          {artists.map(a => (
            <button key={a.id} onClick={() => setSelectedId(a.id)}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: selectedId === a.id ? "var(--primary)" : "var(--card)",
                color: selectedId === a.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                border: `1.5px solid ${selectedId === a.id ? "var(--primary)" : "var(--border)"}`,
              }}>
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div className="mx-5 mt-5 px-4 py-3.5 rounded-xl"
        style={{ background: "rgba(43,85,64,0.05)", border: "1px solid var(--border)" }}>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          이 지도는 감천 작가 지도에 등재된 공간의 미리보기입니다.
          작가님도 참여 신청 후 승인을 받으면 이곳에 소개됩니다.
        </p>
      </div>
    </div>
  );
}

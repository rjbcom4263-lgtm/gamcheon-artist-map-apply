import { useState, useRef } from "react";
import type { ChangeEvent } from "react";

import type { Screen } from "../App";

interface Props {
  onNavigate: (s: Screen) => void;
}

const STEPS = [
  {
    label: "기본 정보",
    desc: "작가님의 이름과 예술 분야를 알려주세요.",
  },
  {
    label: "작가 소개",
    desc: "나만의 언어로 작업 세계를 소개해 주세요. 방문객이 공간을 찾기 전에 가장 먼저 읽는 글입니다.",
  },
  {
    label: "공방·방문 정보",
    desc: "작업 공간의 위치와 방문 방식을 입력해 주세요.",
  },
  {
    label: "대표 작품 5점",
    desc: "작가님을 가장 잘 보여주는 작품을 5점 등록해 주세요. 각 작품에 제목과 간단한 설명을 함께 적어주시면 좋습니다.",
  },
  {
    label: "최종 확인 및 제출",
    desc: "입력하신 내용을 확인하고 신청서를 제출해 주세요.",
  },
];

const artFields = ["회화", "조각", "도예·공예", "섬유·자수", "사진", "판화", "설치미술", "미디어아트", "기타"];
const visitMethods = [
  { value: "방문 예약 가능", hint: "사전에 연락하면 언제든 방문 가능" },
  { value: "오픈 스튜디오", hint: "별도 예약 없이 자유롭게 방문 가능" },
  { value: "전시 기간 한정", hint: "전시 기간에만 개방" },
  { value: "사전 연락 필수", hint: "반드시 연락 후 방문" },
];

interface Artwork {
  title: string;
  desc: string;
  sale: boolean;
  preview: string | null;
}

const EMPTY_ARTWORK: Artwork = { title: "", desc: "", sale: false, preview: null };
const INITIAL_ARTWORKS: Artwork[] = Array(5).fill(null).map(() => ({ ...EMPTY_ARTWORK }));

function FieldLabel({ text, required, hint }: { text: string; required?: boolean; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
        {text}
        {required && <span style={{ color: "#B84A2E", marginLeft: "2px" }}>*</span>}
      </label>
      {hint && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-3 rounded-xl text-sm"
      style={{ background: "white", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "'Noto Sans KR', sans-serif" }}
    />
  );
}

export default function ArtistApplication({ onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Step 0
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [field, setField] = useState("");

  // Step 1
  const [oneliner, setOneliner] = useState("");
  const [bio, setBio] = useState("");

  // Step 2
  const [workshopName, setWorkshopName] = useState("");
  const [address, setAddress] = useState("");
  const [visitMethod, setVisitMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");

  // Step 3
  const [artworks, setArtworks] = useState<Artwork[]>(INITIAL_ARTWORKS);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  function updateArtwork(i: number, k: keyof Artwork, v: string | boolean | null) {
    setArtworks(prev => prev.map((art, idx) => idx === i ? { ...art, [k]: v } : art));
  }
  function handleFile(i: number, e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) updateArtwork(i, "preview", URL.createObjectURL(f));
  }
  function removeArtworkImg(i: number) {
    updateArtwork(i, "preview", null);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "var(--background)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(43,85,64,0.1)" }}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <path d="M8 19l8 8L30 11" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-center mb-2" style={{ color: "var(--primary)" }}>
          신청이 완료되었습니다
        </h2>
        <p className="text-sm text-center leading-relaxed mb-1.5" style={{ color: "var(--muted-foreground)" }}>
          감천 작가 지도 운영팀이 내용을 검토한 뒤<br />
          등록된 이메일로 결과를 안내드리겠습니다.
        </p>
        <p className="text-xs text-center mb-10" style={{ color: "var(--teal)" }}>
          검토 기간: 영업일 기준 3~7일
        </p>
        <button onClick={() => onNavigate("myinfo")}
          className="w-full py-3.5 rounded-xl font-semibold text-sm mb-2.5"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          내 신청 현황 보기
        </button>
        <button onClick={() => onNavigate("home")}
          className="w-full py-3 text-sm"
          style={{ color: "var(--muted-foreground)" }}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3.5"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : onNavigate("home")}
          className="p-1 -ml-1" style={{ color: "var(--foreground)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>작가 참여 신청</h1>
        <div style={{ width: "28px" }} />
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3.5 pb-1" style={{ background: "var(--card)" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
            {step + 1}단계 · {current.label}
          </span>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "var(--primary)" }} />
        </div>
      </div>

      {/* Step hint */}
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{current.desc}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto no-scrollbar px-5 py-5">

        {/* Step 0: 기본 정보 */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel text="작가명 / 활동명" required hint="지도에 표시되는 이름입니다." />
              <Input value={name} onChange={setName} placeholder="예) 김예술, 홍길동" />
            </div>
            <div>
              <FieldLabel text="공방·스튜디오 명칭 (선택)" hint="개인 작업실이나 공방이 있다면 입력해 주세요." />
              <Input value={alias} onChange={setAlias} placeholder="예) 감천도예공방, 빛의 유리 공방" />
            </div>
            <div>
              <FieldLabel text="예술 분야" required />
              <div className="flex flex-wrap gap-2">
                {artFields.map(f => (
                  <button key={f} type="button" onClick={() => setField(f)}
                    className="px-3.5 py-2 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: field === f ? "var(--primary)" : "white",
                      color: field === f ? "white" : "var(--muted-foreground)",
                      border: `1px solid ${field === f ? "var(--primary)" : "var(--border)"}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel text="연락처" required />
              <Input value={phone} onChange={setPhone} placeholder="010-0000-0000" />
            </div>
            <div>
              <FieldLabel text="이메일" required hint="검토 결과를 이 이메일로 안내드립니다." />
              <Input value={email} onChange={setEmail} placeholder="example@email.com" type="email" />
            </div>
          </div>
        )}

        {/* Step 1: 작가 소개 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel text="한 줄 소개" required hint="지도 카드에 표시되는 짧은 소개입니다. (30자 이내 권장)" />
              <Input value={oneliner} onChange={setOneliner} placeholder="예) 감천의 풍경을 수채화로 담는 작가입니다." />
              <p className="text-right text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{oneliner.length}자</p>
            </div>
            <div>
              <FieldLabel text="작가 소개글" required hint="작업 철학, 창작 방식, 감천과의 인연 등을 자유롭게 써주세요. (100~500자 권장)" />
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="예) 저는 오래된 골목의 결을 수채화로 담아내는 작가입니다. 감천의 계단과 벽, 그 사이에서 피어나는 일상을 기록합니다..."
                rows={8}
                className="w-full px-3.5 py-3 rounded-xl text-sm resize-none"
                style={{ background: "white", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.8 }} />
              <p className="text-right text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{bio.length}자</p>
            </div>
            <div>
              <FieldLabel text="인스타그램 (선택)" />
              <Input value={instagram} onChange={setInstagram} placeholder="@username" />
            </div>
          </div>
        )}

        {/* Step 2: 공방·방문 정보 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel text="공방·작업 공간 이름" required />
              <Input value={workshopName} onChange={setWorkshopName} placeholder="예) 감천도예공방" />
            </div>
            <div>
              <FieldLabel text="주소" required hint="방문객이 찾아올 수 있는 정확한 주소를 입력해 주세요." />
              <Input value={address} onChange={setAddress} placeholder="부산광역시 사하구 감천동..." />
            </div>
            <div>
              <FieldLabel text="방문 방식" required hint="방문객이 공간을 어떻게 찾아올 수 있나요?" />
              <div className="flex flex-col gap-2">
                {visitMethods.map(v => (
                  <button key={v.value} type="button" onClick={() => setVisitMethod(v.value)}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: visitMethod === v.value ? "rgba(43,85,64,0.06)" : "white",
                      border: `1.5px solid ${visitMethod === v.value ? "var(--primary)" : "var(--border)"}`,
                    }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ border: `2px solid ${visitMethod === v.value ? "var(--primary)" : "#C8C6BE"}` }}>
                      {visitMethod === v.value && (
                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{v.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{v.hint}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 대표 작품 5점 */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="p-3.5 rounded-xl flex items-start gap-2.5"
              style={{ background: "rgba(43,85,64,0.05)", border: "1px solid rgba(43,85,64,0.12)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="1.5" />
                <path d="M12 8v4M12 16h.01" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: "var(--primary)" }}>
                대표 작품은 방문객이 공간을 찾기 전 가장 먼저 보게 되는 작품입니다.
                가장 잘 보여주는 작품 5점을 등록해 주세요. 이미지는 JPG, PNG 형식을 권장합니다.
              </p>
            </div>

            {artworks.map((art, i) => (
              <div key={i} className="rounded-xl overflow-hidden"
                style={{ background: "var(--card)", border: `1.5px solid ${art.preview || art.title ? "var(--primary)" : "var(--border)"}` }}>

                {/* Slot header */}
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: "1px solid var(--border)", background: art.preview ? "rgba(43,85,64,0.04)" : "transparent" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: art.preview || art.title ? "var(--primary)" : "var(--muted)",
                        color: art.preview || art.title ? "white" : "var(--muted-foreground)",
                      }}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      {i + 1}번째 작품 {i < 3 ? <span style={{ color: "#B84A2E" }}>*</span> : <span style={{ color: "var(--muted-foreground)" }}>(선택)</span>}
                    </span>
                  </div>
                  {art.preview && (
                    <button type="button" onClick={() => removeArtworkImg(i)}
                      className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      이미지 삭제
                    </button>
                  )}
                </div>

                {/* Image upload */}
                <div className="relative cursor-pointer"
                  style={{
                    aspectRatio: "4/3",
                    background: art.preview ? "transparent" : i === 0 ? "rgba(43,85,64,0.04)" : "var(--muted)",
                  }}
                  onClick={() => fileRefs.current[i]?.click()}>
                  {art.preview ? (
                    <img src={art.preview} alt={art.title || `작품 ${i + 1}`}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(43,85,64,0.1)" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--primary)" strokeWidth="1.5" />
                          <path d="M3 15l5-5 4 4 3-3 6 6" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="var(--primary)" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>이미지 업로드</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>탭하여 파일 선택</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    ref={el => { fileRefs.current[i] = el; }}
                    onChange={e => handleFile(i, e)} />
                </div>

                {/* Fields */}
                <div className="p-3.5 flex flex-col gap-3">
                  <input value={art.title} onChange={e => updateArtwork(i, "title", e.target.value)}
                    placeholder="작품 제목"
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "'Noto Sans KR', sans-serif" }} />
                  <textarea value={art.desc} onChange={e => updateArtwork(i, "desc", e.target.value)}
                    placeholder="작품 설명 (재료, 크기, 제작 연도 등)"
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "'Noto Sans KR', sans-serif" }} />
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => updateArtwork(i, "sale", !art.sale)}
                      className="flex items-center justify-center rounded transition-all"
                      style={{
                        width: "18px", height: "18px", flexShrink: 0,
                        background: art.sale ? "var(--apricot)" : "transparent",
                        border: `1.5px solid ${art.sale ? "var(--apricot)" : "#C0BEB4"}`,
                      }}>
                      {art.sale && <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>}
                    </div>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>판매 가능한 작품입니다</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: 확인 및 제출 */}
        {step === 4 && (
          <div className="flex flex-col gap-4">

            {/* Preview card */}
            <div className="p-4 rounded-xl"
              style={{ background: "rgba(43,85,64,0.05)", border: "1.5px solid rgba(43,85,64,0.15)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 rounded-full" style={{ background: "var(--primary)" }} />
                <span className="font-display font-bold text-sm" style={{ color: "var(--primary)" }}>
                  {name || "작가명 미입력"}
                </span>
                {field && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(43,85,64,0.1)", color: "var(--primary)" }}>{field}</span>
                )}
              </div>
              {oneliner && <p className="text-xs mt-1 ml-3" style={{ color: "var(--muted-foreground)" }}>{oneliner}</p>}
            </div>

            {[
              {
                title: "기본 정보",
                rows: [
                  { label: "작가명", value: name || "—" },
                  { label: "공방명", value: alias || "—" },
                  { label: "예술 분야", value: field || "—" },
                  { label: "연락처", value: phone || "—" },
                  { label: "이메일", value: email || "—" },
                ],
              },
              {
                title: "공방·방문 정보",
                rows: [
                  { label: "공방", value: workshopName || "—" },
                  { label: "주소", value: address || "—" },
                  { label: "방문 방식", value: visitMethod || "—" },
                ],
              },
            ].map(section => (
              <div key={section.title} className="rounded-xl overflow-hidden"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="px-4 py-2.5" style={{ background: "rgba(43,85,64,0.04)", borderBottom: "1px solid var(--border)" }}>
                  <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{section.title}</span>
                </div>
                {section.rows.map(row => (
                  <div key={row.label} className="flex px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="text-xs w-20 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                    <span className="text-xs flex-1" style={{ color: "var(--foreground)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Artwork summary */}
            <div className="rounded-xl overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ background: "rgba(43,85,64,0.04)", borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>대표 작품</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {artworks.filter(a => a.preview).length}점 이미지 등록 · {artworks.filter(a => a.title).length}점 정보 입력
                </span>
              </div>
              <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar">
                {artworks.map((a, i) => (
                  <div key={i} className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: "var(--muted)", border: `1.5px solid ${a.preview ? "var(--primary)" : "var(--border)"}` }}>
                    {a.preview ? (
                      <img src={a.preview} alt={a.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "rgba(91,168,160,0.07)", border: "1px solid rgba(91,168,160,0.2)" }}>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                제출된 신청서는 운영팀 검토를 거쳐 감천 작가 지도에 등재됩니다.
                검토 결과는 등록된 이메일로 안내드립니다.
                제출 후에도 수정 요청을 통해 정보를 변경하실 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2.5 mt-6 mb-4">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 rounded-xl font-medium text-sm"
              style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
              이전
            </button>
          )}
          <button
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : setSubmitted(true)}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm active:scale-98 transition-all"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {step < STEPS.length - 1 ? "다음 단계로" : "신청서 제출하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

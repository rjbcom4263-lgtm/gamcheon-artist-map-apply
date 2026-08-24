"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

const STEPS = ["기본정보", "대표 작품", "공간·방문", "온라인 연결", "참여 의견", "동의·제출"];
const CATEGORIES = ["회화", "민화", "캘리그라피", "도자", "공예", "조각", "섬유", "일러스트", "캐릭터", "사진", "금속", "목공", "기타"];
const STORAGE_KEY = "gamcheon_artist_apply_v2";

type Work = { id: string; title: string; status: string; description: string; image?: File; preview?: string };
type Values = Record<string, string | boolean>;
type UploadedImage = { type: string; workIndex?: number; key: string; name: string; contentType: string };
const REQUIRED_WORK_COUNT = 5;

const initialValues: Values = {
  artistName: "", studioName: "", tagline: "", bio: "", address: "", locationPrivacy: "exact",
  visitType: "운영시간 내 방문 가능", hours: "", experience: "없음", experienceDesc: "",
  instagram: "", website: "", shopUrl: "", phone: "", email: "",
  stampInterest: "자세한 설명을 듣고 결정하고 싶음", nfcInterest: "자세한 설명을 듣고 결정하고 싶음",
  feedback: "", consentInfo: false, consentImage: false, consentPrivacy: false,
};

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function blankWork(): Work { return { id: uid(), title: "", status: "문의 필요", description: "" }; }

export default function Home() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(initialValues);
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [works, setWorks] = useState<Work[]>(Array.from({ length: REQUIRED_WORK_COUNT }, blankWork));
  const [profileImage, setProfileImage] = useState<File>();
  const [profilePreview, setProfilePreview] = useState("");
  const [saveLabel, setSaveLabel] = useState("자동 저장 준비");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");
  const [imageProcessing, setImageProcessing] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      setValues({ ...initialValues, ...(draft.values || {}) });
      setCategories(draft.categories || []);
      if (draft.works?.length) {
        const restored = draft.works.slice(0, REQUIRED_WORK_COUNT).map((w: Work) => ({ ...w, image: undefined, preview: "" }));
        setWorks([...restored, ...Array.from({ length: Math.max(0, REQUIRED_WORK_COUNT - restored.length) }, blankWork)]);
      }
      setStep(Math.min(Number(draft.step) || 0, 5));
      setSaveLabel("이전 임시 저장 불러옴");
    } catch { /* damaged drafts are ignored */ }
  }, []);

  useEffect(() => {
    if (submittedId) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, categories, works: works.map((w) => ({ id: w.id, title: w.title, status: w.status, description: w.description })), step }));
        setSaveLabel(`임시 저장됨 · ${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`);
      } catch { setSaveLabel("일부 정보 저장 제한"); }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [values, categories, works, step, submittedId]);

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const currentTitle = ["작가 기본정보", "대표 작품", "공간 · 방문정보", "온라인 연결", "ART PASSPORT · 참여 의견", "정보 활용 확인"][step];
  const currentDesc = [
    "지도에서 가장 먼저 보여줄 작가 정보를 입력해주세요.", "관광객이 위치보다 먼저 작품을 발견할 수 있도록 대표작을 등록합니다.",
    "관광객이 실제로 작가의 공간을 찾아갈 때 필요한 정보입니다.", "여행이 끝난 뒤에도 관광객이 작가를 다시 찾을 수 있도록 연결합니다.",
    "참여 작가님들과 함께 검토하려는 다음 단계입니다.", "공개 정보와 운영용 정보를 구분해서 확인합니다."
  ][step];

  const update = (name: string, value: string | boolean) => setValues((v) => ({ ...v, [name]: value }));
  const addCustomCategory = () => {
    const category = customCategory.trim().slice(0, 30);
    if (!category) return;
    setCategories((list) => list.includes(category) ? list : [...list, category]);
    setCustomCategory("");
  };
  const input = (name: string, type = "text", placeholder = "", required = false) => (
    <input type={type} name={name} value={String(values[name] || "")} placeholder={placeholder} required={required} onChange={(e) => update(name, e.target.value)} />
  );
  const textArea = (name: string, placeholder = "") => <textarea name={name} value={String(values[name] || "")} placeholder={placeholder} onChange={(e) => update(name, e.target.value)} />;
  const select = (name: string, options: string[]) => <select name={name} value={String(values[name])} onChange={(e) => update(name, e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>;

  async function compressImage(file: File) {
    if (file.size <= 900 * 1024) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    let blob: Blob | null = null;
    for (const quality of [0.82, 0.7, 0.58]) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= 1100 * 1024) break;
    }
    if (!blob) throw new Error("이미지를 변환하지 못했습니다.");
    const name = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  }

  async function pickImage(e: ChangeEvent<HTMLInputElement>, kind: "profile" | "work", workId?: string) {
    const original = e.target.files?.[0];
    if (!original) return;
    if (!original.type.startsWith("image/")) { alert("이미지 파일만 선택해주세요."); return; }
    if (original.size > 30 * 1024 * 1024) { alert("원본 이미지는 한 장당 30MB 이하로 선택해주세요."); return; }
    let file: File;
    setImageProcessing((count) => count + 1);
    try { file = await compressImage(original); }
    catch { alert("이 사진 형식을 읽지 못했습니다. JPG 또는 PNG로 다시 선택해주세요."); return; }
    finally { setImageProcessing((count) => Math.max(0, count - 1)); }
    if (!file) return;
    if (file.size > 1500 * 1024) { alert("사진 용량을 줄이지 못했습니다. 다른 사진을 선택해주세요."); return; }
    const preview = URL.createObjectURL(file);
    if (kind === "profile") { setProfileImage(file); setProfilePreview(preview); }
    else setWorks((list) => list.map((w) => w.id === workId ? { ...w, image: file, preview } : w));
  }

  function validate() {
    if (imageProcessing > 0) return "사진을 처리하고 있습니다. 잠시만 기다려주세요.";
    if (step === 0 && (!String(values.artistName).trim() || !String(values.tagline).trim() || !categories.length)) return "작가명, 작품 분야, 한 줄 소개를 입력해주세요.";
    if (step === 1 && works.length < REQUIRED_WORK_COUNT) return "대표 작품 5점을 모두 입력해주세요.";
    if (step === 1 && works.some((work) => !work.title.trim())) return "대표 작품 5점의 작품명을 모두 입력해주세요.";
    if (step === 1 && works.some((work) => !work.image)) return "대표 작품 5점의 이미지를 모두 선택해주세요.";
    if (step === 3 && !String(values.phone).trim()) return "운영진 연락용 휴대전화를 입력해주세요.";
    if (step === 5 && (!values.consentInfo || !values.consentImage || !values.consentPrivacy)) return "필수 동의 항목을 모두 확인해주세요.";
    return "";
  }

  function next() {
    const message = validate();
    if (message) { alert(message); return; }
    setStep((s) => Math.min(5, s + 1));
    document.querySelector(".workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function uploadApplicationImage(applicationId: string, image: File, type: "profile" | "work", workIndex?: number) {
    const data = new FormData();
    data.set("applicationId", applicationId);
    data.set("type", type);
    if (typeof workIndex === "number") data.set("workIndex", String(workIndex));
    data.set("image", image);
    const response = await fetch("/api/applications/images", { method: "POST", body: data });
    const result = await response.json().catch(() => ({})) as { image?: UploadedImage; error?: string };
    if (!response.ok || !result.image) throw new Error(result.error || "이미지를 저장하지 못했습니다.");
    return result.image;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step < 5) { next(); return; }
    const message = validate(); if (message) { alert(message); return; }
    setSubmitting(true); setError("");
    try {
      setSaveLabel("신청 번호 발급 중...");
      const initResponse = await fetch("/api/applications/init", { method: "POST" });
      const init = await initResponse.json().catch(() => ({})) as { id?: string; error?: string };
      if (!initResponse.ok || !init.id) throw new Error(init.error || "신청 번호를 만들지 못했습니다.");

      const uploadedImages: UploadedImage[] = [];
      const allImages = [
        ...(profileImage ? [{ type: "profile" as const, image: profileImage }] : []),
        ...works.map((work, index) => ({ type: "work" as const, image: work.image, workIndex: index })),
      ];
      for (let i = 0; i < allImages.length; i += 1) {
        const item = allImages[i];
        if (!item.image) continue;
        setSaveLabel(`사진 저장 중 ${i + 1} / ${allImages.length}`);
        uploadedImages.push(await uploadApplicationImage(init.id, item.image, item.type, item.workIndex));
      }

      setSaveLabel("신청서 저장 중...");
      const data = new FormData();
      data.set("payload", JSON.stringify({ applicationId: init.id, values, categories, works: works.map(({ id, title, status, description }) => ({ id, title, status, description })), expectedImages: { profile: Boolean(profileImage), works: works.map((work) => Boolean(work.image)) }, uploadedImages }));
      const response = await fetch("/api/applications", { method: "POST", body: data });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : { error: await response.text() };
      if (!response.ok) throw new Error(result.error || "접수 중 오류가 발생했습니다.");
      localStorage.removeItem(STORAGE_KEY); setSubmittedId(result.id);
    } catch (err) { setError(err instanceof Error ? err.message : "접수 중 오류가 발생했습니다."); }
    finally { setSubmitting(false); }
  }

  const summary = useMemo(() => ({ artist: String(values.artistName || "-"), categories: categories.join(", ") || "-", works: works.length }), [values.artistName, categories, works.length]);

  return <div className="app">
    <header className="topbar"><div className="topbar-inner"><div className="brand"><div className="brand-mark">✦</div><div>감천 작가 지도<small>GAMCHEON ARTIST MAP</small></div></div><div className="save-state">{saveLabel}</div></div></header>
    <main>
      <section className="hero">
        <div className="hero-card"><div className="eyebrow">ARTIST REGISTRATION · PILOT</div><h1>감천의 작가를<br />관광객에게 연결합니다.</h1><p>작가와 작품, 공방 정보를 등록하면 감천 작가 지도 시범 서비스에 반영할 수 있도록 준비합니다. 작성한 내용은 운영진 확인 후 공개됩니다.</p><div className="hero-note"><span className="pill">약 5~10분</span><span className="pill">대표작 5점 필수</span><span className="pill">모바일 신청</span><span className="pill">임시 저장</span></div></div>
        <aside className="side-card"><div><div className="side-title">등록된 정보는 이렇게 이어집니다.</div><div className="flow">{["작가 카드와 작품 상세 페이지", "분야별 필터와 지도 마커", "공방 방문 정보와 온라인 채널", "향후 ART PASSPORT 연동"].map((x, i) => <div className="flow-row" key={x}><div className="flow-dot">{i + 1}</div><span>{x}</span></div>)}</div></div><div className="side-callout">웹 이용이 어려운 작가님은 동일 항목의 종이 신청서로 접수하고 운영진이 대신 등록할 수 있습니다.</div></aside>
      </section>
      <div className="workspace">
        <nav className="steps" aria-label="신청 단계">{STEPS.map((label, i) => <div key={label} className={`step-item ${i === step ? "active" : ""} ${i < step || submittedId ? "done" : ""}`}><div className="step-num">{i < step || submittedId ? "✓" : i + 1}</div><span>{label}</span></div>)}</nav>
        <section className="form-card">
          {submittedId ? <div className="success show"><div className="success-icon">✓</div><h2>작가 참여 신청이 접수되었습니다.</h2><p>운영진이 내용을 확인한 뒤 입력하신 연락처로 안내드리겠습니다.</p><div className="receipt">접수번호 <strong>{submittedId}</strong></div><div className="summary"><div><span>작가명</span><strong>{summary.artist}</strong></div><div><span>분야</span><strong>{summary.categories}</strong></div><div><span>대표작</span><strong>{summary.works}점</strong></div></div></div> : <>
            <div className="progress-wrap"><div className="progress-head"><span>{step + 1} / {STEPS.length}</span><span>{progress}%</span></div><div className="progress"><span style={{ width: `${progress}%` }} /></div></div>
            <form onSubmit={submit} noValidate><div className="form-head"><div><h2>{currentTitle}</h2><p>{currentDesc}</p></div></div>
              {step === 0 && <div className="section active"><div className="grid-2"><div className="field"><label>작가명 / 활동명 <b>*</b></label>{input("artistName", "text", "예: 홍길동 / 길동작가", true)}</div><div className="field"><label>공방·작업실 이름</label>{input("studioName", "text", "없으면 비워두셔도 됩니다")}</div></div><div className="field"><label>작품 분야 <b>*</b></label><div className="chips">{CATEGORIES.map((c) => <button type="button" key={c} className={`chip ${categories.includes(c) ? "selected" : ""}`} onClick={() => setCategories((list) => list.includes(c) ? list.filter((x) => x !== c) : [...list, c])}>{c}</button>)}{categories.filter((c) => !CATEGORIES.includes(c)).map((c) => <button type="button" key={c} className="chip selected custom-chip" onClick={() => setCategories((list) => list.filter((x) => x !== c))}>{c} ×</button>)}</div><div className="custom-category"><input value={customCategory} maxLength={30} placeholder="목록에 없다면 직접 입력" onChange={(e) => setCustomCategory(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomCategory(); } }}/><button type="button" onClick={addCustomCategory}>분야 추가</button></div><small>복수 선택이 가능하며, 없는 분야는 직접 입력할 수 있습니다.</small></div><div className="field"><label>작가 한 줄 소개 <b>*</b></label>{input("tagline", "text", "예: 감천의 풍경과 사람을 민화로 기록합니다.", true)}<small>관광객이 카드에서 가장 먼저 읽는 문장입니다.</small></div><div className="field"><label>작가 소개</label>{textArea("bio", "작업 세계, 재료, 감천과의 관계 등을 자유롭게 소개해주세요.")}</div><div className="field"><label>프로필 / 대표 이미지</label><label className="upload"><input type="file" accept="image/*" onChange={(e) => pickImage(e, "profile")} /><span className="plus">＋</span><strong>{imageProcessing ? "사진 처리 중…" : "이미지 선택"}</strong><small>고화질 사진도 자동으로 용량을 줄여 저장합니다.</small></label>{profilePreview && <><img src={profilePreview} className="preview" alt="프로필 미리보기" /><small className="image-ready">✓ 저장할 사진 준비 완료 · {profileImage?.name}</small></>}</div></div>}
              {step === 1 && <div className="section active"><div className="info-panel"><strong>대표작 5점 모두 이미지 필수</strong><p>작가님의 작품을 충분히 보여줄 수 있도록 대표 작품 5점의 이름, 설명, 사진을 등록해주세요.</p></div>{works.map((work, i) => <div className="work-card" key={work.id}><div className="work-card-head"><strong>대표 작품 {i + 1} · 필수</strong></div><div className="grid-2"><div className="field"><label>작품명 <b>*</b></label><input value={work.title} placeholder="작품명" onChange={(e) => setWorks((l) => l.map((w) => w.id === work.id ? { ...w, title: e.target.value } : w))} /></div><div className="field"><label>작품 상태</label><select value={work.status} onChange={(e) => setWorks((l) => l.map((w) => w.id === work.id ? { ...w, status: e.target.value } : w))}>{["판매 가능", "전시 작품", "문의 필요", "판매하지 않음"].map((o) => <option key={o}>{o}</option>)}</select></div></div><div className="field"><label>작품 설명</label><textarea value={work.description} placeholder="관광객이 작품을 이해할 수 있는 짧은 설명" onChange={(e) => setWorks((l) => l.map((w) => w.id === work.id ? { ...w, description: e.target.value } : w))} /></div><div className="field"><label>작품 이미지 <b>*</b></label><label className="upload compact"><input type="file" accept="image/*" onChange={(e) => pickImage(e, "work", work.id)} /><span className="plus">＋</span><strong>{imageProcessing ? "사진 처리 중…" : "작품 이미지 선택"}</strong></label>{work.preview && <><img src={work.preview} className="preview" alt={`${work.title || "작품"} 미리보기`} /><small className="image-ready">✓ 저장할 사진 준비 완료 · {work.image?.name}</small></>}</div></div>)}</div>}
              {step === 2 && <div className="section active"><div className="field"><label>공방 주소</label>{input("address", "text", "예: 부산 사하구 감내2로 ...")}<small>공개 범위에 따라 실제 지도에는 다르게 표시됩니다.</small></div><div className="field"><label>위치 공개 범위</label><div className="choice-list">{[["exact", "정확한 공방 위치 공개", "지도 마커와 주소를 공개합니다."], ["nearby", "근처 위치만 공개", "정확한 작업실 주소는 숨깁니다."], ["reservation", "예약 방문객에게만 안내", "세부 주소는 별도로 안내합니다."]].map(([v, t, d]) => <label className="choice" key={v}><input type="radio" checked={values.locationPrivacy === v} onChange={() => update("locationPrivacy", v)} /><span><strong>{t}</strong><small>{d}</small></span></label>)}</div></div><div className="field"><label>방문 방식</label>{select("visitType", ["자유 방문 가능", "운영시간 내 방문 가능", "사전 예약 필요", "일반 방문 불가"])}</div><div className="field"><label>운영시간</label>{textArea("hours", "예: 화~일 11:00~18:00 / 월요일 휴무")}</div><div className="field"><label>체험 프로그램</label>{select("experience", ["없음", "있음", "준비 중"])}</div><div className="field"><label>체험 설명</label>{textArea("experienceDesc", "체험명, 소요시간, 예약 여부 등을 간단히 적어주세요.")}</div></div>}
              {step === 3 && <div className="section active"><div className="grid-2"><div className="field"><label>Instagram</label>{input("instagram", "url", "https://instagram.com/...")}</div><div className="field"><label>홈페이지</label>{input("website", "url", "https://...")}</div></div><div className="field"><label>온라인 판매처</label>{input("shopUrl", "url", "스마트스토어 등")}</div><div className="info-panel"><strong>운영진 연락용</strong><p>아래 정보는 확인·연락을 위해서만 사용하며 관광객에게 공개하지 않습니다.</p></div><div className="grid-2"><div className="field"><label>휴대전화 <b>*</b></label>{input("phone", "tel", "010-0000-0000", true)}</div><div className="field"><label>이메일</label>{input("email", "email", "artist@example.com")}</div></div></div>}
              {step === 4 && <div className="section active"><div className="passport-preview"><div className="passport-book"><strong>ART<br />PASSPORT</strong><small>GAMCHEON · BUSAN</small></div><div><strong>실물 여권 + 작가별 스탬프 + NFC 작가 카드</strong><small>작가 공간 방문을 수집 가능한 관광 경험으로 확장하는 방향입니다.</small></div></div><div className="field"><label>작가 스탬프 프로젝트</label>{select("stampInterest", ["참여하고 싶음", "자세한 설명을 듣고 결정하고 싶음", "현재는 참여 의사 없음"])}</div><div className="field"><label>NFC 작가 카드</label>{select("nfcInterest", ["참여하고 싶음", "자세한 설명을 듣고 결정하고 싶음", "현재는 참여 의사 없음"])}</div><div className="field"><label>감천 작가 지도에 바라는 기능이나 의견</label>{textArea("feedback", "관광객에게 꼭 보여주고 싶은 정보, 우려되는 점, 필요한 기능 등을 적어주세요.")}</div></div>}
              {step === 5 && <div className="section active"><div className="info-panel"><strong>서비스 공개 정보</strong><p>작가명, 소개, 작품, 선택한 범위의 위치·방문 정보, 등록한 온라인 채널</p></div><div className="info-panel warm"><strong>운영 목적으로만 사용</strong><p>휴대전화, 이메일, 신청 관련 연락 정보</p></div>{[["consentInfo", "작가 및 작품 정보를 감천 작가 지도에 게시하는 것에 동의합니다."], ["consentImage", "등록한 작품 이미지를 서비스 내에서 게시하는 것에 동의합니다."], ["consentPrivacy", "개인정보 수집·이용 안내를 확인했습니다."]].map(([name, label]) => <label className="consent-box" key={name}><input type="checkbox" checked={Boolean(values[name])} onChange={(e) => update(name, e.target.checked)} /><span>{label} <b>*</b></span></label>)}{error && <div className="error" role="alert">{error}</div>}</div>}
              <div className="actions"><button type="button" className="ghost" style={{ visibility: step === 0 ? "hidden" : "visible" }} onClick={() => setStep((s) => Math.max(0, s - 1))}>이전</button><button className="primary" type="submit" disabled={submitting || imageProcessing > 0}>{imageProcessing > 0 ? "사진 처리 중…" : submitting ? "접수 중…" : step === 5 ? "신청서 제출" : "다음"}</button></div>
            </form>
          </>}
        </section>
      </div>
    </main>
    <footer className="site-footer"><span>감천 작가 지도 시범 운영</span><a href="/login">로그인</a></footer>
  </div>;
}

"use client";

import { useMemo, useState } from "react";

export type Application = {
  id: string;
  artist_name: string;
  phone: string;
  email: string;
  status: string;
  payload_json: string;
  image_keys_json: string;
  created_at: string;
};

type Work = { id?: string; title?: string; status?: string; description?: string };
type Payload = { values?: Record<string, string | boolean>; categories?: string[]; works?: Work[]; adminReview?: { note?: string; processedAt?: string; status?: string } };
type ImageRecord = { type: string; workIndex?: number; key: string; name: string };

const STATUS = {
  received: "접수",
  reviewing: "검토 중",
  approved: "승인",
  hold: "보류",
  rejected: "반려",
  cancelled: "신청자 취소",
} as const;

function parse<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function date(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value + (value.endsWith("Z") ? "" : "Z")));
}

export default function AdminDashboard({ initial, adminName }: { initial: Application[]; adminName: string }) {
  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState<Application | null>(initial[0] || null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState("");
  const [reviewNote, setReviewNote] = useState(() => parse<Payload>(initial[0]?.payload_json || "", {}).adminReview?.note || "");

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesStatus = filter === "all" || row.status === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || `${row.artist_name} ${row.phone} ${row.email} ${row.id}`.toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  }), [rows, filter, query]);

  const counts = useMemo(() => ({
    all: rows.length,
    received: rows.filter((x) => x.status === "received").length,
    reviewing: rows.filter((x) => x.status === "reviewing").length,
    approved: rows.filter((x) => x.status === "approved").length,
  }), [rows]);

  function selectRow(row: Application) {
    setSelected(row);
    setReviewNote(parse<Payload>(row.payload_json, {}).adminReview?.note || "");
  }

  async function changeStatus(id: string, status: string) {
    if ((status === "rejected" || status === "cancelled") && !reviewNote.trim()) return alert("처리 사유를 입력해주세요.");
    setSaving(id);
    const response = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    setSaving("");
    if (!response.ok) return alert("상태를 저장하지 못했습니다.");
    const result = await response.json();
    setRows((current) => current.map((x) => x.id === id ? { ...x, status, payload_json: result.payload_json } : x));
    setSelected((current) => current?.id === id ? { ...current, status, payload_json: result.payload_json } : current);
  }

  const payload = selected ? parse<Payload>(selected.payload_json, {}) : {};
  const images = selected ? parse<ImageRecord[]>(selected.image_keys_json, []) : [];
  const values = payload.values || {};

  return <div className="admin-shell">
    <header className="admin-top"><div><a href="/" className="admin-brand">감천 작가 지도</a><span>관리자</span></div><div className="admin-user">{adminName}<a href="/api/admin/logout">로그아웃</a></div></header>
    <main className="admin-main">
      <section className="admin-heading"><div><p>APPLICATION MANAGEMENT</p><h1>작가 신청 관리</h1><span>접수된 작가 정보와 작품을 검토하고 진행 상태를 관리합니다.</span></div><a className="export-button" href="/api/admin/applications/export">CSV 다운로드</a></section>
      <section className="metric-grid">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}><span>전체 신청</span><strong>{counts.all}</strong></button>
        <button onClick={() => setFilter("received")} className={filter === "received" ? "active" : ""}><span>신규 접수</span><strong>{counts.received}</strong></button>
        <button onClick={() => setFilter("reviewing")} className={filter === "reviewing" ? "active" : ""}><span>검토 중</span><strong>{counts.reviewing}</strong></button>
        <button onClick={() => setFilter("approved")} className={filter === "approved" ? "active" : ""}><span>승인 완료</span><strong>{counts.approved}</strong></button>
      </section>
      <section className="admin-workspace">
        <div className="application-list">
          <div className="list-tools"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="작가명·연락처·접수번호 검색" aria-label="신청서 검색"/><select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="상태 필터"><option value="all">전체 상태</option>{Object.entries(STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
          <div className="list-count">검색 결과 {filtered.length}건</div>
          {filtered.length ? filtered.map((row) => <button key={row.id} className={`application-row ${selected?.id === row.id ? "selected" : ""}`} onClick={() => selectRow(row)}>
            <div><strong>{row.artist_name}</strong><span className={`status status-${row.status}`}>{STATUS[row.status as keyof typeof STATUS] || row.status}</span></div><p>{parse<Payload>(row.payload_json, {}).categories?.join(" · ") || "분야 미입력"}</p><small>{date(row.created_at)} · {row.id}</small>
          </button>) : <div className="admin-empty">조건에 맞는 신청서가 없습니다.</div>}
        </div>
        <div className="application-detail">
          {!selected ? <div className="admin-empty">확인할 신청서를 선택해주세요.</div> : <>
            <div className="detail-title"><div><span>{selected.id}</span><h2>{selected.artist_name}</h2></div><select value={selected.status} disabled={saving === selected.id} onChange={(e) => changeStatus(selected.id, e.target.value)} aria-label="신청 상태 변경">{Object.entries(STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
            <section className="review-panel"><div><strong>운영자 처리</strong><span>반려·취소 사유를 기록하면 처리 시각과 함께 보관됩니다.</span></div><textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="예: 필수 작품 정보가 부족하여 보완 요청 후 반려 처리"/><div className="review-actions"><button disabled={saving === selected.id} onClick={() => changeStatus(selected.id, "received")}>접수로 복구</button><button disabled={saving === selected.id} onClick={() => changeStatus(selected.id, "cancelled")}>신청자 취소</button><button className="reject" disabled={saving === selected.id} onClick={() => changeStatus(selected.id, "rejected")}>반려 처리</button></div>{payload.adminReview?.processedAt && <small>최근 처리: {date(payload.adminReview.processedAt)}</small>}</section>
            <DetailSection title="기본 정보"><Info label="작가명" value={selected.artist_name}/><Info label="한 줄 소개" value={String(values.tagline || "-")}/><Info label="작품 분야" value={payload.categories?.join(", ") || "-"}/><Info label="활동 경력" value={String(values.career || "-")}/><Info label="작가 소개" value={String(values.introduction || values.bio || "-")}/></DetailSection>
            <DetailSection title="연락 및 공방"><Info label="휴대전화" value={selected.phone}/><Info label="이메일" value={selected.email || "-"}/><Info label="공방명" value={String(values.studioName || "-")}/><Info label="주소" value={String(values.address || values.studioAddress || "-")}/><Info label="온라인 채널" value={String(values.onlineChannel || values.instagram || "-")}/></DetailSection>
            <DetailSection title={`대표 작품 ${payload.works?.length || 0}점`} wide>{payload.works?.map((work, index) => <article className="admin-work" key={work.id || index}><div><strong>{index + 1}. {work.title || "작품명 없음"}</strong><span>{work.status || ""}</span></div><p>{work.description || "작품 설명이 없습니다."}</p>{images.find((x) => x.type === "work" && x.workIndex === index) && <img src={`/api/admin/images?key=${encodeURIComponent(images.find((x) => x.type === "work" && x.workIndex === index)!.key)}`} alt={`${work.title || "대표 작품"} 이미지`}/>}</article>) || <p>-</p>}</DetailSection>
            {images.some((x) => x.type === "profile") && <DetailSection title="작가 프로필 사진" wide><img className="profile-admin-image" src={`/api/admin/images?key=${encodeURIComponent(images.find((x) => x.type === "profile")!.key)}`} alt="작가 프로필"/></DetailSection>}
          </>}
        </div>
      </section>
    </main>
  </div>;
}

function DetailSection({ title, children, wide = false }: { title: string; children: React.ReactNode; wide?: boolean }) { return <section className={`detail-section ${wide ? "wide" : ""}`}><h3>{title}</h3><div className="detail-grid">{children}</div></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="detail-info"><span>{label}</span><p>{value}</p></div>; }

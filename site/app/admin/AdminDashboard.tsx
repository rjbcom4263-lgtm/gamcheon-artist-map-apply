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
export type Account = {
  id: string;
  login_id: string;
  role: string;
  status: string;
  display_name: string;
  phone: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
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
const ACCOUNT_STATUS = {
  pending: "승인 대기",
  active: "활성",
  suspended: "정지",
  deleted: "삭제됨",
} as const;

function parse<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function date(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value + (value.endsWith("Z") ? "" : "Z")));
}

export default function AdminDashboard({ initial, initialAccounts, adminName }: { initial: Application[]; initialAccounts: Account[]; adminName: string }) {
  const [rows, setRows] = useState(initial);
  const [accounts, setAccounts] = useState(initialAccounts);
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

  async function deleteApplication(id: string) {
    const target = rows.find((row) => row.id === id);
    if (!target || !confirm(`${target.artist_name} 신청서를 삭제할까요?\n연결된 이미지 파일도 함께 삭제됩니다.`)) return;
    setSaving(id);
    const response = await fetch(`/api/admin/applications/${encodeURIComponent(id)}`, { method: "DELETE" });
    setSaving("");
    if (!response.ok) return alert("신청서를 삭제하지 못했습니다.");
    setRows((current) => {
      const nextRows = current.filter((row) => row.id !== id);
      setSelected((currentSelected) => currentSelected?.id === id ? nextRows[0] || null : currentSelected);
      return nextRows;
    });
  }

  async function changeAccountStatus(id: string, status: string) {
    setSaving(id);
    const response = await fetch(`/api/admin/accounts/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving("");
    if (!response.ok) return alert("계정 상태를 변경하지 못했습니다.");
    setAccounts((current) => current.map((account) => account.id === id ? { ...account, status } : account));
  }

  async function deleteAccount(id: string) {
    const target = accounts.find((account) => account.id === id);
    if (!target || !confirm(`${target.display_name || target.login_id} 계정을 삭제할까요?`)) return;
    setSaving(id);
    const response = await fetch(`/api/admin/accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
    setSaving("");
    if (!response.ok) return alert("계정을 삭제하지 못했습니다.");
    setAccounts((current) => current.filter((account) => account.id !== id));
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
      <section className="account-section">
        <div className="account-heading"><div><p>ACCOUNT MANAGEMENT</p><h2>회원가입 계정 관리</h2><span>비밀번호는 보안상 원문을 저장하지 않아 볼 수 없습니다. 필요하면 초기화 기능으로 처리합니다.</span></div><strong>{accounts.length}개 계정</strong></div>
        <div className="account-table">
          <div className="account-row account-head"><span>아이디</span><span>작가명</span><span>연락처</span><span>상태</span><span>가입일</span><span>관리</span></div>
          {accounts.length ? accounts.map((account) => <div className="account-row" key={account.id}>
            <span><strong>{account.login_id}</strong><small>{account.email || "이메일 없음"}</small></span>
            <span>{account.display_name || "-"}</span>
            <span>{account.phone || "-"}</span>
            <span><em className={`account-badge account-${account.status}`}>{ACCOUNT_STATUS[account.status as keyof typeof ACCOUNT_STATUS] || account.status}</em></span>
            <span>{date(account.created_at)}</span>
            <span className="account-actions">
              <button disabled={saving === account.id} onClick={() => changeAccountStatus(account.id, "active")}>활성</button>
              <button disabled={saving === account.id} onClick={() => changeAccountStatus(account.id, "suspended")}>정지</button>
              <button className="delete" disabled={saving === account.id} onClick={() => deleteAccount(account.id)}>삭제</button>
            </span>
          </div>) : <div className="admin-empty">회원가입한 작가 계정이 없습니다.</div>}
        </div>
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
            <section className="review-panel"><div><strong>운영자 처리</strong><span>반려·취소 사유를 기록하면 처리 시각과 함께 보관됩니다.</span></div><textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="예: 필수 작품 정보가 부족하여 보완 요청 후 반려 처리"/><div className="review-actions"><button disabled={saving === selected.id} onClick={() => changeStatus(selected.id, "received")}>접수로 복구</button><button disabled={saving === selected.id} onClick={() => changeStatus(selected.id, "cancelled")}>신청자 취소</button><button className="reject" disabled={saving === selected.id} onClick={() => changeStatus(selected.id, "rejected")}>반려 처리</button><button className="delete" disabled={saving === selected.id} onClick={() => deleteApplication(selected.id)}>접수 삭제</button></div>{payload.adminReview?.processedAt && <small>최근 처리: {date(payload.adminReview.processedAt)}</small>}</section>
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

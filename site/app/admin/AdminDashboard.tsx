"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type Application = { id: string; artist_name: string; phone: string; email: string; status: string; payload_json: string; image_keys_json: string; created_at: string };
export type Account = { id: string; login_id: string; role: string; status: string; display_name: string; phone: string; email: string; created_at: string; last_login_at: string | null };
type Work = { id?: string; title?: string; status?: string; description?: string };
type Payload = { values?: Record<string, string | boolean>; categories?: string[]; works?: Work[]; adminReview?: { note?: string } };
type ImageRecord = { type: string; workIndex?: number; key: string; name?: string };
type View = "applications" | "accounts";

const STATUS = { received: "접수", reviewing: "검토 중", approved: "승인", hold: "보류", rejected: "반려", cancelled: "신청자 취소" } as const;
const ACCOUNT_STATUS = { pending: "승인 대기", active: "활성", suspended: "정지", deleted: "삭제됨" } as const;

function parse<T>(value: string, fallback: T): T { try { return JSON.parse(value) as T; } catch { return fallback; } }
function date(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value + (value.endsWith("Z") ? "" : "Z")));
}

export default function AdminDashboard({ initial, initialAccounts, adminName }: { initial: Application[]; initialAccounts: Account[]; adminName: string }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState("");
  const [view, setView] = useState<View>("applications");
  const [selectedApplicationId, setSelectedApplicationId] = useState(initial[0]?.id || "");
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccounts[0]?.id || "");
  const [temporaryPassword, setTemporaryPassword] = useState<Record<string, string>>({});

  const filtered = useMemo(() => initial.filter((row) => {
    const matchesStatus = filter === "all" || row.status === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || `${row.artist_name} ${row.phone} ${row.email} ${row.id}`.toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  }), [initial, filter, query]);
  const counts = useMemo(() => ({
    all: initial.length,
    received: initial.filter((x) => x.status === "received").length,
    approved: initial.filter((x) => x.status === "approved").length,
    pendingAccounts: accounts.filter((x) => x.status === "pending").length,
  }), [initial, accounts]);

  async function changeAccountStatus(id: string, status: string) {
    setSaving(id);
    const response = await fetch(`/api/admin/accounts/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
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
    if (selectedAccountId === id) setSelectedAccountId("");
  }
  async function resetPassword(id: string) {
    const target = accounts.find((account) => account.id === id);
    if (!target || !confirm(`${target.display_name || target.login_id} 비밀번호를 1234로 초기화할까요?`)) return;
    setSaving(id);
    const response = await fetch(`/api/admin/accounts/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ resetPassword: true }) });
    const result = await response.json().catch(() => ({})) as { temporaryPassword?: string; error?: string };
    setSaving("");
    if (!response.ok || !result.temporaryPassword) return alert(result.error || "비밀번호를 초기화하지 못했습니다.");
    setTemporaryPassword((current) => ({ ...current, [id]: result.temporaryPassword || "" }));
    alert(`${target.display_name || target.login_id} 임시 비밀번호: ${result.temporaryPassword}`);
  }
  function linkedApplication(account: Account) {
    return initial.find((row) => row.phone === account.phone || (!!row.email && row.email === account.email) || row.artist_name === account.display_name);
  }

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) || accounts[0];
  const selectedApplication = selectedAccount ? linkedApplication(selectedAccount) : undefined;
  const selectedPayload = selectedApplication ? parse<Payload>(selectedApplication.payload_json, {}) : {};
  const selectedImages = selectedApplication ? parse<ImageRecord[]>(selectedApplication.image_keys_json, []) : [];
  const profileImage = selectedImages.find((image) => image.type === "profile");
  const previewWorks = selectedPayload.works || [];
  const selectedListApplication = filtered.find((row) => row.id === selectedApplicationId) || filtered[0];
  const listPayload = selectedListApplication ? parse<Payload>(selectedListApplication.payload_json, {}) : {};
  const listImages = selectedListApplication ? parse<ImageRecord[]>(selectedListApplication.image_keys_json, []) : [];
  const listProfileImage = listImages.find((image) => image.type === "profile");
  const listWorks = listPayload.works || [];

  return <div className="admin-dashboard">
    <aside className="dash-sidebar">
      <Link href="/" className="dash-logo"><span>감</span><strong>감천 작가 지도</strong></Link>
      <nav>
        <div className="nav-group"><p>신청 관리</p><button className={view === "applications" ? "active" : ""} onClick={() => setView("applications")}><span>◆</span>신청 목록</button></div>
        <button className={view === "accounts" ? "active" : ""} onClick={() => setView("accounts")}><span>●</span>계정 관리</button>
      </nav>
      <div className="dash-sidebar-card"><strong>{adminName}</strong><span>운영자 계정</span><a href="/api/admin/logout">로그아웃</a></div>
    </aside>
    <main className="dash-main">
      <header className="dash-top">
        <div><p>GAMCHEON ARTIST MAP</p><h1>{view === "applications" ? "작가 신청 관리" : "회원가입 계정 관리"}</h1></div>
        <div className="dash-actions"><a href="/api/admin/applications/export">CSV 다운로드</a><Link href="/">신청 화면</Link></div>
      </header>
      <section className="dash-metrics">
        <Metric label="전체 신청" value={counts.all}/><Metric label="신규 접수" value={counts.received}/><Metric label="승인 완료" value={counts.approved}/><Metric label="승인 대기 계정" value={counts.pendingAccounts}/>
      </section>
      {view === "applications" ? <div className="application-manager-grid">
        <section className="dash-card dash-table-card admin-list-wide">
          <div className="dash-card-head">
            <div><h2>신청 목록</h2><span>목록을 누르면 오른쪽에 지도 카드 미리보기와 빠른 확인 정보가 뜹니다.</span></div>
            <div className="dash-filters"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="작가명, 연락처, 접수번호"/><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">전체</option>{Object.entries(STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
          </div>
          <div className="application-table">
            <div className="table-row table-head"><span>작가</span><span>분야</span><span>상태</span><span>접수일</span><span>상세</span></div>
            {filtered.length ? filtered.map((row) => <button type="button" key={row.id} className={`table-row table-row-button ${selectedListApplication?.id === row.id ? "selected" : ""}`} onClick={() => setSelectedApplicationId(row.id)}>
              <span><strong>{row.artist_name}</strong><small>{row.id}</small></span>
              <span>{parse<Payload>(row.payload_json, {}).categories?.join(" · ") || "분야 미입력"}</span>
              <span><em className={`status status-${row.status}`}>{STATUS[row.status as keyof typeof STATUS] || row.status}</em></span>
              <span>{date(row.created_at)}</span>
              <span><b className="open-detail">미리보기</b></span>
            </button>) : <div className="admin-empty">조건에 맞는 신청서가 없습니다.</div>}
          </div>
        </section>
        <aside className="dash-card account-preview-card application-preview-card">
          {selectedListApplication ? <>
            <div className="dash-card-head"><div><h2>신청 미리보기</h2><span>{selectedListApplication.id}</span></div><em className={`status status-${selectedListApplication.status}`}>{STATUS[selectedListApplication.status as keyof typeof STATUS] || selectedListApplication.status}</em></div>
            <div className="account-profile">
              <Link className="linked-application" href={`/admin/applications/${encodeURIComponent(selectedListApplication.id)}`}>운영자 처리 열기</Link>
              <div className="map-preview-card">
                {listProfileImage ? <img src={`/api/admin/images?key=${encodeURIComponent(listProfileImage.key)}`} alt="지도 카드 대표 이미지"/> : <div className="map-preview-empty">대표 이미지 없음</div>}
                <div><span>{listPayload.categories?.join(" · ") || "분야 미입력"}</span><h3>{selectedListApplication.artist_name}</h3><p>{String(listPayload.values?.tagline || "한 줄 소개가 없습니다.")}</p></div>
              </div>
              <dl><div><dt>연락처</dt><dd>{selectedListApplication.phone}</dd></div><div><dt>이메일</dt><dd>{selectedListApplication.email || "-"}</dd></div><div><dt>공방</dt><dd>{String(listPayload.values?.studioName || "-")}</dd></div><div><dt>방문</dt><dd>{String(listPayload.values?.visitType || "-")}</dd></div></dl>
              <div className="preview-work-list">
                {listWorks.slice(0, 5).map((work, index) => {
                  const image = listImages.find((item) => item.type === "work" && item.workIndex === index);
                  return <div key={work.id || index}>{image ? <img src={`/api/admin/images?key=${encodeURIComponent(image.key)}`} alt={`${work.title || "작품"} 이미지`}/> : <span/>}<strong>{index + 1}. {work.title || "작품명 없음"}</strong></div>;
                })}
              </div>
            </div>
          </> : <div className="admin-empty">선택된 신청서가 없습니다.</div>}
        </aside>
      </div> : <div className="account-manager-grid">
        <section className="dash-card accounts-card">
          <div className="dash-card-head"><div><h2>작가 계정</h2><span>비밀번호는 원문 대신 운영자가 1234로 초기화해서 안내합니다.</span></div><strong>{accounts.length}개 계정</strong></div>
          <div className="account-table">
            <div className="account-row account-head"><span>아이디</span><span>작가명</span><span>연락처</span><span>상태</span><span>가입일</span><span>관리</span></div>
            {accounts.length ? accounts.map((account) => <div className={`account-row account-row-button ${selectedAccount?.id === account.id ? "selected" : ""}`} key={account.id} role="button" tabIndex={0} onClick={() => setSelectedAccountId(account.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedAccountId(account.id); }}>
              <span><strong>{account.login_id}</strong><small>{account.email || "이메일 없음"}</small>{temporaryPassword[account.id] && <small className="temporary-password">임시 비밀번호 {temporaryPassword[account.id]}</small>}</span><span>{account.display_name || "-"}</span><span>{account.phone || "-"}</span>
              <span><em className={`account-badge account-${account.status}`}>{ACCOUNT_STATUS[account.status as keyof typeof ACCOUNT_STATUS] || account.status}</em></span><span>{date(account.created_at)}</span>
              <span className="account-actions"><button type="button" disabled={saving === account.id} onClick={(event) => { event.stopPropagation(); changeAccountStatus(account.id, "active"); }}>활성</button><button type="button" disabled={saving === account.id} onClick={(event) => { event.stopPropagation(); changeAccountStatus(account.id, "suspended"); }}>정지</button><button type="button" disabled={saving === account.id} onClick={(event) => { event.stopPropagation(); resetPassword(account.id); }}>비번 1234</button><button type="button" className="delete" disabled={saving === account.id} onClick={(event) => { event.stopPropagation(); deleteAccount(account.id); }}>삭제</button></span>
            </div>) : <div className="admin-empty">회원가입한 작가 계정이 없습니다.</div>}
          </div>
        </section>
        <aside className="dash-card account-preview-card">
          {selectedAccount ? <>
            <div className="dash-card-head"><div><h2>작가 프로필</h2><span>{selectedAccount.login_id}</span></div><em className={`account-badge account-${selectedAccount.status}`}>{ACCOUNT_STATUS[selectedAccount.status as keyof typeof ACCOUNT_STATUS] || selectedAccount.status}</em></div>
            <div className="account-profile">
              <dl><div><dt>작가명</dt><dd>{selectedAccount.display_name || "-"}</dd></div><div><dt>전화</dt><dd>{selectedAccount.phone || "-"}</dd></div><div><dt>이메일</dt><dd>{selectedAccount.email || "-"}</dd></div><div><dt>최근 로그인</dt><dd>{date(selectedAccount.last_login_at)}</dd></div></dl>
              {selectedApplication ? <>
                <Link className="linked-application" href={`/admin/applications/${encodeURIComponent(selectedApplication.id)}`}>신청서 열기 · {selectedApplication.id}</Link>
                <div className="map-preview-card">
                  {profileImage ? <img src={`/api/admin/images?key=${encodeURIComponent(profileImage.key)}`} alt="지도 카드 대표 이미지"/> : <div className="map-preview-empty">대표 이미지 없음</div>}
                  <div><span>{selectedPayload.categories?.join(" · ") || "분야 미입력"}</span><h3>{selectedApplication.artist_name}</h3><p>{String(selectedPayload.values?.tagline || "한 줄 소개가 없습니다.")}</p></div>
                </div>
                <div className="preview-work-list">
                  {previewWorks.slice(0, 5).map((work, index) => {
                    const image = selectedImages.find((item) => item.type === "work" && item.workIndex === index);
                    return <div key={work.id || index}>{image ? <img src={`/api/admin/images?key=${encodeURIComponent(image.key)}`} alt={`${work.title || "작품"} 이미지`}/> : <span/>}<strong>{index + 1}. {work.title || "작품명 없음"}</strong></div>;
                  })}
                </div>
              </> : <div className="admin-empty compact">이 계정과 연결된 신청서가 아직 없습니다.</div>}
            </div>
          </> : <div className="admin-empty">선택된 계정이 없습니다.</div>}
        </aside>
      </div>}
    </main>
  </div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="metric-card"><span>{label}</span><strong>{value}</strong></div>; }

import { env } from "cloudflare:workers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireArtist } from "../admin/admin-auth";
import PasswordChangeForm from "./PasswordChangeForm";

export const dynamic = "force-dynamic";

type Account = { id: string; login_id: string; status: string; display_name: string; phone: string; email: string; created_at: string; last_login_at: string | null };
type Application = { id: string; artist_name: string; phone: string; email: string; status: string; payload_json: string; image_keys_json: string; created_at: string };
type Work = { id?: string; title?: string; status?: string; description?: string };
type Payload = { values?: Record<string, string | boolean>; categories?: string[]; works?: Work[]; adminReview?: { note?: string; processedAt?: string; status?: string } };
type ImageRecord = { type: string; workIndex?: number; key: string; name: string; contentType?: string };

const STATUS = { received: "접수", reviewing: "검토 중", approved: "승인", hold: "보류", rejected: "반려", cancelled: "신청자 취소" } as const;
const ACCOUNT_STATUS = { pending: "승인 대기", active: "활성", suspended: "정지", deleted: "삭제됨" } as const;

function parse<T>(value: string, fallback: T): T { try { return JSON.parse(value) as T; } catch { return fallback; } }
function date(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value + (value.endsWith("Z") ? "" : "Z")));
}

export default async function ArtistPage() {
  const artist = await requireArtist();
  if (!artist) redirect("/login");

  const account = await env.DB.prepare("SELECT id, login_id, status, display_name, phone, email, created_at, last_login_at FROM accounts WHERE id = ?")
    .bind(artist.accountId).first<Account>();
  const name = account?.display_name || artist.displayName;
  const phone = account?.phone || "";
  const email = account?.email || "";
  const result = await env.DB.prepare(`SELECT id, artist_name, phone, email, status, payload_json, image_keys_json, created_at
    FROM artist_applications
    WHERE phone = ? OR (email != '' AND email = ?) OR artist_name = ?
    ORDER BY created_at DESC
    LIMIT 5`).bind(phone, email, name).all<Application>();
  const applications = result.results || [];
  const current = applications[0];
  const payload = current ? parse<Payload>(current.payload_json, {}) : {};
  const images = current ? parse<ImageRecord[]>(current.image_keys_json, []) : [];
  const values = payload.values || {};
  const works = payload.works || [];
  const profile = images.find((image) => image.type === "profile");

  return <main className="artist-shell">
    <header className="artist-top"><div><strong>감천 작가 지도</strong><span>작가 페이지</span></div><nav><Link href="/">신청 화면</Link><a href="/api/auth/logout">로그아웃</a></nav></header>
    <section className="artist-home">
      <div className="artist-hero-panel">
        <div>
          <p>ARTIST ACCOUNT</p>
          <h1>{name}님</h1>
          <span>작가님이 제출한 신청 현황과 대표 작품 이미지를 확인할 수 있습니다.</span>
        </div>
        <div className="artist-state-stack">
          <div><span>계정 상태</span><strong>{ACCOUNT_STATUS[(account?.status || "pending") as keyof typeof ACCOUNT_STATUS] || account?.status || "승인 대기"}</strong></div>
          <div><span>최근 신청</span><strong>{current ? STATUS[current.status as keyof typeof STATUS] || current.status : "신청 없음"}</strong></div>
        </div>
      </div>

      {current ? <div className="artist-dashboard-grid">
        <section className="artist-card artist-summary-card">
          <div className="artist-card-head"><div><p>{current.id}</p><h2>{current.artist_name}</h2></div><em className={`status status-${current.status}`}>{STATUS[current.status as keyof typeof STATUS] || current.status}</em></div>
          <div className="artist-summary-layout">
            {profile && <img className="artist-profile-image" src={`/api/artist/images?key=${encodeURIComponent(profile.key)}`} alt="작가 프로필"/>}
            <dl>
              <div><dt>한 줄 소개</dt><dd>{String(values.tagline || "-")}</dd></div>
              <div><dt>분야</dt><dd>{payload.categories?.join(", ") || "-"}</dd></div>
              <div><dt>연락처</dt><dd>{current.phone}</dd></div>
              <div><dt>접수일</dt><dd>{date(current.created_at)}</dd></div>
            </dl>
          </div>
          {payload.adminReview?.note && <div className="artist-review-note"><strong>운영자 메모</strong><p>{payload.adminReview.note}</p></div>}
        </section>

        <section className="artist-card">
          <div className="artist-card-head"><div><p>ARTWORKS</p><h2>대표 작품 {works.length}점</h2></div></div>
          <div className="artist-work-grid">
            {works.map((work, index) => {
              const image = images.find((item) => item.type === "work" && item.workIndex === index);
              return <article className="artist-work-item" key={work.id || index}>
                {image ? <img src={`/api/artist/images?key=${encodeURIComponent(image.key)}`} alt={`${work.title || "대표 작품"} 이미지`}/> : <div className="artist-missing-image">이미지 없음</div>}
                <div><span>{index + 1}</span><strong>{work.title || "작품명 없음"}</strong><p>{work.description || "작품 설명이 없습니다."}</p><em>{work.status || ""}</em></div>
              </article>;
            })}
          </div>
        </section>

        <section className="artist-card artist-info-card">
          <div className="artist-card-head"><div><p>VISIT & LINKS</p><h2>방문 정보</h2></div></div>
          <dl>
            <div><dt>공방</dt><dd>{String(values.studioName || "-")}</dd></div>
            <div><dt>주소</dt><dd>{String(values.address || "-")}</dd></div>
            <div><dt>방문 방식</dt><dd>{String(values.visitType || "-")}</dd></div>
            <div><dt>운영시간</dt><dd>{String(values.hours || "-")}</dd></div>
            <div><dt>Instagram</dt><dd>{String(values.instagram || "-")}</dd></div>
            <div><dt>홈페이지</dt><dd>{String(values.website || "-")}</dd></div>
          </dl>
        </section>
        <section className="artist-card"><PasswordChangeForm /></section>
      </div> : <section className="artist-panel">
        <p>NO APPLICATION</p>
        <h1>아직 연결된 신청서가 없습니다.</h1>
        <span>작가 신청서를 작성하면 이 화면에서 접수 상태와 대표 작품 5점을 확인할 수 있습니다.</span>
        <div className="artist-status"><strong>현재 상태</strong><em>신청 필요</em></div>
        <div className="artist-actions"><Link href="/">새 신청서 작성</Link><Link href="/login">다른 계정 로그인</Link></div>
        <PasswordChangeForm />
      </section>}
    </section>
  </main>;
}

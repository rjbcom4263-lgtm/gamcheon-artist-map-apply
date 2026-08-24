import { redirect } from "next/navigation";
import { requireArtist } from "../admin/admin-auth";

export const dynamic = "force-dynamic";

export default async function ArtistPage() {
  const artist = await requireArtist();
  if (!artist) redirect("/login");

  return <main className="artist-shell">
    <header className="artist-top"><div><strong>감천 작가 지도</strong><span>작가 페이지</span></div><a href="/api/auth/logout">로그아웃</a></header>
    <section className="artist-panel">
      <p>ARTIST ACCOUNT</p>
      <h1>{artist.displayName}님</h1>
      <span>회원가입이 완료되었습니다. 운영자가 확인한 뒤 작가 정보와 작품 관리 기능을 순차적으로 열 수 있습니다.</span>
      <div className="artist-status"><strong>현재 상태</strong><em>승인 대기</em></div>
      <div className="artist-actions"><a href="/">새 신청서 작성</a><a href="/login">다른 계정 로그인</a></div>
    </section>
  </main>;
}

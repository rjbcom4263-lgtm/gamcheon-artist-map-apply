import Link from "next/link";

const benefits = [
  {
    title: "작가님의 공간이 지도가 됩니다",
    text: "감천문화마을을 찾는 방문객에게 작가님의 이름과 작업 공간이 정식으로 소개됩니다.",
  },
  {
    title: "작품을 이야기로 전합니다",
    text: "작가님이 직접 쓴 소개글과 대표 작품 5점이 방문객을 맞이합니다.",
  },
  {
    title: "언제든 수정하고 갱신할 수 있습니다",
    text: "승인 후에도 정보를 수정 요청할 수 있어 항상 최신 상태로 유지됩니다.",
  },
];

const flow = [
  ["1", "참여 신청", "온라인 신청서 작성"],
  ["2", "운영팀 검토", "제출 내용 확인"],
  ["3", "승인 안내", "이메일로 결과 통보"],
  ["4", "지도 공개", "감천 작가 지도 등재"],
];

const prep = [
  ["01", "대표 작품 5점", "이미지, 제목, 설명"],
  ["02", "작가 소개", "한 줄 소개와 작업 이야기"],
  ["03", "공방 정보", "주소 공개 범위와 방문 방식"],
  ["04", "연락처", "운영자 확인용 휴대전화"],
];

export default function HomePage() {
  return <main className="make-home">
    <section className="make-phone-shell">
      <header className="make-mobile-header">
        <Link href="/" className="make-brand">
          <span>감</span>
          <strong>감천 작가 지도<small>GAMCHEON ARTIST MAP</small></strong>
        </Link>
        <Link href="/login">로그인</Link>
      </header>

      <section className="make-hero-card">
        <div className="make-village-art" aria-hidden="true">
          <i className="hill hill-a" />
          <i className="hill hill-b" />
          <i className="house house-a" />
          <i className="house house-b" />
          <i className="house house-c" />
          <i className="house house-d" />
        </div>
        <p>작가 참여 안내</p>
        <h1>감천의 예술을<br />함께 기록합니다</h1>
        <span>감천문화마을 작가·공방·예술 공간을 하나의 지도에 담아 더 많은 이들에게 전합니다.</span>
      </section>

      <div className="make-main-actions">
        <Link href="/apply">작가 참여 신청하기</Link>
        <Link href="/login">이미 신청하셨나요? 로그인</Link>
      </div>

      <section className="make-note-card">
        <b>감천문화마을에서 활동 중인 작가·공방·예술 공간</b>이라면 누구든 무료로 참여하실 수 있습니다. 신청 후 운영팀 검토를 거쳐 지도에 게재됩니다.
      </section>

      <section className="make-section">
        <div className="make-section-head"><span>참여하면 달라지는 것</span></div>
        <div className="make-benefit-list">
          {benefits.map((item) => <article key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </article>)}
        </div>
      </section>

      <section className="make-section">
        <h2>신청부터 지도 등재까지</h2>
        <div className="make-flow">
          {flow.map(([num, title, text]) => <div key={title}>
            <span>{num}</span>
            <strong>{title}</strong>
            <small>{text}</small>
          </div>)}
        </div>
      </section>

      <section className="make-section">
        <h2>신청 전 준비할 것</h2>
        <div className="make-prep-list">
          {prep.map(([num, title, text]) => <article key={title}>
            <span>{num}</span>
            <div><strong>{title}</strong><small>{text}</small></div>
          </article>)}
        </div>
      </section>

      <section className="make-map-card" id="map-preview">
        <p>감천 작가 지도 미리보기</p>
        <span>승인된 작가님의 공간은 지도 카드로 공개됩니다.</span>
        <Link href="/login">내 정보에서 확인하기</Link>
      </section>

      <footer className="make-contact">
        <span>문의 · 감천 작가 지도 운영팀</span>
        <a href="mailto:gamcheon.artist.map@gmail.com">gamcheon.artist.map@gmail.com</a>
      </footer>
    </section>

    <section className="make-desktop-panel">
      <p>GAMCHEON ART MAP</p>
      <h2>작가님의 작품과 공간을 먼저 존중하는 참여형 지도 프로젝트</h2>
      <span>모바일에서는 작가님이 신청하기 쉬운 앱형 흐름으로, PC에서는 프로젝트 설명과 운영자 관리가 편한 웹형 구조로 확장합니다.</span>
      <div>
        <Link href="/apply">작가 참여 신청</Link>
        <Link href="/login">로그인</Link>
      </div>
    </section>

    <nav className="make-tabbar" aria-label="모바일 주요 메뉴">
      <Link href="/">홈</Link>
      <Link href="/apply">신청</Link>
      <Link href="#map-preview">지도</Link>
      <Link href="/login">내정보</Link>
    </nav>
  </main>;
}

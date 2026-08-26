import Link from "next/link";

const features = [
  { title: "프로젝트 소개", text: "감천의 작가와 공방을 한눈에 이해할 수 있도록 참여 목적과 공개 방식을 먼저 안내합니다." },
  { title: "작가 참여 신청", text: "작가 소개, 공방 정보, 대표 작품 5점을 차분히 작성할 수 있는 신청 흐름을 만듭니다." },
  { title: "내 정보 관리", text: "작가님이 로그인 후 신청 상태와 등록 정보를 확인하고 필요한 내용을 보완할 수 있게 합니다." },
  { title: "운영자 관리", text: "운영자가 신청서, 계정, 이미지, 지도 미리보기를 새 페이지 기준으로 관리합니다." },
];

const steps = ["작가 참여 신청", "운영자 확인", "지도 카드 정리", "시범 공개 준비"];
const quickActions = ["신청", "내 정보", "지도", "문의"];

export default function LandingSamplePage() {
  return <main className="landing-sample artist-intro-sample">
    <nav className="landing-nav">
      <Link href="/landing-sample" className="landing-brand"><span>감</span><strong>감천 작가 지도</strong></Link>
      <div><Link href="/login">작가 로그인</Link><Link className="nav-primary" href="/apply">참여 신청</Link></div>
    </nav>

    <section className="landing-hero artist-intro-hero">
      <div className="artist-hero-map" aria-hidden="true">
        <span className="hero-path hero-path-a" />
        <span className="hero-path hero-path-b" />
        <span className="hero-path hero-path-c" />
        <span className="hero-path hero-path-d" />
        <span className="hero-studio studio-a">공방</span>
        <span className="hero-studio studio-b">작품</span>
        <span className="hero-studio studio-c">전시</span>
      </div>
      <div className="landing-hero-shade"/>
      <div className="landing-hero-copy artist-hero-layout">
        <div>
          <p>GAMCHEON ART MAP</p>
          <h1>감천의 예술을 작가님의 언어로 소개합니다</h1>
          <span>작품, 공방, 방문 정보를 무리하게 관광 콘텐츠로 소비하지 않고 작가님의 작업을 먼저 보여주는 참여형 지도 프로젝트입니다.</span>
          <div className="landing-hero-actions"><Link href="/apply">작가 참여 신청하기</Link><Link href="#project">프로젝트 살펴보기</Link></div>
        </div>
        <div className="artist-mobile-home" aria-label="감천 아트맵 모바일 홈 미리보기">
          <div className="mobile-status"><strong>감천 아트맵</strong><span>알림</span></div>
          <div className="mobile-visual"><span>GAMCHEON</span></div>
          <h2>감천의 예술을 발견하고 참여하세요</h2>
          <p>작가님 소개와 대표 작품 5점을 먼저 정리하고 운영자가 확인합니다.</p>
          <Link className="mobile-search" href="/apply">작가 참여 신청 바로가기</Link>
          <div className="mobile-actions">
            {quickActions.map((action) => <Link href={action === "내 정보" ? "/login" : action === "신청" ? "/apply" : "#project"} key={action}>{action}</Link>)}
          </div>
          <div className="mobile-recommend">
            <div><strong>참여 준비</strong><Link href="/apply">작성하기</Link></div>
            <article><span>01</span><div><b>대표 작품 5점</b><small>이미지, 제목, 설명</small></div></article>
            <article><span>02</span><div><b>공방 방문 정보</b><small>주소 공개 범위와 예약 방식</small></div></article>
          </div>
          <nav className="mobile-tabbar"><span>홈</span><span>신청</span><span>지도</span><span>내정보</span></nav>
        </div>
        <div className="artist-web-preview" aria-label="감천 작가 지도 웹 화면 미리보기">
          <div className="web-preview-top"><strong>감천 아트맵</strong><span>Artist Preview</span></div>
          <div className="web-preview-body">
            <div className="web-map">
              <i className="web-road road-a" /><i className="web-road road-b" /><i className="web-road road-c" />
              <b className="web-pin pin-1">1</b><b className="web-pin pin-2">2</b><b className="web-pin pin-3">3</b>
            </div>
            <div className="web-list">
              <span>추천 작가와 공방</span>
              <strong>바람빛 도예</strong>
              <p>도예 · 감천문화마을 · 방문 예약</p>
              <strong>빛의 유리 공방</strong>
              <p>스테인드글라스 · 전시 작품</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="artist-intro-statement" id="project">
      <p>PROJECT NOTE</p>
      <h2>감천 작가 지도는 관광 안내보다 먼저, 작가님의 작업을 존중하는 소개 방식부터 고민합니다.</h2>
      <span>신청된 정보는 바로 공개하지 않고 운영자가 확인합니다. 작품 이미지, 소개 문장, 공방 방문 정보가 작가님의 의도와 다르게 보이지 않도록 정리하는 과정을 거칩니다.</span>
    </section>

    <section className="landing-section">
      <div className="landing-section-head"><div><p>HOW IT WORKS</p><h2>이렇게 소개됩니다</h2></div><Link href="/apply">신청 시작</Link></div>
      <div className="artist-feature-grid artist-core-grid">
        {features.map((feature, index) => <article className="artist-feature-card" key={feature.title}>
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <h3>{feature.title}</h3>
          <p>{feature.text}</p>
        </article>)}
      </div>
    </section>

    <section className="artist-preview-section">
      <div className="artist-preview-copy">
        <p>PREVIEW</p>
        <h2>작가 카드로 먼저 정리하고, 지도와 연결합니다.</h2>
        <span>작가명, 분야, 한 줄 소개, 대표 작품 5점, 공방 방문 정보가 하나의 카드와 상세 화면으로 이어집니다.</span>
      </div>
      <div className="artist-card-preview">
        <div className="artist-card-image"><img src="/og.png" alt="작품 카드 예시"/></div>
        <div className="artist-card-body"><span>일러스트 · 지도 · 공예</span><h3>감천 골목을 기록하는 작가</h3><p>작품과 공간, 방문 정보를 함께 소개하는 작가 카드 예시입니다.</p></div>
      </div>
    </section>

    <section className="artist-ready-section">
      <div><p>READY</p><h2>신청 전 준비할 것</h2></div>
      <ul>
        <li><strong>대표 작품 5점</strong><span>작품 이미지와 제목, 짧은 설명</span></li>
        <li><strong>작가 소개</strong><span>한 줄 소개와 작업 세계에 대한 설명</span></li>
        <li><strong>공방 정보</strong><span>주소 공개 범위, 방문 방식, 운영시간</span></li>
        <li><strong>연락처</strong><span>운영자가 확인할 수 있는 휴대전화</span></li>
      </ul>
    </section>

    <section className="artist-step-section">
      {steps.map((step, index) => <div key={step}><span>{index + 1}</span><strong>{step}</strong></div>)}
    </section>

    <section className="landing-passport artist-cta-section">
      <div><p>JOIN</p><h2>감천 작가 지도 시범 참여 신청</h2><span>지금은 작가님 정보를 먼저 모으고, 운영자가 확인한 뒤 지도 공개와 Art Passport 연동을 순차적으로 준비합니다.</span></div>
      <Link href="/apply">작가 참여 신청하기</Link>
    </section>
  </main>;
}

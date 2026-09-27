# 감천 작가 플랫폼

감천의 작가·작품·공간을 연결하는 작가 홈페이지와 카카오 지도 제작 도구를 함께 관리하는 공개 저장소입니다.

## 프로젝트

- `site/` — 작가 홈페이지, 회원·관리자 기능, Cloudflare Workers/D1/R2
- `tools/kakao-tile-map/` — 카카오 지도 타일 선택, 캡처, 좌표 병합 PNG 저장 도구

## 로컬 실행

### 작가 홈페이지

```bash
cd site
npm ci
npm run dev
```

### 카카오 지도 도구

```bash
cd tools/kakao-tile-map
npm ci
copy .env.example .env.local
npm run dev
```

`tools/kakao-tile-map/.env.local`의 `VITE_KAKAO_MAP_KEY`에는 카카오 Developers JavaScript 키를 입력합니다. 실제 환경변수 파일은 Git에 포함하지 않습니다.

## 현재 서비스

- 작가 홈페이지: https://gamcheon-artist-map-apply.rjbcom4263.workers.dev/
- 카카오 지도 도구: https://kakao-tile-map.web.app/

## GitHub에서 홈페이지 수정

- 첫 화면: `site/app/landing-sample/` (`site/app/page.tsx`에서 연결)
- 공통 스타일과 이미지: `site/app/globals.css`, `site/app/agency.css`, `site/public/assets/`
- 작가 지도와 관리자 화면: `site/app/map/`, `site/app/admin/`

GitHub에 저장한 수정은 자동으로 운영 사이트에 적용되지 않습니다. Cloudflare 배포 권한이 있는 환경에서 `site/`로 이동해 `npx vinext build`와 `npx wrangler deploy`를 실행해야 합니다. 비밀값은 GitHub에 올리지 않고 Cloudflare 환경변수로 관리합니다.

## 저장소 정책

이 저장소는 공개되어 있어 누구나 열람하고 복제할 수 있습니다. 원본 저장소에 직접 수정하거나 배포하려면 별도 협업 권한과 각 배포 서비스 권한이 필요합니다.

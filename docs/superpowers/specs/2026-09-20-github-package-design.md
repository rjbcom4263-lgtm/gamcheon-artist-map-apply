# 감천 작가 플랫폼 GitHub 패키지 설계

## 목적

사용자 소유 GitHub 저장소 `rjbcom4263-lgtm/gamcheon-artist-map-apply` 하나에 현재 작가 홈페이지 전체와 카카오 타일 지도 도구 전체를 함께 보관한다. 이번 작업은 GitHub 소스 업로드만 수행하며 Cloudflare Workers와 Firebase Hosting의 실제 배포 구성은 변경하지 않는다.

## 저장소 구조

```text
gamcheon-artist-map-apply/
├─ site/                    기존 작가 홈페이지와 Cloudflare Worker
├─ tools/
│  └─ kakao-tile-map/      카카오 타일 선택·캡처·병합 도구
├─ docs/
└─ README.md
```

기존 `site/` 경로는 이동하지 않는다. 현재 Cloudflare 빌드와 Wrangler 설정이 이 경로를 기준으로 동작하기 때문이다. 카카오 지도 도구는 독립 Vite 애플리케이션으로 `tools/kakao-tile-map/`에 추가한다.

## 포함 범위

- 현재 작가 홈페이지의 소스, 관리자 화면, 로그인 연동, API, 테스트, 정적 자산
- 현재 카카오 지도 도구의 소스, 테스트, Firebase 설정, 패키지 잠금 파일
- 두 애플리케이션의 설치·테스트·빌드·기존 배포 주소를 설명하는 루트 README
- 현재 로컬에서 완료했지만 아직 커밋하지 않은 작가 홈페이지 변경사항

## 제외 범위

- `node_modules/`, 빌드 산출물, Wrangler 로컬 상태, Firebase 로컬 상태
- `.env`, `.env.local` 등 실제 환경변수 파일
- API 키, OAuth 비밀키, 관리자 비밀번호와 세션 정보
- GitHub Pages 또는 GitHub Actions 신규 배포
- Cloudflare/Firebase 실서비스 재배포

## 안전 기준

1. 카카오 지도 도구 내부의 기존 `.git` 폴더를 포함하지 않는다.
2. 환경변수 예시는 빈 값만 담은 `.env.example`로 제공한다.
3. 커밋 전 추적 대상 파일에서 일반적인 키·토큰·비밀번호 패턴을 검사한다.
4. 두 애플리케이션의 테스트와 빌드를 각각 실행한 뒤 한 커밋으로 푸시한다.
5. 원격 저장소는 사용자 소유 `origin`만 사용한다.

## 완료 조건

- GitHub 저장소에서 `site/`와 `tools/kakao-tile-map/`을 모두 확인할 수 있다.
- 비밀 환경변수 파일과 의존성·빌드 폴더가 추적되지 않는다.
- 작가 홈페이지와 지도 도구의 테스트 및 빌드가 통과한다.
- `main` 브랜치가 사용자 소유 원격 저장소에 성공적으로 푸시된다.

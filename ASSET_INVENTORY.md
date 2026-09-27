# 클론 자산 인벤토리

| asset | type | used in | local path | status | notes |
|---|---|---|---|---|---|
| Artist studio hero | PNG | hero, impact, video, CTA | `site/public/assets/clone/hero-artist-studio.png` | generated original | ImageGen으로 생성. 원본 브랜드·작가 자산 미사용 |
| Artist goods still life | PNG | hero, goods, video | `site/public/assets/clone/artist-goods.png` | generated original | ImageGen으로 생성. 읽을 수 있는 상표·텍스트 없음 |
| Gamcheon map concept | PNG | hero, platform, news, goods | `site/public/gamcheon-map-concept.png` | existing project asset | 기존 프로젝트 자산 재사용 |
| Gamcheon OG illustration | PNG | news | `site/public/og.png` | existing project asset | 기존 프로젝트 자산 재사용 |
| Wordmark | HTML/CSS text | header, loader, footer | `site/app/landing-sample/content.ts` | replaceable | 보호 로고를 복제하지 않은 텍스트 워드마크 |
| Navigation and copy | TypeScript data | full page | `site/app/landing-sample/content.ts` | replaceable | 브랜드 치환용 중앙 콘텐츠 레이어 |

## 교체 방법

이미지는 `site/public/assets/clone`의 동일 파일명으로 교체하거나 `content.ts`의 경로를 수정한다. 브랜드명·메뉴·슬라이드·뉴스·상품·파트너 목록도 `content.ts`에서 교체할 수 있다.

## 생성 프롬프트 요약

- `hero-artist-studio.png`: 한국의 언덕마을 작업실에서 작업하는 익명의 성인 작가, 왼쪽 카피 공간이 있는 저조도 와이드 에디토리얼 사진.
- `artist-goods.png`: 가상의 로컬 작가 작품을 활용한 프린트·컵·패브릭·지도 상품을 전시한 밝은 에디토리얼 제품 사진.

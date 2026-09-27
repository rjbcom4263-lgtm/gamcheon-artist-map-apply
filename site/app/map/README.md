# 감천 작가 지도 시안

> 아래는 이전 일러스트 시안 기록입니다. 현재 `/`와 `/map`은 실제 GPS 지도로 전환되었으며 [현재 지도 설명](./GPS-README.md)을 참고하세요.

메인 `/`와 `/map`에서 같은 지도를 제공합니다. 기존 신청, 로그인, 관리자 페이지와 `/figma-preview`는 유지했습니다.

작가 6명과 작품, 작업실, 설명, 위치는 전부 가상 예시입니다. 데이터베이스의 승인 작가와 연결하지 않았습니다. 실제 방문용 지도, GPS 좌표, 보행 경로, 영업 상태를 제공하지 않습니다. 실제 운영에는 동의를 받은 작가 자료 및 정확한 작업실·작품 좌표와 현장 검증이 필요합니다.

`artists.ts`에서 작가 데이터를 관리합니다. x/y와 wx/wy는 콘셉트 이미지 위의 백분율 위치이며 위경도가 아닙니다. 점선은 작가와 작품의 관계만 나타냅니다.

검증: Node 22.13 이상에서 `node --test tests/artist-map.test.mjs`. Windows에서는 기존 Linux용 빌드 래퍼의 실제 명령인 `node_modules/.bin/vinext.cmd build`로 빌드할 수 있습니다. 미리보기는 `node_modules/.bin/vite.cmd --host 127.0.0.1 --port 5173 --strictPort`입니다.

전체 프로젝트 타입 검사에는 기존 관리자·신청·Cloudflare 타입 오류가 남아 있습니다. 이번 지도 파일만 별도로 타입 검사합니다.

## 이미지 기록

파일: `public/gamcheon-map-concept.png` (1536 × 1024)

제작: 내장 Imagegen 도구, 2026-09-09. 실제 감천의 지리 자료를 기반으로 하지 않은 콘셉트 그림입니다.

프롬프트: “Conceptual Gamcheon-inspired village in high-angle 2.5D axonometric editorial illustration; terraced colorful flat-roof houses, white winding paths and stairs, restrained teal/blue/orange/yellow palette, green hill above, small sea glimpse lower right, crisp shapes with soft paper texture, central breathing room for overlay pins. Landscape 3:2. No text, pins, UI, or portraits.”

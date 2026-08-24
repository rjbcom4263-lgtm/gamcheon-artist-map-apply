# 감천 작가 지도 신청 사이트 인수인계

## 구성

- `site/`: 사이트 전체 소스
- `database/schema.sql`: Cloudflare D1 테이블 및 인덱스 생성 SQL
- `site/.env.example`: 관리자 환경변수 예시(실제 비밀번호/비밀값 미포함)

## 저장 구조

- 신청서 텍스트 및 상태: Cloudflare D1의 `artist_applications` 테이블
- 작품 이미지 원본: Cloudflare R2의 `BUCKET` 바인딩
- 이미지 경로와 메타데이터: `image_keys_json`
- 신청서의 상세 입력값: `payload_json`

이미지는 DB 안에 Base64로 넣지 않고 R2에 파일로 저장합니다. 따라서 D1 데이터만 백업하면 이미지 파일은 포함되지 않으며, R2 버킷도 별도로 백업해야 합니다.

## 상태값

- `received`: 접수
- `reviewing`: 검토 중
- `approved`: 승인
- `hold`: 보류
- `rejected`: 반려
- `cancelled`: 신청자 취소

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
cd site
npm ci
npm run dev
```

## DB 생성

Cloudflare D1 데이터베이스에 아래 SQL을 실행합니다.

```bash
wrangler d1 execute <DATABASE_NAME> --file=../database/schema.sql --remote
```

사이트의 `.openai/hosting.json`은 다음 바인딩 이름을 사용합니다.

- D1: `DB`
- R2: `BUCKET`

## 관리자 환경변수

필수 환경변수는 다음 3개입니다.

- `ADMIN_USERNAME`: 관리자 아이디
- `ADMIN_PASSWORD_HASH`: 관리자 비밀번호의 SHA-256 해시
- `ADMIN_SESSION_SECRET`: 로그인 세션 서명용 비밀 문자열

비밀번호 해시는 다음처럼 만들 수 있습니다.

```bash
node -e "const c=require('node:crypto'); console.log(c.createHash('sha256').update(process.argv[1]).digest('hex'))" '새비밀번호'
```

실제 운영 비밀번호와 세션 비밀값은 소스 또는 Git에 저장하지 말고 배포 환경의 Secrets/Variables에만 등록하세요.

## 주요 경로

- `/`: 작가 신청 화면
- `/admin/login`: 운영자 로그인
- `/admin`: 신청 목록, 상세 확인, 접수 복구·취소·반려 처리
- `/api/applications`: 신청서 및 이미지 업로드
- `/api/admin/applications/export`: 관리자용 CSV 내보내기

## 백업 시 주의

완전한 백업에는 아래 두 항목이 모두 필요합니다.

1. D1의 `artist_applications` 데이터
2. R2 버킷의 `applications/` 폴더

둘 중 하나만 백업하면 신청서와 작품 이미지의 연결이 불완전해질 수 있습니다.

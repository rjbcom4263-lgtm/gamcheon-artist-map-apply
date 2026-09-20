# 감천 작가 플랫폼 GitHub 패키지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 작가 홈페이지와 카카오 타일 지도 도구를 사용자 소유 공개 GitHub 저장소 하나에 안전하게 패키징하고 `main` 브랜치에 푸시한다.

**Architecture:** 기존 Cloudflare 프로젝트의 `site/` 경로와 배포 설정은 그대로 유지한다. 독립 Vite 앱인 카카오 지도 도구를 `tools/kakao-tile-map/`에 추가하고, 공통 저장소 루트에서 문서와 제외 규칙만 관리한다. 실제 Cloudflare Workers와 Firebase Hosting 배포는 실행하지 않는다.

**Tech Stack:** Git, GitHub, PowerShell, React, Vite, Vitest, Next.js/vinext, Cloudflare Workers, Firebase Hosting 설정 파일

**Spec:** `docs/superpowers/specs/2026-09-20-github-package-design.md`

## Global Constraints

- 원격 저장소는 `https://github.com/rjbcom4263-lgtm/gamcheon-artist-map-apply.git`만 사용한다.
- 저장소 가시성은 `Public`으로 유지한다.
- 기존 `site/` 경로를 이동하거나 Cloudflare/Firebase 실서비스를 재배포하지 않는다.
- `.env`, `.env.local`, API 비밀키, OAuth 비밀키, 비밀번호와 세션 정보는 커밋하지 않는다.
- `node_modules/`, `dist/`, `.wrangler/`, `.firebase/`, `*.tsbuildinfo`를 커밋하지 않는다.
- 카카오 지도 도구의 중첩 `.git` 저장소와 생성 결과물 `output/`은 포함하지 않는다.
- 현재 작가 홈페이지의 로컬 변경사항을 삭제하거나 되돌리지 않는다.

## Review Focus

- 중첩 환경변수 파일: 어떤 하위 폴더에서도 `.env.example`만 추적되고 실제 `.env*`는 제외되어야 한다.
- 중첩 저장소: `tools/kakao-tile-map/.git`이 없어야 단일 Git 이력이 유지된다.
- 대용량 파일: GitHub 제한에 걸리는 100MB 이상 파일이 스테이징되지 않아야 한다.
- 독립 빌드: `site/`와 `tools/kakao-tile-map/`이 각각 자신의 명령으로 테스트·빌드되어야 한다.
- 공개 원격 검증: 푸시 후 GitHub API에서 `visibility=public`, 기본 브랜치 `main`, 두 앱의 대표 파일 존재가 확인되어야 한다.

---

### Task 1: 카카오 지도 도구를 독립 하위 앱으로 추가

**Files:**
- Create: `tools/kakao-tile-map/.env.example`
- Create: `tools/kakao-tile-map/.firebaserc`
- Create: `tools/kakao-tile-map/.gitignore`
- Create: `tools/kakao-tile-map/README.md`
- Create: `tools/kakao-tile-map/firebase.json`
- Create: `tools/kakao-tile-map/index.html`
- Create: `tools/kakao-tile-map/package.json`
- Create: `tools/kakao-tile-map/package-lock.json`
- Create: `tools/kakao-tile-map/tsconfig.json`
- Create: `tools/kakao-tile-map/vite.config.ts`
- Create: `tools/kakao-tile-map/src/**`

**Interfaces:**
- Consumes: `C:\Users\새김\Documents\ChatGPT\감천 작가 지도\tmp\map-grid`의 현재 지도 도구 소스
- Produces: 루트 저장소에서 독립 설치·테스트·빌드 가능한 `tools/kakao-tile-map` Vite 앱

- [ ] **Step 1: 대상 앱이 아직 없음을 확인한다**

```powershell
Test-Path -LiteralPath 'tools\kakao-tile-map\src\App.tsx'
```

Expected: `False`.

- [ ] **Step 2: 소스와 설정을 명시적으로 복사한다**

```powershell
$sourceRoot = 'C:\Users\새김\Documents\ChatGPT\감천 작가 지도\tmp\map-grid'
$destinationRoot = 'C:\Users\새김\Documents\ChatGPT\감천 작가 지도\gamcheon-artist-apply-package-v1\tools\kakao-tile-map'
$resolvedRepo = (Resolve-Path -LiteralPath '.').Path
if (-not $destinationRoot.StartsWith($resolvedRepo, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Destination escaped the repository: $destinationRoot"
}
New-Item -ItemType Directory -Path $destinationRoot -Force | Out-Null
foreach ($name in @('.env.example', '.firebaserc', '.gitignore', 'README.md', 'firebase.json', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts')) {
  Copy-Item -LiteralPath (Join-Path $sourceRoot $name) -Destination (Join-Path $destinationRoot $name)
}
Copy-Item -LiteralPath (Join-Path $sourceRoot 'src') -Destination (Join-Path $destinationRoot 'src') -Recurse
```

Expected: 명시한 파일과 `src/`만 복사된다.

- [ ] **Step 3: 금지된 로컬 상태가 들어오지 않았는지 검사한다**

```powershell
$forbidden = @(
  'tools\kakao-tile-map\.git',
  'tools\kakao-tile-map\.env.local',
  'tools\kakao-tile-map\node_modules',
  'tools\kakao-tile-map\dist',
  'tools\kakao-tile-map\.firebase',
  'tools\kakao-tile-map\output'
)
$present = $forbidden | Where-Object { Test-Path -LiteralPath $_ }
if ($present) { throw "Forbidden paths copied: $($present -join ', ')" }
```

Expected: 종료 코드 `0`, 출력 없음.

- [ ] **Step 4: 지도 도구 테스트와 공개 설정 빌드를 실행한다**

```powershell
Push-Location 'tools\kakao-tile-map'
npm ci
npm test
$env:VITE_KAKAO_MAP_KEY = 'public-build-verification-value'
npm run build
Remove-Item Env:VITE_KAKAO_MAP_KEY
Pop-Location
```

Expected: Vitest 전체 통과, TypeScript와 Vite 빌드 종료 코드 `0`.

- [ ] **Step 5: 지도 도구를 커밋한다**

```powershell
git add -- tools/kakao-tile-map
git commit -m "feat: package Kakao tile map tool"
```

Expected: 지도 도구 소스와 빈 환경변수 예시만 커밋된다.

### Task 2: 공개 모노레포 문서와 제외 규칙 정리

**Files:**
- Modify: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: 기존 `site/`와 Task 1의 `tools/kakao-tile-map/`
- Produces: 두 앱의 위치·명령·공개 주소를 설명하는 루트 문서와 재발 방지용 Git 제외 규칙

- [ ] **Step 1: 현재 제외 규칙이 중첩 환경 파일을 막지 못함을 확인한다**

```powershell
git check-ignore 'tools/kakao-tile-map/.env.local'
```

Expected: 종료 코드 `1`; 아직 루트 규칙으로 중첩 `.env.local`을 보장하지 못한다.

- [ ] **Step 2: 루트 `.gitignore`를 다음 내용으로 확장한다**

```gitignore
figma-make-import/src/imports/image.png
site/qa/

**/node_modules/
**/dist/
**/.wrangler/
**/.firebase/
**/.env
**/.env.*
!**/.env.example
**/*.tsbuildinfo
```

- [ ] **Step 3: 루트 README를 작성한다**

```markdown
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

## 저장소 정책

이 저장소는 공개되어 있어 누구나 열람하고 복제할 수 있습니다. 원본 저장소에 직접 수정하거나 배포하려면 별도 협업 권한과 각 배포 서비스 권한이 필요합니다.
```

- [ ] **Step 4: 제외 규칙을 검증한다**

```powershell
git check-ignore 'tools/kakao-tile-map/.env.local'
if ($LASTEXITCODE -ne 0) { throw '.env.local is not ignored' }
git check-ignore 'tools/kakao-tile-map/.env.example'
if ($LASTEXITCODE -eq 0) { throw '.env.example must remain trackable' }
git check-ignore 'site/node_modules/example.js'
if ($LASTEXITCODE -ne 0) { throw 'nested node_modules is not ignored' }
```

Expected: 종료 코드 `0`.

- [ ] **Step 5: 문서를 커밋한다**

```powershell
git add -- .gitignore README.md
git commit -m "docs: describe public platform repository"
```

Expected: 제외 규칙과 루트 README만 새 커밋에 포함된다.

### Task 3: 작가 홈페이지 변경사항 검증·공개 푸시

**Files:**
- Modify: 현재 `git status --short`에 표시되는 `site/**`, `.gitignore`, 루트 문서
- Create: 현재 `git status --short`에 표시되는 신규 작가 홈페이지 파일과 자산

**Interfaces:**
- Consumes: Task 1의 지도 도구, Task 2의 문서와 제외 규칙, 현재 로컬 작가 홈페이지 변경사항
- Produces: 공개 GitHub `main` 브랜치의 검증된 통합 소스

- [ ] **Step 1: 작가 홈페이지 전체 테스트를 실행한다**

```powershell
Push-Location 'site'
npm test
Pop-Location
```

Expected: 사이트 빌드와 `tests/rendered-html.test.mjs` 통과, 종료 코드 `0`.

- [ ] **Step 2: 전체 변경사항을 스테이징한다**

```powershell
git add -A
git status --short
```

Expected: 기존 작가 홈페이지 변경사항, 지도 도구, 문서만 스테이징된다. `.env*`, `node_modules`, `dist`, `.wrangler`, `.firebase`, `output`은 나타나지 않는다.

- [ ] **Step 3: 중첩 저장소·환경 파일·대용량 파일을 검사한다**

```powershell
$staged = git diff --cached --name-only
$forbiddenNames = $staged | Where-Object {
  $_ -match '(^|/)(\.env|\.env\.(?!example$)|node_modules|dist|\.wrangler|\.firebase|\.git)(/|$)' -or
  $_ -match '(^|/)output/' -or
  $_ -match '\.tsbuildinfo$'
}
if ($forbiddenNames) { throw "Forbidden staged paths: $($forbiddenNames -join ', ')" }
$largeFiles = foreach ($relative in $staged) {
  if (Test-Path -LiteralPath $relative -PathType Leaf) {
    $item = Get-Item -LiteralPath $relative
    if ($item.Length -ge 100MB) { "$relative ($($item.Length) bytes)" }
  }
}
if ($largeFiles) { throw "Files exceed GitHub's 100MB limit: $($largeFiles -join ', ')" }
```

Expected: 종료 코드 `0`, 금지 경로와 100MB 이상 파일 없음.

- [ ] **Step 4: 스테이징된 텍스트에서 비밀정보 패턴을 검사한다**

```powershell
$patterns = @(
  'BEGIN (RSA|OPENSSH|EC) PRIVATE KEY',
  'gh[pousr]_[A-Za-z0-9_]{20,}',
  'AIza[0-9A-Za-z_-]{30,}',
  'sk-[A-Za-z0-9]{20,}',
  '(client_secret|api_secret|refresh_token)["'' ]*[:=]["'' ]*[A-Za-z0-9_-]{12,}'
)
foreach ($pattern in $patterns) {
  git grep --cached -n -I -E $pattern
  if ($LASTEXITCODE -eq 0) { throw "Potential secret matched: $pattern" }
}
```

Expected: 종료 코드 `0`, 일치 항목 없음.

- [ ] **Step 5: Git 형식 검증과 통합 커밋을 만든다**

```powershell
git diff --cached --check
git commit -m "feat: publish complete Gamcheon artist platform"
```

Expected: 공백 오류 없이 현재 홈페이지 변경사항이 커밋된다.

- [ ] **Step 6: 사용자 소유 원격의 `main`에 푸시한다**

```powershell
git remote get-url origin
git push origin main
```

Expected: 원격 주소가 `https://github.com/rjbcom4263-lgtm/gamcheon-artist-map-apply.git`이고 푸시 성공.

- [ ] **Step 7: 공개 GitHub 결과를 외부 API로 검증한다**

```powershell
$repo = Invoke-RestMethod -Uri 'https://api.github.com/repos/rjbcom4263-lgtm/gamcheon-artist-map-apply' -Headers @{ 'User-Agent' = 'Codex' }
if ($repo.visibility -ne 'public' -or $repo.default_branch -ne 'main') {
  throw "Unexpected repository state: visibility=$($repo.visibility), branch=$($repo.default_branch)"
}
$siteFile = Invoke-RestMethod -Uri 'https://api.github.com/repos/rjbcom4263-lgtm/gamcheon-artist-map-apply/contents/site/package.json?ref=main' -Headers @{ 'User-Agent' = 'Codex' }
$mapFile = Invoke-RestMethod -Uri 'https://api.github.com/repos/rjbcom4263-lgtm/gamcheon-artist-map-apply/contents/tools/kakao-tile-map/package.json?ref=main' -Headers @{ 'User-Agent' = 'Codex' }
Write-Output "VISIBILITY=$($repo.visibility)"
Write-Output "SITE_FILE=$($siteFile.path)"
Write-Output "MAP_FILE=$($mapFile.path)"
```

Expected: `VISIBILITY=public`, `SITE_FILE=site/package.json`, `MAP_FILE=tools/kakao-tile-map/package.json`.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("declares the public homepage metadata", async () => {
  const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layoutSource, /title:\s*"감천 작가 프로젝트 \| 작가와 작품을 연결합니다"/);
  assert.match(layoutSource, /description:\s*"감천의 작가와 작품을 소개하고/);
  assert.doesNotMatch(layoutSource, /codex-preview/);
});

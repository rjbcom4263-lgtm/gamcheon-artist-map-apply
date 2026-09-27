import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("google oauth callback validates state and verified email", async () => {
  const source = await readFile(new URL("../app/api/auth/google/callback/route.ts", import.meta.url), "utf8");
  assert.match(source, /state !== expectedState/);
  assert.match(source, /email_verified !== true/);
  assert.match(source, /role !== "artist"/);
});

test("home always reads the current login session", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /export const dynamic = "force-dynamic"/);
});

test("kakao and naver oauth validate state and use official profile endpoints", async () => {
  const kakao = await readFile(new URL("../app/api/auth/kakao/callback/route.ts", import.meta.url), "utf8");
  const naver = await readFile(new URL("../app/api/auth/naver/callback/route.ts", import.meta.url), "utf8");
  assert.match(kakao, /state !== expectedState/);
  assert.match(kakao, /https:\/\/kapi\.kakao\.com\/v2\/user\/me/);
  assert.match(naver, /state !== expectedState/);
  assert.match(naver, /https:\/\/openapi\.naver\.com\/v1\/nid\/me/);
});

test("social login session survives the provider redirect", async () => {
  const social = await readFile(new URL("../app/api/auth/social.ts", import.meta.url), "utf8");
  const google = await readFile(new URL("../app/api/auth/google/callback/route.ts", import.meta.url), "utf8");
  assert.match(social, /SameSite=Lax/);
  assert.match(google, /SameSite=Lax/);
  assert.doesNotMatch(social, /adminCookie\.name=.*SameSite=Strict/);
  assert.doesNotMatch(google, /adminCookie\.name=.*SameSite=Strict/);
});

test("home metrics are loaded from stored applications", async () => {
  const page = await readFile(new URL("../app/landing-sample/page.tsx", import.meta.url), "utf8");
  const content = await readFile(new URL("../app/landing-sample/content.ts", import.meta.url), "utf8");
  assert.match(page, /SELECT artist_name, phone, email, status, payload_json FROM artist_applications/);
  assert.match(page, /status === "approved"/);
  assert.doesNotMatch(content, /\[\"참여 작가\", 27/);
});

test("project introduction follows the artist map business direction", async () => {
  const home = await readFile(new URL("../app/landing-sample/CloneHome.tsx", import.meta.url), "utf8");
  assert.match(home, /작가를 만나러 오는 감천으로/);
  assert.match(home, /작가·공방 기록/);
  assert.match(home, /Art Passport/);
});

test("landing navigation points to independent content pages", async () => {
  const content = await readFile(new URL("../app/landing-sample/content.ts", import.meta.url), "utf8");
  const home = await readFile(new URL("../app/landing-sample/CloneHome.tsx", import.meta.url), "utf8");
  assert.match(content, /\["프로젝트 소개", "\/project"\]/);
  assert.match(content, /\["작가 소개", "\/artists"\]/);
  assert.match(content, /\["ART PASSPORT", "\/passport"\]/);
  assert.match(home, /<main className="clone-page">/);
  assert.match(home, /href="\/project"/);
});

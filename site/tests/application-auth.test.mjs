import assert from "node:assert/strict";
import test from "node:test";

import { safeNextCookie, safeNextPath } from "../app/auth-next.ts";

test("auth return path accepts only local absolute paths", () => {
  assert.equal(safeNextPath("/apply", "/"), "/apply");
  assert.equal(safeNextPath("/apply?step=2", "/"), "/apply?step=2");
  assert.equal(safeNextPath("https://evil.example", "/"), "/");
  assert.equal(safeNextPath("//evil.example", "/artist"), "/artist");
  assert.equal(safeNextPath("/\\evil.example", "/artist"), "/artist");
  assert.equal(safeNextPath(undefined, "/artist"), "/artist");
});

test("oauth return cookie is decoded without throwing", () => {
  assert.equal(safeNextCookie("%2Fapply"), "/apply");
  assert.equal(safeNextCookie("%E0%A4%A"), "/");
});

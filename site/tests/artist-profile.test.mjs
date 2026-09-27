import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeArtistProfile } from "../app/artist/profile-data.ts";

test("artist profile updates allow public fields and trim oversized input", () => {
  const result = sanitizeArtistProfile({ artistName: " 작가 ", categories: [" 회화 "], values: { tagline: " 소개 ", mapX: 50 }, works: [{ title: " 작품 ", description: "설명" }] });
  assert.equal(result.artistName, "작가");
  assert.equal(result.categories[0], "회화");
  assert.equal(result.values.tagline, "소개");
  assert.equal("mapX" in result.values, false);
  assert.equal(result.works[0].title, "작품");
});

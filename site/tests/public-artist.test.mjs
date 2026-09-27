import assert from "node:assert/strict";
import test from "node:test";
import { artistRowToProfile } from "../app/artists/public-artist.ts";

test("public artist details honor visibility, privacy, and safe links", () => {
  const base = { id: "artist-1", artist_name: "공개 작가", image_keys_json: "[]" };
  const hidden = artistRowToProfile({ ...base, payload_json: JSON.stringify({ values: { mapPublished: false } }) });
  assert.equal(hidden, null);

  const profile = artistRowToProfile({ ...base, payload_json: JSON.stringify({ values: { address: "비공개 상세 주소", locationPrivacy: "nearby", instagram: "javascript:alert(1)", website: "https://artist.example" }, works: [{ title: "작품" }] }) });
  assert.equal(profile.address, "감천문화마을 일대");
  assert.equal(profile.instagram, "");
  assert.equal(profile.website, "https://artist.example");
  assert.equal(profile.works[0].title, "작품");
});

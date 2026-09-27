import assert from "node:assert/strict";
import test from "node:test";
import { artists, filterArtists } from "../app/map/artists.ts";
import { artistRowsToPlaces } from "../app/map/map-artists.ts";

test("artist search combines trimmed text and category without losing valid map positions", () => {
  assert.equal(filterArtists("", "전체").length, 6);
  assert.deepEqual(filterArtists("  윤슬  ", "회화").map(a => a.id), ["01"]);
  assert.equal(filterArtists("윤슬", "도예").length, 0);
  assert.equal(filterArtists("작은 그릇", "전체")[0].id, "02");
  assert.equal(filterArtists("없는 작가", "전체").length, 0);
  assert.equal(new Set(artists.map(a => a.id)).size, artists.length);
  for (const a of artists) for (const key of ["x", "y", "wx", "wy"]) assert.ok(a[key] > 0 && a[key] < 100);
});

test("approved database rows become public map cards without leaking a private address", () => {
  const rows = [
    { id: "artist-1", artist_name: "공개 작가", payload_json: JSON.stringify({ values: { studioName: "공개 작업실", address: "상세 주소", locationPrivacy: "nearby", hours: "11:00~18:00", mapX: 30, mapY: 40, mapLongitude: 129.0103, mapLatitude: 35.0975 }, categories: ["회화"] }), image_keys_json: JSON.stringify([{ type: "profile", key: "applications/artist-1/profile.png" }]) },
    { id: "artist-2", artist_name: "위치 작가", payload_json: JSON.stringify({ values: { address: "공개 주소", locationPrivacy: "exact", mapX: 101, mapY: 40, mapLongitude: 130, mapLatitude: 35.0975 } }), image_keys_json: "[]" },
    { id: "artist-3", artist_name: "숨김 작가", payload_json: JSON.stringify({ values: { mapPublished: false, mapX: 30, mapY: 40 } }), image_keys_json: "[]" },
  ];
  const places = artistRowsToPlaces(rows);
  assert.equal(places.length, 2);
  assert.equal(places[0].address, "감천문화마을 일대");
  assert.deepEqual(places[0].position, { x: 30, y: 40 });
  assert.deepEqual(places[0].geoPosition, { longitude: 129.0103, latitude: 35.0975 });
  assert.equal(places[0].type, "회화 작가");
  assert.match(places[0].image, /^\/api\/artists\/images\?key=/);
  assert.equal(places[1].address, "공개 주소");
  assert.equal(places[1].position, undefined);
  assert.equal(places[1].geoPosition, undefined);
});

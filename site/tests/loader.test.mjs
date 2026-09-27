import assert from "node:assert/strict";
import test from "node:test";
import * as content from "../app/landing-sample/content.ts";

test("loading brand is split into two balanced display lines", () => {
  assert.deepEqual(content.loaderBrandLines?.("GAMCHEON ARTISTS"), ["GAMCHEON", "ARTISTS"]);
});

test("loader variant uses an even probability split", () => {
  assert.equal(content.chooseLoaderVariant?.(0), "classic");
  assert.equal(content.chooseLoaderVariant?.(0.499), "classic");
  assert.equal(content.chooseLoaderVariant?.(0.5), "studio");
  assert.equal(content.chooseLoaderVariant?.(0.999), "studio");
});

import assert from "node:assert/strict";
import test from "node:test";

import { isAllowedImageBytes, isAllowedImageType } from "../app/image-upload.ts";

test("image uploads allow only JPEG, PNG, and WebP signatures", () => {
  assert.equal(isAllowedImageType("image/svg+xml"), false);
  assert.equal(isAllowedImageType("image/png"), true);
  assert.equal(isAllowedImageBytes("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff])), true);
  assert.equal(isAllowedImageBytes("image/png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
  assert.equal(isAllowedImageBytes("image/webp", new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), true);
  assert.equal(isAllowedImageBytes("image/png", new TextEncoder().encode("<svg><script>")), false);
});

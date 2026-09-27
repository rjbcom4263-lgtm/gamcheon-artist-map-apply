import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

let controls = {};
try {
  controls = await import("../app/artist/profile-editor-controls.ts");
} catch {}

test("profile editor controls open and close the same native popup", () => {
  assert.deepEqual(controls.profileEditorControl?.("show"), {
    type: "button",
    popoverTarget: "artist-profile-editor",
    popoverTargetAction: "show",
  });
  assert.deepEqual(controls.profileEditorControl?.("hide"), {
    type: "button",
    popoverTarget: "artist-profile-editor",
    popoverTargetAction: "hide",
  });
});

test("profile editor query finds an approved profile beyond recent drafts", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE artist_applications (id TEXT, account_id TEXT, artist_name TEXT, phone TEXT, email TEXT, status TEXT, payload_json TEXT, image_keys_json TEXT, created_at TEXT)");
  const insert = db.prepare("INSERT INTO artist_applications VALUES (?, ?, '작가', '010', 'artist@example.com', ?, '{}', '[]', ?)");
  insert.run("public", "ACC-owner", "approved", "2026-01-01");
  for (let index = 1; index <= 6; index++) insert.run(`draft-${index}`, "ACC-other", "received", `2026-02-0${index}`);
  const query = typeof controls.EDITABLE_APPLICATION_QUERY === "string" ? controls.EDITABLE_APPLICATION_QUERY : "SELECT NULL AS id WHERE ? = ?";
  const result = db.prepare(query).get("ACC-owner");
  assert.equal(result?.id, "public");
});

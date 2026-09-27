import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { ACTIVE_APPLICATION_INDEX_SQL } from "../app/application-schema.ts";

test("database allows only one active application per account", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE artist_applications (id TEXT PRIMARY KEY, account_id TEXT NOT NULL DEFAULT '', status TEXT NOT NULL)");
  db.exec(ACTIVE_APPLICATION_INDEX_SQL);
  db.prepare("INSERT INTO artist_applications VALUES (?, ?, ?)").run("one", "ACC-1", "draft");
  assert.throws(() => db.prepare("INSERT INTO artist_applications VALUES (?, ?, ?)").run("two", "ACC-1", "received"));
  assert.doesNotThrow(() => db.prepare("INSERT INTO artist_applications VALUES (?, ?, ?)").run("legacy", "", "approved"));
});

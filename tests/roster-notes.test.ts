import assert from "node:assert/strict";
import test from "node:test";

import { stripRosterPersonNotes } from "../src/lib/roster-queries";
import { rosterCreateBodySchema, rosterPatchBodySchema } from "../src/lib/roster-validation";
import type { Person } from "../db/schema";

test("roster create and update payloads reject person notes", () => {
  assert.equal(
    rosterCreateBodySchema.safeParse({
      name: "Mochi",
      role: "pet",
      notes: "orange tabby cat",
    }).success,
    false,
  );

  assert.equal(
    rosterPatchBodySchema.safeParse({
      role: "adult",
      notes: null,
    }).success,
    false,
  );
});

test("roster serialization strips stored person notes", () => {
  const person: Person = {
    id: "person-1",
    userId: "user-1",
    name: "Mochi",
    role: "pet",
    notes: "orange tabby cat",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const publicPerson = stripRosterPersonNotes(person);

  assert.deepEqual(Object.keys(publicPerson).sort(), ["createdAt", "id", "name", "role", "userId"]);
  assert.equal("notes" in publicPerson, false);
});

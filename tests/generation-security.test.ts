import assert from "node:assert/strict";
import test from "node:test";
import { isOwnedLocationReferencePath } from "../src/lib/location-reference";

test("location references are restricted to the current user's storage prefix", () => {
  assert.equal(isOwnedLocationReferencePath("locations/user-1/AbCdEf1234.jpg", "user-1"), true);
  assert.equal(isOwnedLocationReferencePath("locations/user-2/AbCdEf1234.jpg", "user-1"), false);
  assert.equal(
    isOwnedLocationReferencePath("locations/user-1/../user-2/file.jpg", "user-1"),
    false,
  );
  assert.equal(isOwnedLocationReferencePath("uploads/user-1/AbCdEf1234.jpg", "user-1"), false);
  assert.equal(isOwnedLocationReferencePath("locations/user-1/not-generated.png", "user-1"), false);
});

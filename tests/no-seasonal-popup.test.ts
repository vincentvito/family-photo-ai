import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

test("Father's Day popup is not mounted globally", () => {
  const layoutSource = readFileSync(join(root, "src/app/layout.tsx"), "utf8");

  assert.doesNotMatch(layoutSource, /FathersDayPopup/);
  assert.equal(
    existsSync(join(root, "src/components/landing/FathersDayPopup.tsx")),
    false,
  );
});

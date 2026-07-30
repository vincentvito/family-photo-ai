import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const messagesDirectory = join(process.cwd(), "src/messages");

type MessageValue =
  | string
  | number
  | boolean
  | null
  | MessageValue[]
  | { [key: string]: MessageValue };

function valueType(value: MessageValue): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function assertSameMessageShape(
  expected: MessageValue,
  actual: MessageValue,
  locale: string,
  path = "<root>",
): void {
  assert.equal(
    valueType(actual),
    valueType(expected),
    `${locale}: ${path} must be a ${valueType(expected)}`,
  );

  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual));
    assert.equal(
      actual.length,
      expected.length,
      `${locale}: ${path} must contain ${expected.length} items`,
    );

    expected.forEach((item, index) => {
      assertSameMessageShape(item, actual[index], locale, `${path}[${index}]`);
    });
    return;
  }

  if (expected !== null && typeof expected === "object") {
    assert.ok(actual !== null && typeof actual === "object" && !Array.isArray(actual));

    const expectedKeys = Object.keys(expected).sort();
    const actualKeys = Object.keys(actual).sort();

    assert.deepEqual(
      actualKeys,
      expectedKeys,
      `${locale}: ${path} must have the same translation keys as English`,
    );

    for (const key of expectedKeys) {
      assertSameMessageShape(
        expected[key],
        actual[key],
        locale,
        path === "<root>" ? key : `${path}.${key}`,
      );
    }
  }
}

test("every locale has the same translation keys and value types as English", () => {
  const messageFiles = readdirSync(messagesDirectory)
    .filter((file) => file.endsWith(".json"))
    .sort();
  const english = JSON.parse(
    readFileSync(join(messagesDirectory, "en.json"), "utf8"),
  ) as MessageValue;

  assert.ok(messageFiles.length > 1, "expected at least one translated locale");

  for (const file of messageFiles) {
    if (file === "en.json") continue;

    const locale = file.replace(/\.json$/, "");
    const messages = JSON.parse(
      readFileSync(join(messagesDirectory, file), "utf8"),
    ) as MessageValue;

    assertSameMessageShape(english, messages, locale);
  }
});

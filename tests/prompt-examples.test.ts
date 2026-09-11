import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test, { afterEach, beforeEach } from "node:test";
import { JSDOM } from "jsdom";
import { createElement } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import PromptActions from "../src/components/landing/PromptActions";
import { ALL_FAMILY_PHOTO_PROMPTS } from "../src/data/family-photo-prompts";
import { STYLE_PROMPT_EXAMPLES } from "../src/data/style-prompt-examples";
import { getPromptStudioHref } from "../src/lib/theme-links";
import { parseStudioIntent } from "../src/lib/studio-intent";
import { THEMES } from "../src/lib/themes";

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
  for (const [name, value] of Object.entries({
    window: dom.window,
    self: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
  })) {
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
});

afterEach(() => {
  cleanup();
  dom.window.close();
});

test("every published prompt opens with its exact text and has a real example asset", () => {
  const ids = new Set<string>();
  for (const example of ALL_FAMILY_PHOTO_PROMPTS) {
    assert.ok(!ids.has(example.id), `Duplicate anchor: ${example.id}`);
    ids.add(example.id);
    assert.ok(existsSync(new URL(`../public${example.image}`, import.meta.url)), example.image);
    const destination = new URL(getPromptStudioHref(example.prompt), "https://familyshoot.com");
    assert.equal(destination.pathname, "/studio/theme");
    assert.deepEqual(parseStudioIntent(Object.fromEntries(destination.searchParams), THEMES), {
      kind: "prompt",
      output: "photoshoot",
      prompt: example.prompt,
    });
  }
  // Published anchors keep working when the popular looks move to the top.
  for (let number = 1; number <= 20; number++) assert.ok(ids.has(`prompt-${number}`));
  for (const examples of Object.values(STYLE_PROMPT_EXAMPLES)) {
    for (const example of examples) {
      assert.ok(THEMES.some((theme) => theme.id === example.themeId));
      assert.ok(ALL_FAMILY_PHOTO_PROMPTS.some((item) => item.prompt === example.prompt));
    }
  }
});

const example = STYLE_PROMPT_EXAMPLES["minecraft-family-photos"][0];
const props = {
  title: example.title,
  prompt: example.prompt,
  createHref: getPromptStudioHref(example.prompt),
};

test("copy writes the complete scene prompt and announces success", async () => {
  let copied: string | undefined;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (value: string) => {
        copied = value;
      },
    },
  });
  const view = render(createElement(PromptActions, props));
  fireEvent.click(view.getByRole("button", { name: `Copy prompt: ${example.title}` }));
  await waitFor(() => assert.equal(view.getByRole("status").textContent, "Prompt copied."));
  assert.equal(copied, example.prompt);
  assert.equal(
    view.getByRole("link", { name: `Create this look: ${example.title}` }).getAttribute("href"),
    props.createHref,
  );
});

test("denied clipboard access explains manual copying and leaves Create this look usable", async () => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async () => {
        throw new Error("Clipboard denied");
      },
    },
  });
  const view = render(createElement(PromptActions, props));
  fireEvent.click(view.getByRole("button", { name: `Copy prompt: ${example.title}` }));
  await waitFor(() => assert.match(view.getByRole("status").textContent ?? "", /copy it manually/));
  assert.equal(
    view.getByRole("link", { name: `Create this look: ${example.title}` }).getAttribute("href"),
    props.createHref,
  );
  assert.equal((view.getByRole("button") as HTMLButtonElement).disabled, false);
});

test("browsers without Clipboard API still offer a manual copy path", async () => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  const view = render(createElement(PromptActions, props));
  fireEvent.click(view.getByRole("button", { name: `Copy prompt: ${example.title}` }));
  await waitFor(() => assert.match(view.getByRole("status").textContent ?? "", /copy it manually/));
});

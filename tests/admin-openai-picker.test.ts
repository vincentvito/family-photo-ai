import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { createElement } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import DefaultModelPicker from "../src/app/admin/DefaultModelPicker";

test("admin switches direct models at medium quality and restores selection on save failure", async (t) => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
  for (const [name, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  const requests: unknown[] = [];
  let fail = false;
  t.mock.method(globalThis, "fetch", async (_url: RequestInfo | URL, init?: RequestInit) => {
    requests.push(JSON.parse(String(init?.body)));
    return fail
      ? Response.json({ error: "OpenAI is not configured." }, { status: 400 })
      : Response.json({ ok: true });
  });
  try {
    const view = render(createElement(DefaultModelPicker, { initial: "gpt-image-2" }));
    for (const [label, modelId] of [
      ["Sunburst · Pro quality", "openai-sunburst-medium"],
      ["Flare · Fast", "openai-flare-medium"],
    ]) {
      fireEvent.click(view.getByRole("button", { name: label }));
      const dialog = await view.findByRole("dialog");
      assert.match(dialog.textContent ?? "", /OpenAI direct.*Medium quality/);
      fireEvent.click(view.getByRole("button", { name: "Change default" }));
      await waitFor(() => assert.ok(view.getByText("Saved.")));
      assert.equal(view.getByRole("button", { name: label }).getAttribute("aria-pressed"), "true");
      assert.deepEqual(requests.at(-1), { modelId });
    }
    fail = true;
    fireEvent.click(view.getByRole("button", { name: "Sunburst · Pro quality" }));
    fireEvent.click(view.getByRole("button", { name: "Change default" }));
    await waitFor(() => assert.ok(view.getByText("OpenAI is not configured.")));
    assert.equal(
      view.getByRole("button", { name: "Flare · Fast" }).getAttribute("aria-pressed"),
      "true",
    );
  } finally {
    cleanup();
    await new Promise((resolve) => setTimeout(resolve, 250));
    dom.window.close();
  }
});

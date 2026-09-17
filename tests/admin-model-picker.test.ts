import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { createElement } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import DefaultModelPicker from "../src/app/admin/DefaultModelPicker";

test("admin can select Flare, confirm medium quality, and save the default", async (t) => {
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
  t.mock.method(globalThis, "fetch", async (url: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(url, "/api/admin/default-model");
    assert.equal(init?.method, "POST");
    requests.push(JSON.parse(String(init?.body)));
    return Response.json({ ok: true });
  });
  try {
    const view = render(createElement(DefaultModelPicker, { initial: "gpt-image-2" }));
    fireEvent.click(view.getByRole("button", { name: /GPT Image 2.5 Flare/ }));
    const dialog = await view.findByRole("dialog");
    assert.match(dialog.textContent ?? "", /Medium quality/);
    assert.equal(requests.length, 0);
    fireEvent.click(view.getByRole("button", { name: "Change default" }));
    await waitFor(() => assert.ok(view.getByText("Saved.")));
    assert.deepEqual(requests, [{ modelId: "gpt-image-2.5-flare" }]);
    assert.match(view.getByRole("button", { name: /GPT Image 2.5 Flare/ }).className, /shadow-/);
  } finally {
    cleanup();
    dom.window.close();
  }
});

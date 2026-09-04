import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";
import { JSDOM } from "jsdom";
import { createElement } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import MerchandiseHandoff from "../src/components/studio/MerchandiseHandoff";
import { trapDialogFocus } from "../src/lib/dialog-focus";

let dom: JSDOM;
let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });
  originalFetch = globalThis.fetch;
  for (const [name, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    HTMLAnchorElement: dom.window.HTMLAnchorElement,
    DOMException: dom.window.DOMException,
    Node: dom.window.Node,
  })) {
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  Object.defineProperty(dom.window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  process.env.NEXT_PUBLIC_MERCH_STORE_ENABLED = "1";
  process.env.NEXT_PUBLIC_MERCH_STORE_ORIGIN = "https://shop.familyshoot.com";
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  delete process.env.NEXT_PUBLIC_MERCH_STORE_ENABLED;
  delete process.env.NEXT_PUBLIC_MERCH_STORE_ORIGIN;
  dom.window.close();
});

test("the merchandise handoff automatically downloads before enabling the shop", async () => {
  const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  let downloadClicks = 0;
  let revokedUrl: string | null = null;

  globalThis.fetch = async (input, init) => {
    requests.push({ input, init });
    return new Response(new Blob(["jpeg"], { type: "image/jpeg" }), { status: 200 });
  };
  Object.defineProperty(globalThis.URL, "createObjectURL", {
    configurable: true,
    value: () => "blob:merch-test",
  });
  Object.defineProperty(globalThis.URL, "revokeObjectURL", {
    configurable: true,
    value: (url: string) => {
      revokedUrl = url;
    },
  });
  dom.window.HTMLAnchorElement.prototype.click = () => {
    downloadClicks += 1;
  };

  const view = render(
    createElement(MerchandiseHandoff, {
      imageId: "image-123",
      storeUrl: "https://shop.familyshoot.com",
      autoPrepare: true,
    }),
  );

  const shopLink = await view.findByRole("link", { name: "Shop products" });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].input, "/api/export/merch/image-123");
  assert.equal(requests[0].init?.method, "POST");
  assert.ok(requests[0].init?.signal instanceof AbortSignal);
  assert.equal(downloadClicks, 1);
  assert.equal(shopLink.getAttribute("href"), "https://shop.familyshoot.com");
  await waitFor(() => assert.equal(revokedUrl, "blob:merch-test"));
});

test("dialog focus wraps in both directions and ignores disabled controls", () => {
  const dialog = document.createElement("div");
  dialog.tabIndex = -1;
  const first = document.createElement("button");
  const disabled = document.createElement("button");
  const last = document.createElement("a");
  disabled.disabled = true;
  last.href = "https://shop.familyshoot.com";
  dialog.append(first, disabled, last);
  document.body.appendChild(dialog);

  last.focus();
  trapDialogFocus(new dom.window.KeyboardEvent("keydown", { key: "Tab", cancelable: true }), dialog);
  assert.equal(document.activeElement, first);

  first.focus();
  trapDialogFocus(
    new dom.window.KeyboardEvent("keydown", { key: "Tab", shiftKey: true, cancelable: true }),
    dialog,
  );
  assert.equal(document.activeElement, last);
});

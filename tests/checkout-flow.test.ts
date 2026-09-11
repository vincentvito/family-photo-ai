import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";
import { JSDOM } from "jsdom";
import { createElement, StrictMode } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  checkoutResumePath,
  parseCheckoutIntent,
  type CheckoutIntent,
} from "../src/lib/checkout-intent";
import { getCheckoutDestination } from "../src/lib/checkout-client";
import { PRO_PLAN } from "../src/lib/pricing-packs";
import PreviewPurchasePanel from "../src/components/billing/PreviewPurchasePanel";
import CheckoutButton from "../src/components/billing/CheckoutButton";

let dom: JSDOM;
let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
  originalFetch = globalThis.fetch;
  for (const [name, value] of Object.entries({
    window: dom.window,
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
  globalThis.fetch = originalFetch;
  dom.window.close();
});

test("signed-out checkout preserves each product and exact preview across localized sign-in", async () => {
  const intents: CheckoutIntent[] = [
    { packId: "single_keepsake", unlockGenerationId: "shoot-123" },
    { packId: "three_pack", unlockGenerationId: "shoot-123" },
    { packId: "eight_pack", gift: true },
    { planId: PRO_PLAN.id, unlockGenerationId: "shoot-123" },
  ];
  for (const intent of intents) {
    const bodies: unknown[] = [];
    globalThis.fetch = async (_input, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      return bodies.length === 1
        ? new Response(null, { status: 401 })
        : Response.json({ url: "https://checkout.stripe.com/c/pay/test" });
    };
    const destination = new URL(
      await getCheckoutDestination(intent, "/de/studio/roster"),
      "https://familyshoot.com",
    );
    assert.equal(destination.pathname, "/de/sign-in");
    const next = new URL(destination.searchParams.get("next")!, destination.origin);
    assert.equal(next.pathname, "/de/checkout");
    const restored = parseCheckoutIntent(Object.fromEntries(next.searchParams));
    assert.deepEqual(restored, intent);
    assert.equal(
      await getCheckoutDestination(restored!, next.pathname),
      "https://checkout.stripe.com/c/pay/test",
    );
    assert.deepEqual(bodies[1], bodies[0]);
  }
});

test("checkout restore rejects unknown products, ambiguous parameters, and invalid preview identifiers", () => {
  for (const params of [
    {},
    { packId: "not-a-pack" },
    { packId: "toString" },
    { planId: "not-a-plan" },
    { packId: "single_keepsake", planId: PRO_PLAN.id },
    { packId: ["single_keepsake", "eight_pack"] },
    { packId: "single_keepsake", unlockGenerationId: "../someone-else" },
    { packId: "single_keepsake", unlockGenerationId: "x".repeat(81) },
    { packId: "single_keepsake", gift: "true" },
    { packId: "single_keepsake", gift: "1", unlockGenerationId: "shoot-123" },
  ]) {
    assert.equal(parseCheckoutIntent(params), null);
  }
  assert.equal(
    checkoutResumePath({ packId: "single_keepsake" }),
    "/checkout?packId=single_keepsake",
  );
});

const panelProps = {
  generationId: "shoot-123",
  ready: true,
  checkingPayment: false,
  checkoutReturned: false,
  unlocking: false,
  error: null,
  onError: () => {},
  onUnlock: () => {},
};

test("the primary result action requests the $5 pack for that exact shoot, with no pricing detour", async () => {
  let request: { path: unknown; body: unknown } | undefined;
  globalThis.fetch = async (path, init) => {
    request = { path, body: JSON.parse(String(init?.body)) };
    return Response.json({ error: "Test checkout unavailable" }, { status: 503 });
  };
  const view = render(createElement(PreviewPurchasePanel, panelProps));
  const button = view.getByRole("button", { name: "Keep these 4 portraits — $5" });
  fireEvent.click(button);
  await waitFor(() =>
    assert.deepEqual(request, {
      path: "/api/stripe/checkout",
      body: { packId: "single_keepsake", unlockGenerationId: "shoot-123" },
    }),
  );
  await waitFor(() => assert.equal((button as HTMLButtonElement).disabled, false));
});

test("larger packs stay on the result screen and preserve the preview to unlock", async () => {
  let body: unknown;
  globalThis.fetch = async (_path, init) => {
    body = JSON.parse(String(init?.body));
    return Response.json({ error: "Test checkout unavailable" }, { status: 503 });
  };
  const view = render(createElement(PreviewPurchasePanel, panelProps));
  assert.equal(view.queryByRole("button", { name: /Family Album/ }), null);
  fireEvent.click(view.getByRole("button", { name: "Want more portraits?" }));
  fireEvent.click(
    view.getByRole("button", { name: /Family Album.*This set \+ 2 more shoots.*\$12/ }),
  );
  await waitFor(() =>
    assert.deepEqual(body, { packId: "three_pack", unlockGenerationId: "shoot-123" }),
  );
});

test("unfinished previews cannot be purchased and a payment return cannot trigger another purchase", () => {
  const view = render(createElement(PreviewPurchasePanel, { ...panelProps, ready: false }));
  assert.equal(
    (view.getByRole("button", { name: "Your portraits are developing…" }) as HTMLButtonElement)
      .disabled,
    true,
  );
  view.rerender(createElement(PreviewPurchasePanel, { ...panelProps, checkoutReturned: true }));
  assert.equal(view.queryByRole("button", { name: /Keep these 4/ }), null);
  assert.equal(view.queryByRole("button", { name: "Want more portraits?" }), null);
  assert.ok(view.getByRole("button", { name: "Already have credits? Unlock this set" }));
});

test("a pending checkout blocks duplicate clicks and a network failure allows a retry", async () => {
  let attempts = 0;
  let rejectRequest: (reason: Error) => void = () => {};
  globalThis.fetch = () => {
    attempts += 1;
    return new Promise<Response>((_resolve, reject) => {
      rejectRequest = reject;
    });
  };
  const view = render(
    // eslint-disable-next-line react/no-children-prop -- createElement requires the component's required children prop.
    createElement(CheckoutButton, { packId: "single_keepsake", className: "btn", children: "Buy" }),
  );
  const button = view.getByRole("button", { name: "Buy" });
  fireEvent.click(button);
  fireEvent.click(button);
  assert.equal(attempts, 1);
  rejectRequest(new Error("Connection interrupted. Please try again."));
  await view.findByRole("alert");
  assert.equal((button as HTMLButtonElement).disabled, false);
  fireEvent.click(button);
  assert.equal(attempts, 2);
  rejectRequest(new Error("Connection interrupted. Please try again."));
  await waitFor(() => assert.equal((button as HTMLButtonElement).disabled, false));
});

test("resuming checkout starts once under Strict Mode and does not loop on failure", async () => {
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    return Response.json({ error: "Please retry" }, { status: 503 });
  };
  const view = render(
    createElement(
      StrictMode,
      null,
      // eslint-disable-next-line react/no-children-prop -- createElement requires the component's required children prop.
      createElement(CheckoutButton, {
        packId: "single_keepsake",
        autoStart: true,
        className: "btn",
        children: "Continue checkout",
      }),
    ),
  );
  await view.findByRole("alert");
  assert.equal(attempts, 1);
  fireEvent.click(view.getByRole("button", { name: "Continue checkout" }));
  await waitFor(() => assert.equal(attempts, 2));
});

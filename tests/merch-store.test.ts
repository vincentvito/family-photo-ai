import assert from "node:assert/strict";
import test from "node:test";
import {
  canShowMerchandise,
  FAMILYSHOOT_STORE_ORIGIN,
  parseMerchStoreConfig,
} from "../src/lib/merch-store";

test("the merchandise store is disabled unless the flag is exactly 1", () => {
  for (const enabled of [undefined, "", "0", "true", "yes"]) {
    assert.deepEqual(parseMerchStoreConfig({ enabled, origin: FAMILYSHOOT_STORE_ORIGIN }), {
      enabled: false,
      reason: "disabled",
    });
  }
});

test("the merchandise store accepts only the approved HTTPS root origin", () => {
  assert.deepEqual(parseMerchStoreConfig({ enabled: "1", origin: FAMILYSHOOT_STORE_ORIGIN }), {
    enabled: true,
    storeUrl: FAMILYSHOOT_STORE_ORIGIN,
  });

  for (const origin of [
    "http://shop.familyshoot.com",
    "https://familyshoot.com",
    "https://shop.familyshoot.com/products",
    "https://shop.familyshoot.com?next=elsewhere",
    "https://shop.familyshoot.com#shop",
    "https://user:pass@shop.familyshoot.com",
    "not-a-url",
    undefined,
  ]) {
    assert.deepEqual(parseMerchStoreConfig({ enabled: "1", origin }), {
      enabled: false,
      reason: "invalid-origin",
    });
  }
});

test("locked previews never show the merchandise action", () => {
  const enabled = parseMerchStoreConfig({ enabled: "1", origin: FAMILYSHOOT_STORE_ORIGIN });
  assert.equal(canShowMerchandise(true, enabled), false);
  assert.equal(canShowMerchandise(false, enabled), true);
  assert.equal(canShowMerchandise(false, { enabled: false, reason: "disabled" }), false);
});

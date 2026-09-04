import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("print is wired as a direct image action and no longer part of export", () => {
  const exportMenu = readFileSync("src/components/studio/ExportMenu.tsx", "utf8");
  const printButton = readFileSync("src/components/studio/PrintButton.tsx", "utf8");
  const actionSurfaces = [
    "src/components/studio/GenerationBoard.tsx",
    "src/components/studio/AlbumGrid.tsx",
    "src/components/studio/RefineStage.tsx",
  ].map((path) => readFileSync(path, "utf8"));

  assert.doesNotMatch(exportMenu, /MerchandiseHandoff|Print your photo/);
  assert.match(printButton, /canShowMerchandise\(previewOnly, merchStore\)/);
  for (const source of actionSurfaces) assert.match(source, /<PrintButton/);
});

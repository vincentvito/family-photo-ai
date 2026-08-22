export const FAMILYSHOOT_STORE_ORIGIN = "https://shop.familyshoot.com";

export type MerchStoreConfig =
  | { enabled: true; storeUrl: string }
  | { enabled: false; reason: "disabled" | "invalid-origin" };

export function parseMerchStoreConfig(input: {
  enabled: string | undefined;
  origin: string | undefined;
}): MerchStoreConfig {
  if (input.enabled !== "1") return { enabled: false, reason: "disabled" };

  try {
    const url = new URL(input.origin ?? "");
    const isApprovedOrigin =
      url.origin === FAMILYSHOOT_STORE_ORIGIN &&
      url.pathname === "/" &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "";

    if (!isApprovedOrigin) return { enabled: false, reason: "invalid-origin" };
    return { enabled: true, storeUrl: url.origin };
  } catch {
    return { enabled: false, reason: "invalid-origin" };
  }
}

export function getPublicMerchStoreConfig(): MerchStoreConfig {
  return parseMerchStoreConfig({
    enabled: process.env.NEXT_PUBLIC_MERCH_STORE_ENABLED,
    origin: process.env.NEXT_PUBLIC_MERCH_STORE_ORIGIN,
  });
}

export function canShowMerchandise(previewOnly: boolean, config: MerchStoreConfig): boolean {
  return !previewOnly && config.enabled;
}

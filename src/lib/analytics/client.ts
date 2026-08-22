type MerchEvent = "merch_handoff_opened" | "merch_asset_downloaded" | "merch_store_opened";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackMerchEvent(event: MerchEvent): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event);
}

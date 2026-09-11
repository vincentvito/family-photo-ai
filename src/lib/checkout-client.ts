import { checkoutResumePath, type CheckoutIntent } from "@/lib/checkout-intent";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/locales";

export async function getCheckoutDestination(intent: CheckoutIntent, pathname: string) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      intent.planId
        ? { planId: intent.planId, unlockGenerationId: intent.unlockGenerationId }
        : {
            packId: intent.packId,
            unlockGenerationId: intent.unlockGenerationId,
            ...(intent.gift ? { gift: {} } : {}),
          },
    ),
  });

  if (res.status === 401) {
    const prefix = pathname.split("/")[1];
    const locale = isLocale(prefix) ? prefix : DEFAULT_LOCALE;
    const next = localizePath(checkoutResumePath(intent), locale);
    return localizePath(`/sign-in?next=${encodeURIComponent(next)}`, locale);
  }

  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !data?.url) {
    throw new Error(data?.error ?? "Checkout could not start. Please try again.");
  }
  return data.url;
}

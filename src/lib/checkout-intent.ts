import { getPricingPack, PRICING_PACKS, PRO_PLAN, type PricingPackId } from "@/lib/pricing-packs";

export type CheckoutIntent = {
  packId?: PricingPackId;
  planId?: string;
  unlockGenerationId?: string;
  gift?: boolean;
};

export function checkoutResumePath(intent: CheckoutIntent) {
  const params = new URLSearchParams();
  if (intent.planId) params.set("planId", intent.planId);
  else if (intent.packId) params.set("packId", intent.packId);
  if (intent.unlockGenerationId) params.set("unlockGenerationId", intent.unlockGenerationId);
  if (intent.gift && !intent.planId) params.set("gift", "1");
  return `/checkout?${params.toString()}`;
}

/** Only restore known products; prices and credit amounts always come from the server. */
export function parseCheckoutIntent(
  params: Record<string, string | string[] | undefined>,
): CheckoutIntent | null {
  const { packId, planId, unlockGenerationId, gift } = params;
  if (
    Array.isArray(packId) ||
    Array.isArray(planId) ||
    Array.isArray(unlockGenerationId) ||
    Array.isArray(gift)
  )
    return null;
  if (unlockGenerationId && !/^[a-zA-Z0-9_-]{1,80}$/.test(unlockGenerationId)) {
    return null;
  }
  if (gift !== undefined && gift !== "1") return null;
  if (gift && unlockGenerationId) return null;

  if (planId) {
    if (planId !== PRO_PLAN.id || packId || gift) return null;
    return {
      planId,
      ...(unlockGenerationId ? { unlockGenerationId } : {}),
    } satisfies CheckoutIntent;
  }

  const pack =
    typeof packId === "string" && Object.hasOwn(PRICING_PACKS, packId)
      ? getPricingPack(packId)
      : null;
  if (!pack) return null;
  return {
    packId: pack.id,
    ...(unlockGenerationId ? { unlockGenerationId } : {}),
    ...(gift ? { gift: true } : {}),
  } satisfies CheckoutIntent;
}

export type PackTier = "single" | "three" | "eight" | "pro";

/**
 * Per-image refine cap by pack tier. Legacy shoots (packTier null) and
 * grant-funded shoots default to "three" — see resolvePackTierForNextCredit.
 */
export const REFINE_CAP: Record<PackTier, number> = {
  single: 2,
  three: 4,
  eight: 6,
  pro: 8,
};

export const LEGACY_REFINE_CAP = 6;

export const PRICING_PACKS = {
  single_keepsake: {
    id: "single_keepsake",
    name: "Family Snap",
    price: "$5",
    unitAmount: 500,
    credits: 1,
    tier: "single",
    priceEnv: "STRIPE_PRICE_SINGLE_KEEPSAKE",
  },
  three_pack: {
    id: "three_pack",
    name: "Family Album",
    price: "$12",
    unitAmount: 1200,
    credits: 3,
    tier: "three",
    priceEnv: "STRIPE_PRICE_THREE_PACK",
  },
  eight_pack: {
    id: "eight_pack",
    name: "Family Collection",
    price: "$25",
    unitAmount: 2500,
    credits: 8,
    tier: "eight",
    priceEnv: "STRIPE_PRICE_EIGHT_PACK",
  },
} as const satisfies Record<
  string,
  {
    id: string;
    name: string;
    price: string;
    unitAmount: number;
    credits: number;
    tier: PackTier;
    priceEnv: string;
  }
>;

export const PRO_PLAN = {
  id: "familyshoot_pro_monthly",
  name: "Family Shoot Pro",
  price: "$39",
  interval: "month",
  unitAmount: 3900,
  credits: 25,
  tier: "pro",
  priceEnv: "STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY",
} as const;

export type PricingPackId = keyof typeof PRICING_PACKS;

export function getPricingPack(id: string) {
  return PRICING_PACKS[id as PricingPackId] ?? null;
}

export function getCheckoutCreditPack(id: string) {
  return getPricingPack(id);
}

export function packIdToTier(packId: string): PackTier {
  if (packId === PRO_PLAN.id) return PRO_PLAN.tier;
  const pack = PRICING_PACKS[packId as PricingPackId];
  return pack?.tier ?? "three";
}

export function getPackPriceId(packId: PricingPackId) {
  const pack = PRICING_PACKS[packId];
  if (!pack) {
    throw new Error(`Unknown pack ${packId}`);
  }
  const priceId = process.env[pack.priceEnv];
  if (!priceId) {
    throw new Error(`${pack.priceEnv} is required`);
  }
  return priceId;
}

export function getProPlanPriceId() {
  const priceId = process.env[PRO_PLAN.priceEnv];
  if (!priceId) {
    throw new Error(`${PRO_PLAN.priceEnv} is required`);
  }
  return priceId;
}

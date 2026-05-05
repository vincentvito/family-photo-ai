export type PackTier = "single" | "three" | "eight";

/**
 * Per-shoot refine cap by pack tier. Legacy shoots (packTier null) and
 * grant-funded shoots default to "three" — see resolvePackTierForNextCredit.
 */
export const REFINE_CAP: Record<PackTier, number> = {
  single: 2,
  three: 4,
  eight: 6,
};

export const LEGACY_REFINE_CAP = 6;

export const PRICING_PACKS = {
  single_keepsake: {
    id: "single_keepsake",
    name: "Single keepsake",
    price: "$5",
    unitAmount: 500,
    credits: 1,
    tier: "single",
    priceEnv: "STRIPE_PRICE_SINGLE_KEEPSAKE",
  },
  three_pack: {
    id: "three_pack",
    name: "Three-pack",
    price: "$12",
    unitAmount: 1200,
    credits: 3,
    tier: "three",
    priceEnv: "STRIPE_PRICE_THREE_PACK",
  },
  eight_pack: {
    id: "eight_pack",
    name: "Eight-pack",
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

export type PricingPackId = keyof typeof PRICING_PACKS;

export function getPricingPack(id: string) {
  return PRICING_PACKS[id as PricingPackId] ?? null;
}

export function packIdToTier(packId: string): PackTier {
  const pack = PRICING_PACKS[packId as PricingPackId];
  return pack?.tier ?? "three";
}

export function getPackPriceId(packId: PricingPackId) {
  const pack = PRICING_PACKS[packId];
  const priceId = process.env[pack.priceEnv];
  if (!priceId) {
    throw new Error(`${pack.priceEnv} is required`);
  }
  return priceId;
}

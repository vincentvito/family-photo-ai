export const PRICING_PACKS = {
  single_keepsake: {
    id: "single_keepsake",
    name: "Single keepsake",
    price: "$5",
    unitAmount: 500,
    credits: 1,
    priceEnv: "STRIPE_PRICE_SINGLE_KEEPSAKE",
  },
  three_pack: {
    id: "three_pack",
    name: "Three-pack",
    price: "$12",
    unitAmount: 1200,
    credits: 3,
    priceEnv: "STRIPE_PRICE_THREE_PACK",
  },
  eight_pack: {
    id: "eight_pack",
    name: "Eight-pack",
    price: "$25",
    unitAmount: 2500,
    credits: 8,
    priceEnv: "STRIPE_PRICE_EIGHT_PACK",
  },
} as const;

export type PricingPackId = keyof typeof PRICING_PACKS;

export function getPricingPack(id: string) {
  return PRICING_PACKS[id as PricingPackId] ?? null;
}

export function getPackPriceId(packId: PricingPackId) {
  const pack = PRICING_PACKS[packId];
  const priceId = process.env[pack.priceEnv];
  if (!priceId) {
    throw new Error(`${pack.priceEnv} is required`);
  }
  return priceId;
}

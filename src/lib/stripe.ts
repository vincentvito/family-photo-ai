import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

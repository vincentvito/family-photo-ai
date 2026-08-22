#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Stripe from "stripe";

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const args = new Set(process.argv.slice(2));
const shouldCreate = args.has("--create");
const shouldCreatePortal = args.has("--portal");
const shouldCreateWebhook = args.has("--webhook");
const help = args.has("--help") || args.has("-h");

if (help) {
  printHelp();
  process.exit(0);
}

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  fail("STRIPE_SECRET_KEY is required. Use a Stripe test key first.");
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2026-07-29.dahlia",
  typescript: true,
});

const definitions = [
  {
    env: "STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY",
    productName: "FamilyShoot Pro",
    nickname: "FamilyShoot Pro monthly",
    unitAmount: 3900,
    recurring: { interval: "month" },
    metadata: {
      planId: "familyshoot_pro_monthly",
      credits: "25",
      tier: "pro",
    },
  },
];

const webhookEvents = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "invoice.payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "charge.refunded",
];

console.log("FamilyShoot Stripe subscription setup");
console.log(`Mode: ${shouldCreate ? "create missing Stripe prices" : "verify env only"}`);
console.log("");

const createdEnv = [];

for (const definition of definitions) {
  const existing = process.env[definition.env];
  if (existing) {
    const price = await stripe.prices.retrieve(existing);
    console.log(`${definition.env}=set (${price.id}, ${formatAmount(price.unit_amount)})`);
    continue;
  }

  if (!shouldCreate) {
    console.log(`${definition.env}=missing`);
    continue;
  }

  const product = await findOrCreateProduct(definition.productName);
  const price = await stripe.prices.create({
    currency: "usd",
    product: product.id,
    unit_amount: definition.unitAmount,
    nickname: definition.nickname,
    metadata: definition.metadata,
    ...(definition.recurring ? { recurring: definition.recurring } : {}),
  });

  createdEnv.push(`${definition.env}=${price.id}`);
  console.log(`${definition.env}=created (${price.id}, ${formatAmount(price.unit_amount)})`);
}

if (shouldCreatePortal) {
  const existingPortalConfig = process.env.STRIPE_PORTAL_CONFIGURATION_ID;
  if (existingPortalConfig) {
    const config = await stripe.billingPortal.configurations.retrieve(existingPortalConfig);
    console.log(`STRIPE_PORTAL_CONFIGURATION_ID=set (${config.id})`);
  } else if (shouldCreate) {
    const config = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Manage your FamilyShoot subscription and invoices.",
      },
      features: {
        customer_update: {
          enabled: true,
          allowed_updates: ["email", "tax_id"],
        },
        invoice_history: { enabled: true },
        payment_method_update: { enabled: true },
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
          cancellation_reason: {
            enabled: true,
            options: ["too_expensive", "missing_features", "switched_service", "unused", "other"],
          },
        },
        subscription_update: { enabled: false },
      },
      metadata: {
        app: "familyshoot",
        planId: "familyshoot_pro_monthly",
      },
    });
    createdEnv.push(`STRIPE_PORTAL_CONFIGURATION_ID=${config.id}`);
    console.log(`STRIPE_PORTAL_CONFIGURATION_ID=created (${config.id})`);
  } else {
    console.log("STRIPE_PORTAL_CONFIGURATION_ID=missing");
  }
}

if (shouldCreateWebhook) {
  const webhookUrl = webhookEndpointUrl();
  if (!webhookUrl) {
    console.log(
      "STRIPE_WEBHOOK_ENDPOINT_URL=missing (set NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SITE_URL, or STRIPE_WEBHOOK_ENDPOINT_URL)",
    );
  } else if (process.env.STRIPE_WEBHOOK_SECRET && !shouldCreate) {
    console.log("STRIPE_WEBHOOK_SECRET=set");
  } else if (shouldCreate) {
    const existing = await findWebhookEndpoint(webhookUrl);
    if (existing) {
      console.log(`Stripe webhook endpoint already exists (${existing.id})`);
      const missingEvents = webhookEvents.filter(
        (event) => !existing.enabled_events.includes(event),
      );
      if (missingEvents.length > 0) {
        if (shouldCreate) {
          const enabledEvents = Array.from(new Set([...existing.enabled_events, ...webhookEvents]));
          await stripe.webhookEndpoints.update(existing.id, {
            enabled_events: enabledEvents,
          });
          console.log(`Stripe webhook endpoint events updated (${missingEvents.join(", ")})`);
        } else {
          console.log(`Stripe webhook endpoint is missing events: ${missingEvents.join(", ")}`);
        }
      } else {
        console.log("Stripe webhook endpoint has all required events.");
      }
      console.log(
        "STRIPE_WEBHOOK_SECRET cannot be retrieved from Stripe after creation. Use the Dashboard if you need the existing secret.",
      );
    } else {
      try {
        const endpoint = await stripe.webhookEndpoints.create({
          url: webhookUrl,
          enabled_events: webhookEvents,
          metadata: {
            app: "familyshoot",
            purpose: "subscription-and-credit-fulfillment",
          },
        });
        createdEnv.push(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
        console.log(`Stripe webhook endpoint created (${endpoint.id})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "failed";
        console.log(`Stripe webhook endpoint not created: ${message}`);
        console.log(
          "Set STRIPE_WEBHOOK_ENDPOINT_URL to a public HTTPS URL and rerun with --create --webhook.",
        );
      }
    }
  } else {
    console.log(`STRIPE_WEBHOOK_ENDPOINT_URL=${webhookUrl}`);
    console.log("STRIPE_WEBHOOK_SECRET=missing");
  }
}

if (createdEnv.length > 0) {
  console.log("");
  console.log("Add these to local and Vercel environments:");
  for (const line of createdEnv) {
    console.log(line);
  }
}

if (!shouldCreate) {
  console.log("");
  console.log(
    "Run with --create --portal --webhook to create the missing Stripe resources in this account.",
  );
}

async function findOrCreateProduct(name) {
  const products = await stripe.products.list({ active: true, limit: 100 });
  const existing = products.data.find((product) => product.name === name);
  if (existing) return existing;
  return stripe.products.create({ name });
}

async function findWebhookEndpoint(url) {
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  return endpoints.data.find((endpoint) => endpoint.url === url && endpoint.status === "enabled");
}

function webhookEndpointUrl() {
  const explicit = process.env.STRIPE_WEBHOOK_ENDPOINT_URL;
  if (explicit) return explicit;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!appUrl) return null;

  return `${appUrl.replace(/\/$/, "")}/api/stripe/webhook`;
}

function formatAmount(amount) {
  return `$${((amount ?? 0) / 100).toFixed(2)}`;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function printHelp() {
  console.log(`
Usage:
  node scripts/setup-stripe-subscriptions.mjs
  node scripts/setup-stripe-subscriptions.mjs --create --portal --webhook

Default mode verifies configured Stripe Price IDs.
--create creates the missing Stripe price for FamilyShoot Pro.
--portal also creates a Stripe Customer Portal configuration for cancellation,
invoice history, and payment method updates.
--webhook also creates a Stripe webhook endpoint for the app's subscription and
credit fulfillment events. Set STRIPE_WEBHOOK_ENDPOINT_URL to override the URL;
otherwise NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL is used.
`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

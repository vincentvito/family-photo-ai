#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";
import Stripe from "stripe";

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const requiredEnv = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY",
  "STRIPE_WEBHOOK_SECRET",
  "DATABASE_URL",
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

const checks = [];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
record(
  "Required local subscription env vars",
  missingEnv.length === 0,
  missingEnv.length === 0 ? "all present" : `missing: ${missingEnv.join(", ")}`,
);

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });
}

if (stripe) {
  await verifyPrice("FamilyShoot Pro monthly", process.env.STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY, {
    amount: 3900,
    recurringInterval: "month",
  });
  await verifyPortalConfig();
  await verifyWebhookEndpoint();
}

await verifyDatabase();
verifyVercelCredentials();

console.log("FamilyShoot Pro subscription readiness");
console.log("");
for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length > 0) {
  console.log("");
  console.log(`${failed.length} readiness check${failed.length === 1 ? "" : "s"} failed.`);
  process.exit(1);
}

async function verifyPrice(name, priceId, expected) {
  if (!stripe || !priceId) {
    record(name, false, "price id missing");
    return;
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    const amountMatches = price.unit_amount === expected.amount;
    const recurringMatches =
      expected.recurringInterval === undefined ||
      price.recurring?.interval === expected.recurringInterval;
    const active = price.active === true;
    record(
      name,
      active && amountMatches && recurringMatches,
      `${price.id}, ${formatAmount(price.unit_amount)}, ${
        price.recurring?.interval ?? "one-time"
      }, active=${active}`,
    );
  } catch (err) {
    record(name, false, err instanceof Error ? err.message : "failed to retrieve price");
  }
}

async function verifyPortalConfig() {
  const configId = process.env.STRIPE_PORTAL_CONFIGURATION_ID;
  if (!configId) {
    record("Stripe Customer Portal configuration", true, "not set; Stripe default will be used");
    return;
  }

  try {
    const config = await stripe.billingPortal.configurations.retrieve(configId);
    record(
      "Stripe Customer Portal configuration",
      config.active === true && config.features.subscription_cancel.enabled === true,
      `${config.id}, active=${config.active}, cancel=${config.features.subscription_cancel.enabled}`,
    );
  } catch (err) {
    record("Stripe Customer Portal configuration", false, errorMessage(err));
  }
}

async function verifyWebhookEndpoint() {
  const url = webhookEndpointUrl();
  if (!url) {
    record("Stripe webhook endpoint", false, "no public webhook URL configured");
    return;
  }

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const endpoint = endpoints.data.find((item) => item.url === url && item.status === "enabled");
    if (!endpoint) {
      record("Stripe webhook endpoint", false, `${url} not found`);
      return;
    }

    const missingEvents = webhookEvents.filter((event) => !endpoint.enabled_events.includes(event));
    record(
      "Stripe webhook endpoint",
      missingEvents.length === 0,
      missingEvents.length === 0
        ? `${endpoint.id}, all required events enabled`
        : `${endpoint.id}, missing: ${missingEvents.join(", ")}`,
    );
  } catch (err) {
    record("Stripe webhook endpoint", false, errorMessage(err));
  }
}

async function verifyDatabase() {
  const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    record("Postgres subscriptions table", false, "DATABASE_URL missing");
    return;
  }

  const client = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 5,
    connect_timeout: 10,
  });

  try {
    const rows = await client`
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'familyphotoai'
          and table_name = 'subscriptions'
      ) as exists
    `;
    record("Postgres subscriptions table", rows[0]?.exists === true, "familyphotoai.subscriptions");
  } catch (err) {
    record("Postgres subscriptions table", false, errorMessage(err));
  } finally {
    await client.end();
  }
}

function verifyVercelCredentials() {
  const hasToken = Boolean(process.env.VERCEL_TOKEN);
  const hasProject = Boolean(process.env.VERCEL_PROJECT_ID);
  record(
    "Vercel env sync credentials",
    hasToken && hasProject,
    hasToken && hasProject ? "present" : "missing VERCEL_TOKEN and/or VERCEL_PROJECT_ID",
  );
}

function webhookEndpointUrl() {
  const explicit = process.env.STRIPE_WEBHOOK_ENDPOINT_URL;
  if (explicit) return explicit;

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return null;

  return `${appUrl.replace(/\/$/, "")}/api/stripe/webhook`;
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

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
}

function formatAmount(amount) {
  return `$${((amount ?? 0) / 100).toFixed(2)}`;
}

function errorMessage(err) {
  return err instanceof Error ? err.message : "failed";
}

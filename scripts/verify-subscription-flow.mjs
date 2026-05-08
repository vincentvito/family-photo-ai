#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";
import Stripe from "stripe";

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const args = parseArgs();
if (args.help) {
  printHelp();
  process.exit(0);
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!stripeKey) fail("STRIPE_SECRET_KEY is required.");
if (!databaseUrl) fail("DIRECT_URL or DATABASE_URL is required.");
if (!args.userId && !args.email && !args.customerId) {
  fail("Pass --user-id=<id>, --email=<email>, or --customer-id=<cus_...>.");
}

const stripe = new Stripe(stripeKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});
const db = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  idle_timeout: 5,
  connect_timeout: 10,
});

const checks = [];

try {
  const user = await resolveUser();
  record("User resolved", Boolean(user), user ? `${user.id} (${user.email})` : "not found");

  if (user) {
    await verifyDbSubscription(user);
    await verifyDbCredits(user);
    await verifyStripeCustomer(user);
    await verifyRecentEvents(user);
  }
} finally {
  await db.end();
}

console.log("FamilyShoot Pro subscription flow verification");
console.log("");
for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length > 0) {
  console.log("");
  console.log(`${failed.length} flow check${failed.length === 1 ? "" : "s"} failed.`);
  process.exit(1);
}

async function resolveUser() {
  const rows = args.userId
    ? await db`
        select id, email, stripe_customer_id
        from familyphotoai."user"
        where id = ${args.userId}
        limit 1
      `
    : args.email
      ? await db`
          select id, email, stripe_customer_id
          from familyphotoai."user"
          where lower(email) = lower(${args.email})
          limit 1
        `
      : await db`
          select id, email, stripe_customer_id
          from familyphotoai."user"
          where stripe_customer_id = ${args.customerId}
          limit 1
        `;

  return rows[0] ?? null;
}

async function verifyDbSubscription(user) {
  const rows = await db`
    select stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end
    from familyphotoai.subscriptions
    where user_id = ${user.id}
    order by updated_at desc
    limit 1
  `;
  const subscription = rows[0] ?? null;
  record(
    "DB subscription row",
    Boolean(subscription),
    subscription
      ? `${subscription.stripe_subscription_id}, status=${subscription.status}, customer=${subscription.stripe_customer_id}, cancel_at_period_end=${subscription.cancel_at_period_end}`
      : "missing",
  );
}

async function verifyDbCredits(user) {
  const rows = await db`
    select coalesce(sum(credits), 0)::int as credits, count(*)::int as grants
    from familyphotoai.credit_transactions
    where user_id = ${user.id}
      and pack_id = 'familyshoot_pro_monthly'
      and status = 'completed'
  `;
  const credits = Number(rows[0]?.credits ?? 0);
  const grants = Number(rows[0]?.grants ?? 0);
  record("DB Pro credit grants", credits >= 25, `${credits} credits across ${grants} grant rows`);
}

async function verifyStripeCustomer(user) {
  const customerId = args.customerId ?? user.stripe_customer_id;
  if (!customerId) {
    record("Stripe customer", false, "missing stripe_customer_id");
    return;
  }

  const [customer, subscriptions] = await Promise.all([
    stripe.customers.retrieve(customerId),
    stripe.subscriptions.list({ customer: customerId, limit: 10 }),
  ]);
  const activeSub = subscriptions.data.find((subscription) =>
    ["active", "trialing", "past_due", "canceled"].includes(subscription.status),
  );
  record(
    "Stripe customer",
    !customer.deleted,
    customer.deleted ? `${customerId} deleted` : `${customerId}, email=${customer.email ?? "n/a"}`,
  );
  record(
    "Stripe subscription",
    Boolean(activeSub),
    activeSub
      ? `${activeSub.id}, status=${activeSub.status}, cancel_at_period_end=${activeSub.cancel_at_period_end}`
      : "missing",
  );
}

async function verifyRecentEvents(user) {
  const customerId = args.customerId ?? user.stripe_customer_id;
  if (!customerId) {
    record("Recent Stripe events", false, "missing stripe_customer_id");
    return;
  }

  const since = Math.floor(Date.now() / 1000) - args.sinceHours * 60 * 60;
  const events = await stripe.events.list({
    created: { gte: since },
    limit: 100,
  });
  const matching = events.data.filter((event) => eventReferencesCustomer(event, customerId));
  const types = new Set(matching.map((event) => event.type));

  const requiredTypes = [
    "checkout.session.completed",
    "invoice.payment_succeeded",
    "customer.subscription.created",
  ];
  for (const type of requiredTypes) {
    record(`Recent Stripe event ${type}`, types.has(type), types.has(type) ? "seen" : "missing");
  }

  if (args.expectCancellation) {
    const hasCancellation =
      types.has("customer.subscription.deleted") || types.has("customer.subscription.updated");
    record(
      "Recent Stripe cancellation event",
      hasCancellation,
      hasCancellation ? "seen" : "missing deleted/updated event",
    );
  }
}

function eventReferencesCustomer(event, customerId) {
  const object = event.data?.object;
  if (!object || typeof object !== "object") return false;
  if (object.customer === customerId) return true;
  if (typeof object.customer === "object" && object.customer?.id === customerId) return true;
  if (object.metadata?.userId && args.userId && object.metadata.userId === args.userId) return true;
  return false;
}

function parseArgs() {
  const parsed = {
    help: false,
    userId: "",
    email: "",
    customerId: "",
    sinceHours: 24,
    expectCancellation: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg.startsWith("--user-id=")) parsed.userId = arg.slice("--user-id=".length);
    else if (arg.startsWith("--email=")) parsed.email = arg.slice("--email=".length);
    else if (arg.startsWith("--customer-id=")) {
      parsed.customerId = arg.slice("--customer-id=".length);
    } else if (arg.startsWith("--since-hours=")) {
      parsed.sinceHours = Number(arg.slice("--since-hours=".length)) || 24;
    } else if (arg === "--expect-cancellation") {
      parsed.expectCancellation = true;
    }
  }

  return parsed;
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

function printHelp() {
  console.log(`
Usage:
  node scripts/verify-subscription-flow.mjs --email=test@example.com
  node scripts/verify-subscription-flow.mjs --user-id=<user_id>
  node scripts/verify-subscription-flow.mjs --customer-id=cus_...
  node scripts/verify-subscription-flow.mjs --email=test@example.com --expect-cancellation

Run after a real Stripe test-mode checkout or cancellation flow. It verifies
the app database, Stripe subscription state, and recent Stripe event evidence.
`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

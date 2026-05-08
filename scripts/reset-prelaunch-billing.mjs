#!/usr/bin/env node

/**
 * Pre-launch billing reset. Wipes pre-launch sales/grants/usages/subscriptions
 * data and clears test-mode Stripe customer IDs from the user table. Generated
 * images, rosters, and auth records are left intact so the 14-day cleanup job
 * can be exercised against real-looking data.
 *
 * Tables wiped:
 *   - familyphotoai.credit_transactions      (package sales, revenue stats)
 *   - familyphotoai.credit_grants            (admin grants)
 *   - familyphotoai.credit_usages            (so balances net to 0 after the above)
 *   - familyphotoai.subscriptions            (test-mode subscription rows)
 *
 * Columns nulled:
 *   - familyphotoai."user".stripe_customer_id   (test-mode cus_… are useless on live)
 *
 * Tables NOT touched:
 *   - generations, images, refinement_history, albums, album_images
 *   - people, photos
 *   - user (rows kept; only stripe_customer_id cleared), account, session, verification
 *
 * Usage:
 *   node scripts/reset-prelaunch-billing.mjs            # dry run; prints counts
 *   node scripts/reset-prelaunch-billing.mjs --confirm  # actually run, in a txn
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DIRECT_URL or DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  idle_timeout: 5,
  connect_timeout: 10,
});

try {
  const counts = await readCounts();
  printPlan(counts);

  if (!confirm) {
    console.log("\nDry run only. Re-run with --confirm to apply.");
    process.exit(0);
  }

  await sql.begin(async (tx) => {
    await tx`DELETE FROM familyphotoai.credit_usages`;
    await tx`DELETE FROM familyphotoai.credit_grants`;
    await tx`DELETE FROM familyphotoai.credit_transactions`;
    await tx`DELETE FROM familyphotoai.subscriptions`;
    await tx`UPDATE familyphotoai."user" SET stripe_customer_id = NULL WHERE stripe_customer_id IS NOT NULL`;
  });

  console.log("\nApplied. Re-reading counts to verify…");
  const after = await readCounts();
  printPlan(after, { suffix: "(after)" });
} finally {
  await sql.end();
}

async function readCounts() {
  const [tx] = await sql`SELECT count(*)::int AS n FROM familyphotoai.credit_transactions`;
  const [grants] = await sql`SELECT count(*)::int AS n FROM familyphotoai.credit_grants`;
  const [usages] = await sql`SELECT count(*)::int AS n FROM familyphotoai.credit_usages`;
  const [subs] = await sql`SELECT count(*)::int AS n FROM familyphotoai.subscriptions`;
  const [customerIds] =
    await sql`SELECT count(*)::int AS n FROM familyphotoai."user" WHERE stripe_customer_id IS NOT NULL`;
  const [generations] = await sql`SELECT count(*)::int AS n FROM familyphotoai.generations`;
  const [images] = await sql`SELECT count(*)::int AS n FROM familyphotoai.images`;
  return {
    creditTransactions: tx.n,
    creditGrants: grants.n,
    creditUsages: usages.n,
    subscriptions: subs.n,
    userStripeCustomerIds: customerIds.n,
    generations: generations.n,
    images: images.n,
  };
}

function printPlan(c, { suffix = "" } = {}) {
  const tag = suffix ? ` ${suffix}` : "";
  console.log(`\nCounts${tag}:`);
  console.log(`  credit_transactions          ${c.creditTransactions}   (will be wiped)`);
  console.log(`  credit_grants                ${c.creditGrants}   (will be wiped)`);
  console.log(`  credit_usages                ${c.creditUsages}   (will be wiped)`);
  console.log(`  subscriptions                ${c.subscriptions}   (will be wiped)`);
  console.log(`  user.stripe_customer_id set  ${c.userStripeCustomerIds}   (will be nulled)`);
  console.log(`  generations                  ${c.generations}   (KEPT)`);
  console.log(`  images                       ${c.images}   (KEPT)`);
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

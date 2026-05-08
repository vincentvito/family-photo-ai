#!/usr/bin/env node

/**
 * Test helper for the credit + subscription billing flow. Two independent modes:
 *
 *   1) Lifetime balance (default):
 *      Insert a negative credit_grants row equal to the current balance so it
 *      reads as 0. Generations, albums, images, purchase history, and usage
 *      history are all left intact. Reversible via --restore.
 *
 *   2) Subscription period quota (--drain):
 *      Subscription "shots left" = plan_quota − sum(credit_usages.credits) in
 *      the current billing period. We bump the credits column on the user's
 *      most recent in-period credit_usages row to push usage to plan_quota.
 *      No usage rows are inserted/deleted; the bump is reversible via --undrain.
 *
 * Usage:
 *   node scripts/zero-my-credits.mjs                          # zero lifetime balance
 *   node scripts/zero-my-credits.mjs --restore                # undo (1)
 *   node scripts/zero-my-credits.mjs --drain                  # drain to 0 in current period
 *   node scripts/zero-my-credits.mjs --drain 5                # drain exactly 5 shots
 *   node scripts/zero-my-credits.mjs --undrain 5              # subtract 5 from the bumped row
 *   node scripts/zero-my-credits.mjs you@example.com --drain  # any of the above for another user
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { nanoid } from "nanoid";
import postgres from "postgres";

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const REASON = "test: zero balance for subscription QA";
const DEFAULT_EMAIL = "vlad.palacio@gmail.com";

// Mirrors PRO_PLAN.credits in src/lib/pricing-packs.ts. Update if the plan changes.
const PLAN_QUOTAS = {
  familyshoot_pro_monthly: 25,
};

const args = process.argv.slice(2);
const restore = args.includes("--restore");
const drainIdx = args.indexOf("--drain");
const undrainIdx = args.indexOf("--undrain");
const drain = drainIdx !== -1;
const undrain = undrainIdx !== -1;
const drainAmount = drain ? parseOptionalInt(args[drainIdx + 1]) : null;
const undrainAmount = undrain ? parseOptionalInt(args[undrainIdx + 1]) : null;
const email = args.find((a, i) => !a.startsWith("--") && !isNumericArg(args, i)) ?? DEFAULT_EMAIL;

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
  const [userRow] = await sql`
    SELECT id FROM familyphotoai."user" WHERE email = ${email} LIMIT 1
  `;
  if (!userRow) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }
  const userId = userRow.id;

  if (drain || undrain) {
    await runSubscriptionMode(userId);
  } else {
    await runBalanceMode(userId);
  }
} finally {
  await sql.end();
}

async function runBalanceMode(userId) {
  const balance = await getBalance(userId);
  console.log(`User ${email} (${userId}) — current balance: ${balance}`);

  if (restore) {
    const deleted = await sql`
      DELETE FROM familyphotoai.credit_grants
      WHERE user_id = ${userId} AND reason = ${REASON}
      RETURNING credits
    `;
    const restored = deleted.reduce((sum, r) => sum + Number(r.credits), 0);
    console.log(`Removed ${deleted.length} offset grant(s) totaling ${restored} credits.`);
  } else if (balance === 0) {
    console.log("Balance is already 0 — nothing to do.");
  } else {
    await sql`
      INSERT INTO familyphotoai.credit_grants (id, user_id, credits, reason, granted_by_user_id)
      VALUES (${nanoid(14)}, ${userId}, ${-balance}, ${REASON}, ${userId})
    `;
    console.log(`Inserted offset grant of ${-balance} credits.`);
  }

  console.log(`New balance: ${await getBalance(userId)}`);
}

async function runSubscriptionMode(userId) {
  const [sub] = await sql`
    SELECT id, plan_id, status, current_period_start, current_period_end
    FROM familyphotoai.subscriptions
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  if (!sub) {
    console.error("No subscription found for this user.");
    process.exit(1);
  }
  if (!sub.current_period_start || !sub.current_period_end) {
    console.error("Subscription has no current period bounds — cannot drain.");
    process.exit(1);
  }
  const quota = PLAN_QUOTAS[sub.plan_id];
  if (quota == null) {
    console.error(`Unknown plan_id "${sub.plan_id}" — add it to PLAN_QUOTAS in this script.`);
    process.exit(1);
  }

  const used = await getPeriodUsage(userId, sub.current_period_start, sub.current_period_end);
  console.log(
    `User ${email} — plan ${sub.plan_id} (${sub.status}), period ` +
      `${sub.current_period_start.toISOString()} → ${sub.current_period_end.toISOString()}`,
  );
  console.log(`Quota: ${quota}, used: ${used}, remaining: ${quota - used}`);

  const [target] = await sql`
    SELECT id, credits FROM familyphotoai.credit_usages
    WHERE user_id = ${userId}
      AND created_at >= ${sub.current_period_start}
      AND created_at < ${sub.current_period_end}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (!target) {
    console.error(
      "No credit_usages row exists in the current period — generate at least one shot first, " +
        "then re-run --drain.",
    );
    process.exit(1);
  }

  if (drain) {
    const remaining = quota - used;
    const delta = drainAmount ?? remaining;
    if (delta <= 0) {
      console.log("Nothing to drain — already at or over quota.");
      return;
    }
    if (delta > remaining) {
      console.log(`Note: requested ${delta} but only ${remaining} remaining; clamping to ${remaining}.`);
    }
    const applied = Math.min(delta, remaining);
    await sql`
      UPDATE familyphotoai.credit_usages
      SET credits = credits + ${applied}
      WHERE id = ${target.id}
    `;
    console.log(`Bumped credit_usages ${target.id} by +${applied} (was ${target.credits}).`);
  } else if (undrain) {
    if (!undrainAmount || undrainAmount <= 0) {
      console.error("--undrain requires a positive integer (e.g. --undrain 5).");
      process.exit(1);
    }
    const newCredits = Math.max(1, Number(target.credits) - undrainAmount);
    const applied = Number(target.credits) - newCredits;
    await sql`
      UPDATE familyphotoai.credit_usages
      SET credits = ${newCredits}
      WHERE id = ${target.id}
    `;
    console.log(`Reduced credit_usages ${target.id} by -${applied} (was ${target.credits}, now ${newCredits}).`);
  }

  const finalUsed = await getPeriodUsage(userId, sub.current_period_start, sub.current_period_end);
  console.log(`New period usage: ${finalUsed}/${quota} (remaining: ${quota - finalUsed})`);
}

async function getBalance(userId) {
  const [row] = await sql`
    SELECT
      coalesce((SELECT sum(credits) FROM familyphotoai.credit_transactions
                WHERE user_id = ${userId} AND status = 'completed'), 0)
    + coalesce((SELECT sum(credits) FROM familyphotoai.credit_grants
                WHERE user_id = ${userId}), 0)
    - coalesce((SELECT sum(credits) FROM familyphotoai.credit_usages
                WHERE user_id = ${userId}), 0) AS balance
  `;
  return Number(row.balance);
}

async function getPeriodUsage(userId, start, end) {
  const [row] = await sql`
    SELECT coalesce(sum(credits), 0) AS used
    FROM familyphotoai.credit_usages
    WHERE user_id = ${userId} AND created_at >= ${start} AND created_at < ${end}
  `;
  return Number(row.used);
}

function parseOptionalInt(value) {
  if (value == null || value.startsWith("--")) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function isNumericArg(args, i) {
  if (i === 0) return false;
  const prev = args[i - 1];
  return (prev === "--drain" || prev === "--undrain") && /^-?\d+$/.test(args[i] ?? "");
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

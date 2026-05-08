#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const args = new Set(process.argv.slice(2));
const help = args.has("--help") || args.has("-h");
const shouldCreate = args.has("--create");

if (help) {
  printHelp();
  process.exit(0);
}

const token = process.env.VERCEL_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID;
const teamId = process.env.VERCEL_ORG_ID ?? process.env.VERCEL_TEAM_ID;
const targets = parseTargets();

const requiredKeys = ["STRIPE_PRICE_FAMILYSHOOT_PRO_MONTHLY", "STRIPE_WEBHOOK_SECRET"];

const optionalKeys = ["STRIPE_PORTAL_CONFIGURATION_ID"];
const keys = [...requiredKeys, ...optionalKeys].filter((key) => process.env[key]);
const missingLocal = requiredKeys.filter((key) => !process.env[key]);

if (missingLocal.length > 0) {
  fail(`Missing local env values: ${missingLocal.join(", ")}`);
}

if (!token || !projectId) {
  fail(
    "VERCEL_TOKEN and VERCEL_PROJECT_ID are required. Optional: VERCEL_ORG_ID or VERCEL_TEAM_ID.",
  );
}

const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
const baseUrl = `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}`;
const current = await vercelFetch(`${baseUrl}/env${query}`);
const existing = new Set(current.envs?.map((env) => env.key) ?? []);

console.log(`Vercel project: ${projectId}`);
console.log(`Targets: ${targets.join(", ")}`);
console.log(`Mode: ${shouldCreate ? "create missing env vars" : "verify only"}`);
console.log("");

for (const key of keys) {
  if (existing.has(key)) {
    console.log(`${key}=present`);
    continue;
  }

  if (!shouldCreate) {
    console.log(`${key}=missing`);
    continue;
  }

  await vercelFetch(`${baseUrl}/env${query}`, {
    method: "POST",
    body: JSON.stringify({
      key,
      value: process.env[key],
      type: "encrypted",
      target: targets,
    }),
  });
  console.log(`${key}=created`);
}

if (!shouldCreate) {
  console.log("");
  console.log("Run with --create to create missing Vercel env vars.");
}

async function vercelFetch(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data.error?.message ?? data.message ?? response.statusText;
    fail(`Vercel API ${response.status}: ${message}`);
  }
  return data;
}

function parseTargets() {
  const arg = process.argv.find((value) => value.startsWith("--targets="));
  const raw = arg?.slice("--targets=".length) ?? "production,preview";
  const values = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 ? values : ["production", "preview"];
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
  node scripts/sync-vercel-subscription-env.mjs
  node scripts/sync-vercel-subscription-env.mjs --create
  node scripts/sync-vercel-subscription-env.mjs --create --targets=production,preview,development

Requires:
  VERCEL_TOKEN
  VERCEL_PROJECT_ID

Optional:
  VERCEL_ORG_ID or VERCEL_TEAM_ID

Syncs subscription Stripe env vars from local .env/.env.local into Vercel.
`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

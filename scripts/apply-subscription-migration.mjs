#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const ROOT = process.cwd();
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const migrationPaths = [
  path.join(ROOT, "db", "migrations", "0006_subscriptions.sql"),
  path.join(ROOT, "db", "migrations", "0007_subscription_hardening.sql"),
];
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DIRECT_URL or DATABASE_URL is required to apply the subscription migration.");
  process.exit(1);
}

const client = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  idle_timeout: 5,
  connect_timeout: 10,
});

try {
  for (const migrationPath of migrationPaths) {
    const sqlText = fs.readFileSync(migrationPath, "utf8");
    await client.unsafe(sqlText);
    console.log(`Applied ${path.relative(ROOT, migrationPath)}`);
  }
} finally {
  await client.end();
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

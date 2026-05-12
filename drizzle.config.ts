import { loadEnvConfig } from "@next/env";
import type { Config } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default {
  schema: ["./db/schema.ts", "./db/auth-schema.ts"],
  out: "./db/migrations",
  dialect: "postgresql",
  schemaFilter: ["familyphotoai"],
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
} satisfies Config;

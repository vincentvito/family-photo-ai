import type { Config } from "drizzle-kit";

export default {
  schema: "./db/auth-schema.ts",
  out: "./db/auth-migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
} satisfies Config;

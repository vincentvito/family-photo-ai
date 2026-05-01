import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

declare global {
  var __authSql: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql =
  globalThis.__authSql ??
  postgres(connectionString, {
    max: 5,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__authSql = sql;
}

export const authDb = drizzle(sql);

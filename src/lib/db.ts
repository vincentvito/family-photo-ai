import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../db/schema";

declare global {
  var __sql: ReturnType<typeof postgres> | undefined;
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql =
    globalThis.__sql ??
    postgres(url, {
      max: Number(process.env.DATABASE_POOL_MAX ?? 20),
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__sql = sql;
  }
  return drizzle(sql, { schema });
}

// Lazy proxy: don't open a connection at module load. The Vercel build's
// page-data collector imports server modules across worker processes — eager
// connect-on-import caused races and SQLITE_BUSY in the prior SQLite setup,
// and would waste pooler slots on Postgres. The connection opens on first
// query instead.
export const db = new Proxy({} as ReturnType<typeof createClient>, {
  get(_t, prop, receiver) {
    const client = (globalThis.__db ??= createClient());
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { schema };

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "node:path";
import * as schema from "../../db/schema";

declare global {
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
  var __sqlite: Database.Database | undefined;
}

function createClient() {
  const dbPath = path.join(process.cwd(), "storage.sqlite");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  globalThis.__sqlite = sqlite;
  return drizzle(sqlite, { schema });
}

export const db = globalThis.__db ?? createClient();
if (process.env.NODE_ENV !== "production") globalThis.__db = db;

export { schema };

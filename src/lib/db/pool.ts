import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";
import postgres from "postgres";
import { POSTGRES_URL } from "astro:env/server";
declare global {
  var db: PostgresJsDatabase<typeof schema>;
}
export function getDb() {
  const client = postgres(POSTGRES_URL);
  if (globalThis.db) return globalThis.db;
  const db = drizzle(client, { schema });
  globalThis.db = db;
  return db;
}

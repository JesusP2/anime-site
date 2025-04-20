import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";
import postgres from "postgres";
import type { APIContext } from "astro";
import type { ActionAPIContext } from "astro:actions";
declare global {
  var db: PostgresJsDatabase<typeof schema>;
  var connectionString: string;
}
export function getDb(url: string) {
  const client = postgres(url);
  // if (globalThis.db) return globalThis.db;
  const db = drizzle(client, { schema });
  // globalThis.db = db;
  return db;
}

import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";
import postgres from "postgres";
import type { Ai } from "@cloudflare/workers-types";
declare global {
  var db: PostgresJsDatabase<typeof schema>;
  var connectionString: string;
  var waitUntil: (promise: Promise<void>) => void;
  var aiRun: Ai['run'];
}
export function getDb() {
  const client = postgres(globalThis.connectionString);
  // if (globalThis.db) return globalThis.db;
  const db = drizzle(client, { schema });
  // globalThis.db = db;
  return db;
}

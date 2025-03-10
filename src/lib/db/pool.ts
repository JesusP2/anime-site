import { drizzle } from "drizzle-orm/postgres-js";
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from "./schemas";
import postgres from "postgres";
import { POSTGRES_URL } from "astro:env/server";

type DbType = PostgresJsDatabase<typeof schema>;

// declare global {
//   var db: DbType | undefined;
// }
export function getDb() {
  const client = postgres(POSTGRES_URL);
  // if (globalThis.db) {
  //   return globalThis.db;
  // }
  const db = drizzle(client, { schema });
  // globalThis.db = db;
  return db;
}

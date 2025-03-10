import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";
import postgres from "postgres";
import { POSTGRES_URL } from "astro:env/server";
export function getDb() {
  const client = postgres(POSTGRES_URL);
  const db = drizzle(client, { schema });
  return db;
}

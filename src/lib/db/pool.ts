import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schemas";
// import { DATABASE_TOKEN, DATABASE_URL } from 'astro:env/server';

export const client = createClient({
  // url: DATABASE_URL,
  // authToken: DATABASE_TOKEN,
  url: import.meta.env?.DATABASE_URL || process.env.DATABASE_URL!,
  authToken: import.meta.env?.DATABASE_TOKEN || process.env.DATABASE_TOKEN!,
});
export const db = drizzle(client, { schema });
export type DBSchema = typeof schema;

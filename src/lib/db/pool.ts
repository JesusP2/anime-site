import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schemas";

export const client = createClient({
  url: import.meta.env?.DATABASE_URL || process.env.DATABASE_URL!,
  authToken: import.meta.env?.DATABASE_TOKEN || process.env.DATABASE_TOKEN!,
});
export const db = drizzle(client, { schema });

export type DBSchema = typeof schema;

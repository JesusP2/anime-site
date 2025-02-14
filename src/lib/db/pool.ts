import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schemas";
import { sql } from "drizzle-orm";

export const client = createClient({
  url: import.meta.env?.DATABASE_URL || process.env.DATABASE_URL!,
  authToken: import.meta.env?.DATABASE_TOKEN || process.env.DATABASE_TOKEN!,
});
export const db = drizzle(client, { schema });

await db.run(sql`
  CREATE INDEX IF NOT EXISTS vector_index
  ON anime(embedding)
  USING vector_cosine(1536)
`).catch(console.error);

await db.run(sql`
  CREATE INDEX IF NOT EXISTS vector_index
  ON manga(embedding)
  USING vector_cosine(1536)
`).catch(console.error);
export type DBSchema = typeof schema;

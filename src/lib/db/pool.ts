import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleTurso } from "drizzle-orm/libsql";
import * as schema from "./schemas";
import * as tursoSchema from "./turso-schemas";
import postgres from "postgres";

// export const client = postgres(
//   import.meta.env?.POSTGRES_URL || process.env.POSTGRES_URL!,
// );
// export const db = drizzle(client, { schema });

export const client = createClient({
  url: import.meta.env?.DATABASE_URL || process.env.DATABASE_URL!,
  authToken: import.meta.env?.DATABASE_TOKEN || process.env.DATABASE_TOKEN!,
});
export const db= drizzleTurso(client, { schema: tursoSchema });

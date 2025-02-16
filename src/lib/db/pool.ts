import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";
import postgres from "postgres";

export const client = postgres(
  import.meta.env?.POSTGRES_URL || process.env.POSTGRES_URL!,
);
export const db = drizzle(client, { schema });

import { cosineDistance, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export async function getSimilarity(
  column: PgColumn,
  q: string | null,
  getEmbedding: (q: string) => Promise<number[] | undefined>,
) {
  if (!q) return;
  const embedding = await getEmbedding(q);
  if (!embedding) return;
  return sql<number>`1 - (${cosineDistance(column, embedding)})`;
}

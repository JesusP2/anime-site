import { cosineDistance, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import type { getEmbedding as getEmbeddingFn } from "../semantic-search";

export async function getSimilarity(
  column: PgColumn,
  q: string | null,
  getEmbedding: typeof getEmbeddingFn,
) {
  if (!q) return;
  const embedding = await getEmbedding(q);
  if (!embedding.success) return;
  return sql<number>`1 - (${cosineDistance(column, embedding.value)})`;
}

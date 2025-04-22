import { and, count, desc, eq, sql } from "drizzle-orm";
import { getLocalDB, pgliteMangaTable } from "../pglite";
import type { EntityStatus, MangaCardItem } from "@/lib/types";
import type { FullMangaRecord } from "../types";
import { mangaFilters } from "./filters";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import { mangaSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { ActionError, actions } from "astro:actions";
import { err, ok } from "../result";
import { mapScore } from "../utils/map-score";
import { getSimilarity } from "../db/queries";

const mangaCardKeys = {
  titles: pgliteMangaTable.titles,
  images: pgliteMangaTable.images,
  type: pgliteMangaTable.type,
  chapters: pgliteMangaTable.chapters,
  volumes: pgliteMangaTable.volumes,
  score: sql<number>`${pgliteMangaTable.score}`.mapWith((score) =>
    mapScore(score),
  ),
  scored_by: pgliteMangaTable.scored_by,
  rank: pgliteMangaTable.rank,
  genres: pgliteMangaTable.genres,
  mal_id: pgliteMangaTable.mal_id,
  status: pgliteMangaTable.status,
} as const;

async function getEmbedding(q: string) {
  const result = await actions.getEmbedding({ q });
  return result.data;
}

export async function updateLocalManga(
  data: MangaCardItem | FullMangaRecord,
  embedding: number[],
  entityStatus: EntityStatus,
) {
  const { db } = await getLocalDB();
  const _data = {
    mal_id: data.mal_id,
    entityStatus,
    titles: data.titles,
    images: data.images,
    type: data.type,
    chapters: data.chapters,
    volumes: data.volumes,
    score: data.score,
    scored_by: data.scored_by,
    rank: data.rank,
    genres: data.genres,
    status: data.status,
    popularity: data.popularity,
    embedding,
  };
  await db
    .insert(pgliteMangaTable)
    .values(_data as any)
    .onConflictDoUpdate({
      target: pgliteMangaTable.mal_id,
      set: _data as any,
    });
}

export async function deleteMangaFromLocalDB(mal_id: number) {
  const { db } = await getLocalDB();
  await db.delete(pgliteMangaTable).where(eq(pgliteMangaTable.mal_id, mal_id));
}

export async function getMangaFromLocalDB(mal_id: number) {
  const { db } = await getLocalDB();
  const [record] = await db
    .select()
    .from(pgliteMangaTable)
    .where(eq(pgliteMangaTable.mal_id, mal_id));
  return record;
}

export async function getMangasFromLocalDB(
  entityStatus: EntityStatus,
  searchParams: URLSearchParams,
) {
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    mangaFilters,
  );
  const recordsPerPage = 25;
  try {
    let { where, orderBy, offset } = await mangaSearchParamsToDrizzleQuery(
      sanitizedSearchParams,
      recordsPerPage,
      pgliteMangaTable,
    );
    where = where
      ? and(where, eq(pgliteMangaTable.entityStatus, entityStatus))
      : eq(pgliteMangaTable.entityStatus, entityStatus);
    const { db } = await getLocalDB();
    const queryCount = db
      .select({ count: count() })
      .from(pgliteMangaTable)
      .where(where);

    const similarity = await getSimilarity(
      pgliteMangaTable.embedding,
      sanitizedSearchParams.get("q"),
      getEmbedding,
    );
    let query: any;
    if (similarity) {
      const sq = db
        .select({
          mal_id: pgliteMangaTable.mal_id,
          similarity: similarity.as("similarity"),
        })
        .from(pgliteMangaTable)
        .where(where)
        .offset(offset)
        .orderBy((t) => desc(t.similarity))
        .limit(recordsPerPage)
        .as("sq");
      query = db
        .select(mangaCardKeys)
        .from(pgliteMangaTable)
        .innerJoin(sq, eq(pgliteMangaTable.mal_id, sq.mal_id));
    } else {
      query = db
        .select(mangaCardKeys)
        .from(pgliteMangaTable)
        .where(where)
        .offset(offset)
        .limit(recordsPerPage);
    }
    if (orderBy) {
      query = query.orderBy(orderBy);
    }
    const [mangaRecords, mangaCount] = await Promise.all([
      query,
      similarity ? [{ count: recordsPerPage }] : queryCount,
    ]);
    return ok({
      data: mangaRecords,
      count: mangaCount[0]?.count ?? 0,
    });
  } catch (_) {
    console.error(_);
    return err(
      new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected error",
      }),
    );
  }
}

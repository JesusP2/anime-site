import { and, count, eq } from "drizzle-orm";
import { getLocalDB, pgliteMangaTable } from "../pglite";
import type { MangaCardItem } from "@/lib/types";
import type { FullMangaRecord } from "../types";
import { mangaFilters } from "./filters";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import { mangaSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { ActionError, actions } from "astro:actions";
import { err, ok } from "../result";
import { mapScore } from "../utils/map-score";

const mangaCardItems = {
  titles: pgliteMangaTable.titles,
  images: pgliteMangaTable.images,
  type: pgliteMangaTable.type,
  // rating: pgliteMangaTable.rating,
  // season: pgliteMangaTable.season,
  // year: pgliteMangaTable.year,
  // aired: pgliteMangaTable.aired,
  // episodes: pgliteMangaTable.episodes,
  chapters: pgliteMangaTable.chapters,
  volumes: pgliteMangaTable.volumes,
  score: pgliteMangaTable.score,
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
  data: (MangaCardItem | FullMangaRecord) & { embedding: number[] },
  entityStatus: string,
) {
  const { db } = await getLocalDB();
  const _data = {
    mal_id: data.mal_id,
    entityStatus,
    titles: data.titles,
    images: data.images,
    type: data.type,
    // rating: data.rating,
    // season: data.season,
    // year: data.year,
    // aired: data.aired,
    // episodes: data.episodes,
    chapters: data.chapters,
    volumes: data.volumes,
    score: data.score,
    scored_by: data.scored_by,
    rank: data.rank,
    genres: data.genres,
    status: data.status,
    popularity: data.popularity,
    embedding: data.embedding,
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
  entityStatus: string,
  searchParams: URLSearchParams,
) {
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    mangaFilters,
  );
  const recordsPerPage = 25;
  try {
    let { similarity, where, orderBy, offset } =
      await mangaSearchParamsToDrizzleQuery(
        sanitizedSearchParams,
        recordsPerPage,
        pgliteMangaTable,
        getEmbedding,
      );
    where = where
      ? and(where, eq(pgliteMangaTable.entityStatus, entityStatus))
      : eq(pgliteMangaTable.entityStatus, entityStatus);
    const { db } = await getLocalDB();
    const queryCount = db
      .select({ count: count() })
      .from(pgliteMangaTable)
      .where(where);
    const query = db
      .select(similarity ? { ...mangaCardItems, similarity } : mangaCardItems)
      .from(pgliteMangaTable)
      .where(where)
      .offset(offset)
      .orderBy(...(orderBy as any))
      .limit(recordsPerPage);
    const [mangaRecords, mangaCount] = await Promise.all([
      query,
      similarity ? [{ count: recordsPerPage }] : queryCount,
    ]);
    return ok({
      data: mangaRecords.map((r) => ({
        ...r,
        score: mapScore(r.score),
      })),
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

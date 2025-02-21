import { and, count, eq } from "drizzle-orm";
import { getLocalDB, pgliteAnimeTable } from "../pglite";
import type { AnimeCardItem } from "@/lib/types";
import type { FullAnimeRecord } from "../types";
import { animeFilters } from "./filters";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import { animeSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { ActionError, actions } from "astro:actions";
import { err, ok } from "../result";
import { mapScore } from "../utils/map-score";

const animeCardKeys = {
  titles: pgliteAnimeTable.titles,
  images: pgliteAnimeTable.images,
  type: pgliteAnimeTable.type,
  rating: pgliteAnimeTable.rating,
  season: pgliteAnimeTable.season,
  year: pgliteAnimeTable.year,
  aired: pgliteAnimeTable.aired,
  episodes: pgliteAnimeTable.episodes,
  score: pgliteAnimeTable.score,
  scored_by: pgliteAnimeTable.scored_by,
  rank: pgliteAnimeTable.rank,
  genres: pgliteAnimeTable.genres,
  mal_id: pgliteAnimeTable.mal_id,
  status: pgliteAnimeTable.status,
} as const;

async function getEmbedding(q: string) {
  const result = await actions.getEmbedding({ q });
  return result.data;
}

export async function updateLocalAnime(
  data: (AnimeCardItem | FullAnimeRecord) & { embedding: number[] },
  entityStatus: string,
) {
  const { db } = await getLocalDB();
  const _data = {
    mal_id: data.mal_id,
    entityStatus,
    titles: data.titles,
    images: data.images,
    type: data.type,
    rating: data.rating,
    season: data.season,
    year: data.year,
    aired: data.aired,
    episodes: data.episodes,
    score: data.score,
    scored_by: data.scored_by,
    rank: data.rank,
    genres: data.genres,
    status: data.status,
    popularity: data.popularity,
    embedding: data.embedding,
  };
  await db
    .insert(pgliteAnimeTable)
    .values(_data as any)
    .onConflictDoUpdate({
      target: pgliteAnimeTable.mal_id,
      set: _data as any,
    });
}

export async function deleteAnimeFromLocalDB(mal_id: number) {
  const { db } = await getLocalDB();
  await db.delete(pgliteAnimeTable).where(eq(pgliteAnimeTable.mal_id, mal_id));
}

export async function getAnimeFromLocalDB(mal_id: number) {
  const { db } = await getLocalDB();
  const [record] = await db
    .select()
    .from(pgliteAnimeTable)
    .where(eq(pgliteAnimeTable.mal_id, mal_id));
  return record;
}

export async function getAnimesFromLocalDB(
  entityStatus: string,
  searchParams: URLSearchParams,
) {
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    animeFilters,
  );
  const recordsPerPage = 25;
  try {
    let { similarity, where, orderBy, offset } =
      await animeSearchParamsToDrizzleQuery(
        sanitizedSearchParams,
        recordsPerPage,
        pgliteAnimeTable,
        getEmbedding,
      );
    where = where
      ? and(where, eq(pgliteAnimeTable.entityStatus, entityStatus))
      : eq(pgliteAnimeTable.entityStatus, entityStatus);
    const { db } = await getLocalDB();
    const queryCount = db
      .select({ count: count() })
      .from(pgliteAnimeTable)
      .where(where);
    const query = db
      .select(similarity ? { ...animeCardKeys, similarity } : animeCardKeys)
      .from(pgliteAnimeTable)
      .where(where)
      .offset(offset)
      .orderBy(...(orderBy as any))
      .limit(recordsPerPage);
    const [animeRecords, animeCount] = await Promise.all([
      query,
      similarity ? [{ count: recordsPerPage }] : queryCount,
    ]);
    return ok({
      data: animeRecords.map((r) => ({
        ...r,
        score: mapScore(r.score),
      })),
      count: animeCount[0]?.count ?? 0,
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

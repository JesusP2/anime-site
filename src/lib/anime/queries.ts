import { and, count, eq } from "drizzle-orm";
import { animeTable, trackedEntityTable } from "../db/schemas";
import { animeSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { db } from "../db/pool";
import { animeFilters } from "./filters";
import type { AnimeCardItem, EntityStatus } from "@/lib/types";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import type { FullAnimeRecord } from "../types";
import { ActionError } from "astro:actions";
import { err, ok, type Result } from "../result";
import { getEmbedding } from "../semantic-search";
import { mapScore } from "../utils/map-score";

const animeCardKeys = {
  titles: animeTable.titles,
  images: animeTable.images,
  type: animeTable.type,
  rating: animeTable.rating,
  season: animeTable.season,
  year: animeTable.year,
  aired: animeTable.aired,
  episodes: animeTable.episodes,
  score: animeTable.score,
  scored_by: animeTable.scored_by,
  rank: animeTable.rank,
  genres: animeTable.genres,
  mal_id: animeTable.mal_id,
  status: animeTable.status,
} as const;

export async function getAnime(
  mal_id: number,
  userId: string | undefined,
): Promise<
  Result<FullAnimeRecord & { entityStatus: EntityStatus | null }, ActionError>
> {
  try {
    const selectKeys = {
      titles: animeTable.titles,
      images: animeTable.images,
      type: animeTable.type,
      rating: animeTable.rating,
      season: animeTable.season,
      year: animeTable.year,
      aired: animeTable.aired,
      episodes: animeTable.episodes,
      score: animeTable.score,
      scored_by: animeTable.scored_by,
      rank: animeTable.rank,
      genres: animeTable.genres,
      mal_id: animeTable.mal_id,
      status: animeTable.status,
      popularity: animeTable.popularity,
      members: animeTable.members,
      synopsis: animeTable.synopsis,
      demographics: animeTable.demographics,
      studios: animeTable.studios,
      broadcast: animeTable.broadcast,
      characters: animeTable.characters,
      staff: animeTable.staff,
      episodes_info: animeTable.episodes_info,
      streaming: animeTable.streaming,
      embedding: animeTable.embedding,
    } as const;
    if (userId) {
      const [anime] = await db
        .select({
          ...selectKeys,
          entityStatus: trackedEntityTable.entityStatus,
        })
        .from(animeTable)
        .where(eq(animeTable.mal_id, mal_id))
        .leftJoin(
          trackedEntityTable,
          and(
            eq(animeTable.mal_id, trackedEntityTable.mal_id),
            eq(trackedEntityTable.userId, userId),
          ),
        );
      if (anime) {
        return ok({ ...anime, score: mapScore(anime.score) });
      }
      return err(
        new ActionError({
          code: "NOT_FOUND",
          message: "Could not get anime",
        }),
      );
    }
    const [anime] = await db
      .select(selectKeys)
      .from(animeTable)
      .where(eq(animeTable.mal_id, mal_id));
    if (anime) {
      return ok({ ...anime, entityStatus: null, score: mapScore(anime.score) });
    }
    return err(
      new ActionError({
        code: "NOT_FOUND",
        message: "Could not get anime",
      }),
    );
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

export async function getAnimes(
  searchParams: URLSearchParams,
  recordsPerPage: number,
): Promise<Result<{ data: AnimeCardItem[]; count: number }, ActionError>> {
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    animeFilters,
  );
  let { similarity, where, orderBy, offset } =
    await animeSearchParamsToDrizzleQuery(
      sanitizedSearchParams,
      recordsPerPage,
      animeTable,
      getEmbedding,
    );
  try {
    const queryCount = db
      .select({ count: count() })
      .from(animeTable)
      .where(where);
    const query = db
      .select(similarity ? { ...animeCardKeys, similarity } : animeCardKeys)
      .from(animeTable)
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

export async function getAnimesWithStatus(
  entityStatus: EntityStatus,
  searchParams: URLSearchParams,
  recordsPerPage: number,
  userId: string,
): Promise<Result<{ data: AnimeCardItem[]; count: number }, ActionError>> {
  const cleanedSearchParams = sanitizeSearchParams(searchParams, animeFilters);
  let { similarity, where, orderBy, offset } =
    await animeSearchParamsToDrizzleQuery(
      cleanedSearchParams,
      recordsPerPage,
      animeTable,
      getEmbedding,
    );
  where = where
    ? and(where, eq(trackedEntityTable.entityStatus, entityStatus))
    : eq(trackedEntityTable.entityStatus, entityStatus);
  where = and(where, eq(trackedEntityTable.userId, userId));

  try {
    const queryCount = db
      .select({ count: count() })
      .from(animeTable)
      .where(where)
      .leftJoin(
        trackedEntityTable,
        eq(animeTable.mal_id, trackedEntityTable.mal_id),
      );
    const query = db
      .select(similarity ? { ...animeCardKeys, similarity } : animeCardKeys)
      .from(animeTable)
      .where(where)
      .offset(offset)
      .limit(recordsPerPage)
      .orderBy(...(orderBy as any))
      .leftJoin(
        trackedEntityTable,
        eq(animeTable.mal_id, trackedEntityTable.mal_id),
      );
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

export async function getCarouselAnimes(
  searchParams: URLSearchParams,
  recordsPerPage: number,
): Promise<
  Result<
    Pick<FullAnimeRecord, "mal_id" | "titles" | "images" | "type">[],
    ActionError
  >
> {
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    animeFilters,
  );
  sanitizedSearchParams.delete("q");
  let { where, orderBy, offset } = await animeSearchParamsToDrizzleQuery(
    sanitizedSearchParams,
    recordsPerPage,
    animeTable,
    getEmbedding,
  );
  try {
    const animeRecords = await db
      .select({
        mal_id: animeTable.mal_id,
        titles: animeTable.titles,
        images: animeTable.images,
        type: animeTable.type,
      })
      .from(animeTable)
      .where(where)
      .offset(offset)
      .orderBy(...(orderBy as any))
      .limit(recordsPerPage);
    return ok(animeRecords);
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

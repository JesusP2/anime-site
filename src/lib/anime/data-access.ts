import { and, count, eq } from "drizzle-orm";
import { animeTable, trackedEntityTable } from "../db/schemas";
import { animeSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { db } from "../db/pool";
import { animeFilters } from "./filters";
import { parseRecord } from "../db/parse-record";
import { stringifiedAnimeKeys } from "./stringified-keys";
import type { AnimeCardItem } from "@/components/anime-card";
import { ok, err, type Result } from "neverthrow";
import { cleanSearchParams } from "../utils/clean-searchparams";
import type { FullAnimeRecord } from "../types";
import { ActionError } from "astro:actions";

export async function getAnime(
  mal_id: number,
  userId: string | undefined,
): Promise<Result<FullAnimeRecord, ActionError>> {
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
        return ok(parseRecord(anime, stringifiedAnimeKeys) as FullAnimeRecord);
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
      return ok(parseRecord(anime, stringifiedAnimeKeys) as FullAnimeRecord);
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

export async function getCurrentSeasonCount(
  searchParams: URLSearchParams,
  recordsPerPage = 25,
): Promise<Result<number, ActionError>> {
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  const { where, orderBy } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  const query = db.select({ count: count() }).from(animeTable).where(where);
  let animesCount: number;
  try {
    if (orderBy) {
      animesCount = (await query.orderBy(orderBy))[0]?.count as number;
    }
    animesCount = (await query)[0]?.count as number;
    return ok(animesCount);
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

export async function getCurrentSeason(
  searchParams: URLSearchParams,
  recordsPerPage = 25,
  userId?: string,
): Promise<Result<AnimeCardItem[], ActionError>> {
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  const { where, orderBy, offset, limit } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  const query = db
    .select({
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
      entityStatus: trackedEntityTable.entityStatus,
    })
    .from(animeTable)
    .where(where)
    .offset(offset)
    .limit(limit)
    .leftJoin(
      trackedEntityTable,
      and(
        eq(animeTable.mal_id, trackedEntityTable.mal_id),
        eq(trackedEntityTable.userId, userId ?? "0"),
      ),
    );
  let stringifiedAnimeRecords: any[] = [];
  try {
    if (orderBy) {
      stringifiedAnimeRecords = await query.orderBy(orderBy);
    }
    stringifiedAnimeRecords = await query;
    return ok(
      stringifiedAnimeRecords.map((anime) =>
        parseRecord(anime, stringifiedAnimeKeys),
      ),
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

export async function getAnimesWithStatusCount(
  status: string,
  searchParams: URLSearchParams,
  recordsPerPage = 25,
  userId?: string,
): Promise<Result<number, ActionError>> {
  if (!userId) {
    return err(
      new ActionError({
        code: "UNAUTHORIZED",
        message: "User not found",
      }),
    );
  }
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  let { where, orderBy } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  where = and(where, eq(trackedEntityTable.entityStatus, status));
  where = and(where, eq(trackedEntityTable.userId, userId));
  const query = db
    .select({ count: count() })
    .from(animeTable)
    .where(where)
    .leftJoin(
      trackedEntityTable,
      eq(animeTable.mal_id, trackedEntityTable.mal_id),
    );
  let animesCount: number;
  try {
    if (orderBy) {
      animesCount = (await query.orderBy(orderBy))[0]?.count as number;
    }
    animesCount = (await query)[0]?.count as number;
    return ok(animesCount);
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
  status: string,
  searchParams: URLSearchParams,
  recordsPerPage = 25,
  userId?: string,
): Promise<Result<AnimeCardItem[], ActionError>> {
  if (!userId) {
    return err(
      new ActionError({
        code: "UNAUTHORIZED",
        message: "User not found",
      }),
    );
  }
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  let { where, orderBy, offset, limit } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  where = and(where, eq(trackedEntityTable.entityStatus, status));
  where = and(where, eq(trackedEntityTable.userId, userId));
  const query = db
    .select({
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
      entityStatus: trackedEntityTable.entityStatus,
    })
    .from(animeTable)
    .where(where)
    .offset(offset)
    .limit(limit)
    .leftJoin(
      trackedEntityTable,
      eq(animeTable.mal_id, trackedEntityTable.mal_id),
    );
  let stringifiedAnimeRecords: any[] = [];
  try {
    if (orderBy) {
      stringifiedAnimeRecords = await query.orderBy(orderBy);
    }
    stringifiedAnimeRecords = await query;
    return ok(
      stringifiedAnimeRecords.map((anime) =>
        parseRecord(anime, stringifiedAnimeKeys),
      ),
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

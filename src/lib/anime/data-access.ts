import { and, count, eq, inArray } from "drizzle-orm";
import { animeTable, trackedEntityTable } from "../db/schemas";
import { animeSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { db } from "../db/pool";
import { animeFilters } from "./filters";
import type { AnimeCardItem } from "@/components/anime-card";
import { cleanSearchParams } from "../utils/clean-searchparams";
import type { FullAnimeRecord } from "../types";
import { ActionError } from "astro:actions";
import { err, ok, type Result } from "../result";
import { semanticSearch } from "../semantic-search";

export async function getAnime(
  mal_id: number,
  userId: string | undefined,
): Promise<
  Result<FullAnimeRecord & { entityStatus: string | null }, ActionError>
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
        return ok(anime);
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
      return ok({ ...anime, entityStatus: null });
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

export async function getCurrentSeason(
  searchParams: URLSearchParams,
  recordsPerPage: number,
): Promise<Result<{ data: AnimeCardItem[]; count: number }, ActionError>> {
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  let { where, orderBy, offset, limit } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  try {
    const q = cleanedSearchParams.get("q");
    if (typeof q === "string" && q !== "") {
      const ids = await semanticSearch(q, "anime", 25);
      if (ids) {
        where = and(where, inArray(animeTable.mal_id, ids));
      }
    }
    const queryCount = await db
      .select({ count: count() })
      .from(animeTable)
      .where(where);
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
        characters: animeTable.characters,
      })
      .from(animeTable)
      .where(where)
      .offset(offset)
      .limit(limit);
    if (orderBy) {
      const [animeRecords, animeCount] = await Promise.all([
        query.orderBy(orderBy),
        queryCount,
      ]);
      return ok({
        data: animeRecords,
        count: animeCount[0]?.count ?? 0,
      });
    }
    const [animeRecords, animeCount] = await Promise.all([query, queryCount]);
    return ok({
      data: animeRecords,
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
  status: string,
  searchParams: URLSearchParams,
  recordsPerPage: number,
  userId: string,
): Promise<Result<{ data: AnimeCardItem[]; count: number }, ActionError>> {
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  let { where, orderBy, offset, limit } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  where = and(where, eq(trackedEntityTable.entityStatus, status));
  where = and(where, eq(trackedEntityTable.userId, userId));

  try {
    const q = cleanedSearchParams.get("q");
    if (typeof q === "string" && q !== "") {
      const ids = await semanticSearch(q, "anime", 25);
      if (ids) {
        where = and(where, inArray(animeTable.mal_id, ids));
      }
    }

    const queryCount = db
      .select({ count: count() })
      .from(animeTable)
      .where(where)
      .leftJoin(
        trackedEntityTable,
        eq(animeTable.mal_id, trackedEntityTable.mal_id),
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
        eq(animeTable.mal_id, trackedEntityTable.mal_id),
      );
    if (orderBy) {
      const [animeRecords, animeCount] = await Promise.all([
        query.orderBy(orderBy),
        queryCount,
      ]);
      return ok({
        data: animeRecords,
        count: animeCount[0]?.count ?? 0,
      });
    }
    const [animeRecords, animeCount] = await Promise.all([query, queryCount]);
    return ok({
      data: animeRecords,
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

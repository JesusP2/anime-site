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

export async function getCurrentSeasonCount(
  searchParams: URLSearchParams,
  recordsPerPage = 25,
): Promise<Result<number, Error>> {
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
    return err(new Error("Could not get animes count"));
  }
}

export async function getCurrentSeason(
  searchParams: URLSearchParams,
  recordsPerPage = 25,
): Promise<Result<AnimeCardItem[], Error>> {
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
    return err(new Error("Could not get animes"));
  }
}

export async function getAnimesWithStatusCount(
  status: string,
  searchParams: URLSearchParams,
  recordsPerPage = 25,
): Promise<Result<number, Error>> {
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  let { where, orderBy } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  where = and(where, eq(trackedEntityTable.entityStatus, status));
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
    return err(new Error("Could not get animes count"));
  }
}

export async function getAnimesWithStatus(
  status: string,
  searchParams: URLSearchParams,
  recordsPerPage = 25,
): Promise<Result<AnimeCardItem[], Error>> {
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  let { where, orderBy, offset, limit } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  where = and(where, eq(trackedEntityTable.entityStatus, status));
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
    return err(new Error("Could not get animes"));
  }
}

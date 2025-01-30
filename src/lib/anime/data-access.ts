import { count, eq } from "drizzle-orm";
import { animeTable, trackedEntityTable } from "../db/schemas";
import {
  animeSearchParamsToDrizzleQuery,
  cleanSearchParams,
} from "../search-params-to-drizzle-query";
import { db } from "../db/pool";
import { animeFilters } from "./filters";
import { parseRecord } from "../db/parse-record";
import { stringifiedAnimeKeys } from "./stringified-keys";
import type { AnimeCardItem } from "@/components/anime-card";

export function getAnimesCount(
  searchParams: URLSearchParams,
  recordsPerPage = 25,
) {
  const cleanedSearchParams = cleanSearchParams(searchParams, animeFilters);
  const { where, orderBy } = animeSearchParamsToDrizzleQuery(
    cleanedSearchParams,
    recordsPerPage,
  );
  const query = db.select({ count: count() }).from(animeTable).where(where);
  if (orderBy) {
    return query.orderBy(orderBy);
  }
  return query;
}

export async function getCurrentSeason(
  searchParams: URLSearchParams,
  recordsPerPage = 25,
) {
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
  if (orderBy) {
    stringifiedAnimeRecords = await query.orderBy(orderBy);
  }
  stringifiedAnimeRecords = await query;
  return stringifiedAnimeRecords.map((anime) =>
    parseRecord(anime, stringifiedAnimeKeys),
  ) as AnimeCardItem[];
}

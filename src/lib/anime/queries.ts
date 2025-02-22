import { and, count, desc, eq, sql } from "drizzle-orm";
import { animeTable, trackedEntityTable } from "../db/schemas";
import { animeSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { db } from "../db/pool";
import { animeFilters } from "./filters";
import type { AnimeCardItem, EntityStatus } from "@/lib/types";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import type { FullAnimeRecord } from "../types";
import { ActionError } from "astro:actions";
import { err, ok, type Result } from "../result";
import { mapScore } from "../utils/map-score";
import { getSimilarity } from "../db/queries";
import { getEmbedding } from "../semantic-search";

const animeCardKeys = {
  titles: animeTable.titles,
  images: animeTable.images,
  type: animeTable.type,
  rating: animeTable.rating,
  season: animeTable.season,
  year: animeTable.year,
  aired: animeTable.aired,
  episodes: animeTable.episodes,
  score: sql<number>`${animeTable.score}`.mapWith((score) => mapScore(score)),
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
      score: sql<number>`${animeTable.score}`.mapWith((score) =>
        mapScore(score),
      ),
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
          eq(trackedEntityTable.userId, userId ?? "0"),
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
  let { where, orderBy, offset } = await animeSearchParamsToDrizzleQuery(
    sanitizedSearchParams,
    recordsPerPage,
    animeTable,
  );
  try {
    const queryCount = db
      .select({ count: count() })
      .from(animeTable)
      .where(where);
    const similarity = await getSimilarity(
      animeTable.embedding,
      sanitizedSearchParams.get("q"),
      getEmbedding,
    );
    let query: any;
    if (similarity) {
      const sq = db
        .select({
          mal_id: animeTable.mal_id,
          similarity: similarity.as("similarity"),
        })
        .from(animeTable)
        .where(where)
        .offset(offset)
        .orderBy((t) => desc(t.similarity))
        .limit(recordsPerPage)
        .as("sq");
      query = db
        .select(animeCardKeys)
        .from(animeTable)
        .innerJoin(sq, eq(animeTable.mal_id, sq.mal_id));
    } else {
      query = db
        .select(animeCardKeys)
        .from(animeTable)
        .where(where)
        .offset(offset)
        .limit(recordsPerPage);
    }
    if (orderBy) {
      query = query.orderBy(orderBy);
    }
    const [animeRecords, animeCount] = await Promise.all([
      query,
      similarity ? [{ count: recordsPerPage }] : queryCount,
    ]);
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
  entityStatus: EntityStatus,
  searchParams: URLSearchParams,
  recordsPerPage: number,
  userId: string,
): Promise<Result<{ data: AnimeCardItem[]; count: number }, ActionError>> {
  const sanitizedSearchParams = sanitizeSearchParams(searchParams, animeFilters);
  let { where, orderBy, offset } = await animeSearchParamsToDrizzleQuery(
    sanitizedSearchParams,
    recordsPerPage,
    animeTable,
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
    const similarity = await getSimilarity(
      animeTable.embedding,
      sanitizedSearchParams.get("q"),
      getEmbedding,
    );
    let query: any;
    if (similarity) {
      const sq = db
        .select({
          mal_id: animeTable.mal_id,
          similarity: similarity.as("similarity"),
        })
        .from(animeTable)
        .where(where)
        .offset(offset)
        .orderBy((t) => desc(t.similarity))
        .limit(recordsPerPage)
        .as("sq");
      query = db
        .select(animeCardKeys)
        .from(animeTable)
        .innerJoin(sq, eq(animeTable.mal_id, sq.mal_id))
        .leftJoin(
          trackedEntityTable,
          eq(animeTable.mal_id, trackedEntityTable.mal_id),
        );
    } else {
      query = db
        .select(animeCardKeys)
        .from(animeTable)
        .where(where)
        .offset(offset)
        .limit(recordsPerPage)
        .leftJoin(
          trackedEntityTable,
          eq(animeTable.mal_id, trackedEntityTable.mal_id),
        );
    }
    if (orderBy) {
      query = query.orderBy(orderBy);
    }
    const [animeRecords, animeCount] = await Promise.all([
      query,
      similarity ? [{ count: recordsPerPage }] : queryCount,
    ]);
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
  );
  try {
    const query = db
      .select({
        mal_id: animeTable.mal_id,
        titles: animeTable.titles,
        images: animeTable.images,
        type: animeTable.type,
      })
      .from(animeTable)
      .where(where)
      .offset(offset)
      .limit(recordsPerPage);
    if (orderBy) {
      return ok(await query.orderBy(orderBy));
    } else {
      return ok(await query);
    }
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

import { and, count, eq } from "drizzle-orm";
import { mangaTable, trackedEntityTable } from "../db/schemas";
import { mangaSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { db } from "../db/pool";
import { mangaFilters } from "./filters";
import type { MangaCardItem } from "@/lib/types";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import type { FullMangaRecord } from "../types";
import { ActionError } from "astro:actions";
import { err, ok, type Result } from "../result";
import { getEmbedding } from "../semantic-search";
import { mapScore } from "../utils/map-score";

const mangaCardKeys = {
  titles: mangaTable.titles,
  images: mangaTable.images,
  type: mangaTable.type,
  // rating: mangaTable.rating,
  // season: mangaTable.season,
  // year: mangaTable.year,
  // aired: mangaTable.aired,
  chapters: mangaTable.chapters,
  volumes: mangaTable.volumes,
  score: mangaTable.score,
  scored_by: mangaTable.scored_by,
  rank: mangaTable.rank,
  genres: mangaTable.genres,
  mal_id: mangaTable.mal_id,
  status: mangaTable.status,
} as const;

export async function getManga(
  mal_id: number,
  userId: string | undefined,
): Promise<
  Result<FullMangaRecord & { entityStatus: string | null }, ActionError>
> {
  try {
    const selectKeys = {
      titles: mangaTable.titles,
      images: mangaTable.images,
      type: mangaTable.type,
      // rating: mangaTable.rating,
      // season: mangaTable.season,
      // year: mangaTable.year,
      // aired: mangaTable.aired,
      // episodes: mangaTable.episodes,
      chapters: mangaTable.chapters,
      volumes: mangaTable.volumes,
      score: mangaTable.score,
      scored_by: mangaTable.scored_by,
      rank: mangaTable.rank,
      genres: mangaTable.genres,
      mal_id: mangaTable.mal_id,
      status: mangaTable.status,
      popularity: mangaTable.popularity,
      members: mangaTable.members,
      synopsis: mangaTable.synopsis,
      demographics: mangaTable.demographics,
      // studios: mangaTable.studios,
      // broadcast: mangaTable.broadcast,
      // characters: mangaTable.characters,
      // staff: mangaTable.staff,
      // episodes_info: mangaTable.episodes_info,
      // streaming: mangaTable.streaming,
      embedding: mangaTable.embedding,
    } as const;
    if (userId) {
      const [manga] = await db
        .select({
          ...selectKeys,
          entityStatus: trackedEntityTable.entityStatus,
        })
        .from(mangaTable)
        .where(eq(mangaTable.mal_id, mal_id))
        .leftJoin(
          trackedEntityTable,
          and(
            eq(mangaTable.mal_id, trackedEntityTable.mal_id),
            eq(trackedEntityTable.userId, userId),
          ),
        );
      if (manga) {
        return ok({ ...manga, score: mapScore(manga.score) });
      }
      return err(
        new ActionError({
          code: "NOT_FOUND",
          message: "Could not get manga",
        }),
      );
    }
    const [manga] = await db
      .select(selectKeys)
      .from(mangaTable)
      .where(eq(mangaTable.mal_id, mal_id));
    if (manga) {
      return ok({ ...manga, entityStatus: null, score: mapScore(manga.score) });
    }
    return err(
      new ActionError({
        code: "NOT_FOUND",
        message: "Could not get manga",
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

export async function getMangas(
  searchParams: URLSearchParams,
  recordsPerPage: number,
): Promise<Result<{ data: MangaCardItem[]; count: number }, ActionError>> {
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    mangaFilters,
  );
  let { similarity, where, orderBy, offset } =
    await mangaSearchParamsToDrizzleQuery(
      sanitizedSearchParams,
      recordsPerPage,
      mangaTable,
      getEmbedding,
    );
  try {
    const queryCount = db
      .select({ count: count() })
      .from(mangaTable)
      .where(where);
    const query = db
      .select(similarity ? { ...mangaCardKeys, similarity } : mangaCardKeys)
      .from(mangaTable)
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

export async function getMangasWithStatus(
  status: string,
  searchParams: URLSearchParams,
  recordsPerPage: number,
  userId: string,
): Promise<Result<{ data: MangaCardItem[]; count: number }, ActionError>> {
  const cleanedSearchParams = sanitizeSearchParams(searchParams, mangaFilters);
  let { similarity, where, orderBy, offset } =
    await mangaSearchParamsToDrizzleQuery(
      cleanedSearchParams,
      recordsPerPage,
      mangaTable,
      getEmbedding,
    );
  where = where
    ? and(where, eq(trackedEntityTable.entityStatus, status))
    : eq(trackedEntityTable.entityStatus, status);
  where = and(where, eq(trackedEntityTable.userId, userId));

  try {
    const queryCount = db
      .select({ count: count() })
      .from(mangaTable)
      .where(where)
      .leftJoin(
        trackedEntityTable,
        eq(mangaTable.mal_id, trackedEntityTable.mal_id),
      );
    const query = db
      .select(similarity ? { ...mangaCardKeys, similarity } : mangaCardKeys)
      .from(mangaTable)
      .where(where)
      .offset(offset)
      .limit(recordsPerPage)
      .orderBy(...(orderBy as any))
      .leftJoin(
        trackedEntityTable,
        eq(mangaTable.mal_id, trackedEntityTable.mal_id),
      );
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

export async function getCarouselMangas(
  searchParams: URLSearchParams,
  recordsPerPage: number,
): Promise<
  Result<
    Pick<FullMangaRecord, "mal_id" | "titles" | "images" | "type">[],
    ActionError
  >
> {
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    mangaFilters,
  );
  sanitizedSearchParams.delete("q");
  let { where, orderBy, offset } = await mangaSearchParamsToDrizzleQuery(
    sanitizedSearchParams,
    recordsPerPage,
    mangaTable,
    getEmbedding,
  );
  try {
    const mangaRecords = await db
      .select({
        mal_id: mangaTable.mal_id,
        titles: mangaTable.titles,
        images: mangaTable.images,
        type: mangaTable.type,
      })
      .from(mangaTable)
      .where(where)
      .offset(offset)
      .orderBy(...(orderBy as any))
      .limit(recordsPerPage);
    return ok(mangaRecords);
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

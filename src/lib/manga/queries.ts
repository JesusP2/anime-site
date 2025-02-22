import { and, count, desc, eq, sql } from "drizzle-orm";
import { mangaTable, trackedEntityTable } from "../db/schemas";
import { mangaSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { db } from "../db/pool";
import { mangaFilters } from "./filters";
import type { EntityStatus, MangaCardItem } from "@/lib/types";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import type { FullMangaRecord } from "../types";
import { ActionError } from "astro:actions";
import { err, ok, type Result } from "../result";
import { mapScore } from "../utils/map-score";
import { getSimilarity } from "../db/queries";
import { getEmbedding } from "../semantic-search";

const mangaCardKeys = {
  titles: mangaTable.titles,
  images: mangaTable.images,
  type: mangaTable.type,
  chapters: mangaTable.chapters,
  volumes: mangaTable.volumes,
  score: sql<number>`${mangaTable.score}`.mapWith((score) => mapScore(score)),
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
  Result<FullMangaRecord & { entityStatus: EntityStatus | null }, ActionError>
> {
  try {
    const selectKeys = {
      titles: mangaTable.titles,
      images: mangaTable.images,
      type: mangaTable.type,
      chapters: mangaTable.chapters,
      volumes: mangaTable.volumes,
      score: sql<number>`${mangaTable.score}`.mapWith((score) =>
        mapScore(score),
      ),
      scored_by: mangaTable.scored_by,
      rank: mangaTable.rank,
      genres: mangaTable.genres,
      mal_id: mangaTable.mal_id,
      status: mangaTable.status,
      popularity: mangaTable.popularity,
      members: mangaTable.members,
      synopsis: mangaTable.synopsis,
      demographics: mangaTable.demographics,
      embedding: mangaTable.embedding,
    } as const;
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
          eq(trackedEntityTable.userId, userId ?? "0"),
        ),
      );
    if (manga) {
      return ok(manga);
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
  let { where, orderBy, offset } =
    await mangaSearchParamsToDrizzleQuery(
      sanitizedSearchParams,
      recordsPerPage,
      mangaTable,
    );
  try {
    const queryCount = db
      .select({ count: count() })
      .from(mangaTable)
      .where(where);
    const similarity = await getSimilarity(
      mangaTable.embedding,
      sanitizedSearchParams.get("q"),
      getEmbedding,
    );
    let query: any;
    if (similarity) {
      const sq = db
        .select({
          mal_id: mangaTable.mal_id,
          similarity: similarity.as("similarity"),
        })
        .from(mangaTable)
        .where(where)
        .offset(offset)
        .orderBy(t => desc(t.similarity))
        .limit(recordsPerPage)
        .as("sq");
      query = db
        .select(mangaCardKeys)
        .from(mangaTable)
        .innerJoin(sq, eq(mangaTable.mal_id, sq.mal_id))
    } else {
      query = db
        .select(mangaCardKeys)
        .from(mangaTable)
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

export async function getMangasWithStatus(
  entityStatus: EntityStatus,
  searchParams: URLSearchParams,
  recordsPerPage: number,
  userId: string,
): Promise<Result<{ data: MangaCardItem[]; count: number }, ActionError>> {
  const sanitizedSearchParams = sanitizeSearchParams(searchParams, mangaFilters);
  let { where, orderBy, offset } =
    await mangaSearchParamsToDrizzleQuery(
      sanitizedSearchParams,
      recordsPerPage,
      mangaTable,
    );
  where = where
    ? and(where, eq(trackedEntityTable.entityStatus, entityStatus))
    : eq(trackedEntityTable.entityStatus, entityStatus);
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
    const similarity = await getSimilarity(
      mangaTable.embedding,
      sanitizedSearchParams.get("q"),
      getEmbedding,
    );
    let query: any;
    if (similarity) {
      const sq = db
        .select({
          mal_id: mangaTable.mal_id,
          similarity: similarity.as("similarity"),
        })
        .from(mangaTable)
        .where(where)
        .offset(offset)
        .orderBy(t => desc(t.similarity))
        .limit(recordsPerPage)
        .as("sq");
      query = db
        .select(mangaCardKeys)
        .from(mangaTable)
        .innerJoin(sq, eq(mangaTable.mal_id, sq.mal_id))
        .leftJoin(
          trackedEntityTable,
          eq(mangaTable.mal_id, trackedEntityTable.mal_id),
        )
    } else {
      query = db
        .select(mangaCardKeys)
        .from(mangaTable)
        .where(where)
        .offset(offset)
        .limit(recordsPerPage)
        .leftJoin(
          trackedEntityTable,
          eq(mangaTable.mal_id, trackedEntityTable.mal_id),
        )
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

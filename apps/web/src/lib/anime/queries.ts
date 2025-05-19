import { and, count, desc, eq, sql } from "drizzle-orm";
import {
  animeTable,
  animeThemeTable,
  songToArtistTable,
  themeArtistTable,
  themeEntryTable,
  themeVideoTable,
  trackedEntityTable,
} from "../db/schemas";
import { animeSearchParamsToDrizzleQuery } from "./searchparams-to-drizzle";
import { getDb } from "../db/pool";
import { animeFilters } from "./filters";
import type { AnimeCardItem, EntityStatus } from "@/lib/types";
import { sanitizeSearchParams } from "../utils/sanitize-searchparams";
import type { FullAnimeRecord } from "../types";
import { ActionError } from "astro:actions";
import { err, ok, type Result } from "../result";
import { mapScore } from "../utils/map-score";
import { getSimilarity } from "../db/queries";
import { getEmbedding } from "../semantic-search";
import { logger } from "../logger";

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

export async function getAnime(mal_id: number) {
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
      themes: animeTable.themes,
      relations: animeTable.relations,
    } as const;
    const db = getDb();
    const [anime] = await db
      .select(selectKeys)
      .from(animeTable)
      .where(eq(animeTable.mal_id, mal_id));
    const animeThemesRaw = await db
      .select({
        themeId: animeThemeTable.id,
        entryId: themeEntryTable.id,
        videoId: themeVideoTable.id,
        title: animeThemeTable.title,
        slug: animeThemeTable.slug,
        type: animeThemeTable.type,
        artist: themeArtistTable.name,
        version: themeEntryTable.version,
        episodes: themeEntryTable.episodes,
        resolution: themeVideoTable.resolution,
        link: themeVideoTable.link,
        source: themeVideoTable.source,
        nc: themeVideoTable.nc,
      })
      .from(animeTable)
      .leftJoin(animeThemeTable, eq(animeTable.id, animeThemeTable.animeId))
      .leftJoin(
        songToArtistTable,
        eq(animeThemeTable.id, songToArtistTable.themeId),
      )
      .leftJoin(
        themeArtistTable,
        eq(songToArtistTable.artistId, themeArtistTable.id),
      )
      .leftJoin(
        themeEntryTable,
        eq(animeThemeTable.id, themeEntryTable.themeId),
      )
      .leftJoin(
        themeVideoTable,
        eq(themeEntryTable.id, themeVideoTable.themeEntryId),
      )
      .where(eq(animeTable.mal_id, mal_id));
    const animeThemesGroupedByThemeId = Object.values(
      Object.groupBy(animeThemesRaw, (t) => t.themeId ?? ""),
    );
    const animeThemes = animeThemesGroupedByThemeId
      .map((t) =>
        Object.values(Object.groupBy(t ?? [], (tt) => tt.entryId ?? "")),
      )
      .map((t) => {
        if (!t[0] || !t[0]?.[0]) return;
        const { themeId, title, slug, type, artist } = t[0][0];
        return {
          id: themeId,
          title,
          slug,
          type,
          artist,
          entries: t.map((tt) => {
            if (!tt?.[0]) return;
            const { version, episodes, entryId } = tt[0];
            return {
              version,
              episodes,
              id: entryId,
              videos: tt?.map((ttt) => {
                if (!ttt) return;
                const { resolution, link, source, nc, videoId } = ttt;
                return {
                  id: videoId,
                  resolution,
                  link,
                  source,
                  nc,
                };
              }),
            };
          }),
        };
      });
    if (anime) {
      return ok({
        ...anime,
        animethemes: animeThemes,
      });
    }
    return err(
      new ActionError({
        code: "NOT_FOUND",
        message: "Could not get anime",
      }),
    );
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      globalThis.waitUntil(logger.error("error getting anime", error));
    }
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
    const db = getDb();
    const queryCount = db
      .select({ count: count() })
      .from(animeTable)
      .where(where);
    const similarityTime = Date.now();

    async function getEmbedding(text: string) {
      await logger.info("getting embedding");
      const response = await globalThis.AI.run("@cf/baai/bge-m3", {
        text: [text],
      });
      logger.info("ai run", {
        text,
        response,
      });
      return [1];
    }
    const similarity = await getSimilarity(
      animeTable.embedding,
      sanitizedSearchParams.get("q"),
      getEmbedding,
    );
    console.log(`similarity took: ${Date.now() - similarityTime}`);
    // globalThis.waitUntil(logger.info(`similarity took: ${Date.now() - similarityTime}`));
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
  } catch (error) {
    if (error instanceof Error) {
      globalThis.waitUntil(logger.error("error getting animes", error));
    }
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
  const sanitizedSearchParams = sanitizeSearchParams(
    searchParams,
    animeFilters,
  );
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
    const db = getDb();
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
        .leftJoin(
          trackedEntityTable,
          eq(animeTable.mal_id, trackedEntityTable.mal_id),
        )
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
  } catch (error) {
    if (error instanceof Error) {
      globalThis.waitUntil(
        logger.error(`error getting anime with status: ${entityStatus}`, error),
      );
    }
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
    const db = getDb();
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
  } catch (error) {
    if (error instanceof Error) {
      globalThis.waitUntil(
        logger.error(`error getting carousel animes`, error),
      );
    }
    return err(
      new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected error",
      }),
    );
  }
}

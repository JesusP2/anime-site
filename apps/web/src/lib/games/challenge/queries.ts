import { getDb } from "@/lib/db/pool";
import { challengeTable, challengeToThemeTable } from "@/lib/db/schemas";
import { logger } from "@/lib/logger";
import { err, ok } from "@/lib/result";
import { ActionError } from "astro:actions";
import {
  and,
  desc,
  eq,
  count,
  like,
  sql,
  SQL,
  type SQLChunk,
} from "drizzle-orm";
import { PgColumn, type AnyPgColumn } from "drizzle-orm/pg-core";

const allowedDifficulties = ["easy", "medium", "hard"];
const allowedVisibilities = ["public", "private"];
const allowedSortColumns = ["title", "difficulty", "createdAt"];
function sanitizeSearchParams(searchParams: URLSearchParams, recordsPerPage: number) {
  const sanitizedSearchParams = new URLSearchParams();
  const q = searchParams.get("q");
  const difficulty = searchParams.get("difficulty");
  const visibility = searchParams.get("visibility");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const page = searchParams.get("page");

  if (typeof q === "string") {
    sanitizedSearchParams.set("q", q);
  }
  if (difficulty && allowedDifficulties.includes(difficulty)) {
    sanitizedSearchParams.set("difficulty", difficulty);
  }
  if (visibility && allowedVisibilities.includes(visibility)) {
    sanitizedSearchParams.set("visibility", visibility);
  }
  if (sort && allowedSortColumns.includes(sort)) {
    sanitizedSearchParams.set("sort", sort);
  }
  if ((order && order === "asc") || order === "desc") {
    sanitizedSearchParams.set("order", order);
  }
  if (page && parseInt(page, 10) > 0) {
    sanitizedSearchParams.set("page", page);
  }
  sanitizedSearchParams.set("recordsPerPage", recordsPerPage.toString());

  return sanitizedSearchParams;
}

function searchParamsToDrizzleQuery(searchParams: URLSearchParams) {
  const recordsPerPage = Number(searchParams.get("recordsPerPage"));
  let where: SQL | undefined = undefined;
  if (searchParams.get("q")) {
    where = and(
      where,
      like(challengeTable.title, (searchParams.get("q") + "%") as string),
    );
  }
  if (searchParams.get("difficulty")) {
    where = and(
      where,
      eq(challengeTable.difficulty, searchParams.get("difficulty") as string),
    );
  }
  if (searchParams.get("visibility")) {
    where = and(
      where,
      eq(challengeTable.public, searchParams.get("visibility") === "public"),
    );
  }

  const nullsLast = (it: AnyPgColumn | SQLChunk) => sql<any>`${it} NULLS LAST`;
  let orderBy: SQL | undefined = undefined;
  if (searchParams.get("sort") && searchParams.get("sort") !== "none") {
    const column =
      challengeTable[searchParams.get("sort") as keyof typeof challengeTable];
    if (column instanceof PgColumn) {
      if (searchParams.get("order") === "desc") {
        orderBy = nullsLast(desc(column));
      } else {
        orderBy = nullsLast(column);
      }
    }
  }
  let offset = 0;
  if (
    searchParams.get("page") &&
    parseInt(searchParams.get("page") as string) > 0
  ) {
    offset =
      (parseInt(searchParams.get("page") as string) - 1) * recordsPerPage;
  }
  return {
    where,
    offset,
    orderBy,
  };
}

export async function getChallenges(
  userId: string,
  searchParams: URLSearchParams,
  recordsPerPage: number,
) {
  const sanitizedSearchParams = sanitizeSearchParams(searchParams, recordsPerPage);
  let { where, orderBy, offset } = searchParamsToDrizzleQuery(
    sanitizedSearchParams,
  );
  where = and(where, eq(challengeTable.creatorId, userId));
  const limit = Number(sanitizedSearchParams.get("recordsPerPage"));
  const db = getDb();
  try {
    const resultQuery = db
      .select({
        id: challengeTable.id,
        title: challengeTable.title,
        description: challengeTable.description,
        difficulty: challengeTable.difficulty,
        public: challengeTable.public,
        createdAt: challengeTable.createdAt,
      })
      .from(challengeTable)
      .where(where)
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy ?? desc(challengeTable.createdAt));
    const queryCount = db
      .select({ count: count() })
      .from(challengeTable)
      .where(where);
    const [records, recordsCount] = await Promise.all([
      resultQuery,
      queryCount,
    ]);
    return ok({
      data: records,
      count: recordsCount[0]?.count ?? 0,
    });
  } catch (error) {
    if (error instanceof Error) {
      globalThis.waitUntil(logger.error("error getting challenges", error));
    }
    return err(
      new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected error",
      }),
    );
  }
}

export async function getChallengeInfo(challengeId: string) {
  const db = getDb();
  const result = await db
    .select({
      challengeTitle: challengeTable.title,
      difficulty: challengeTable.difficulty,
      public: challengeTable.public,
      createdAt: challengeTable.createdAt,
      themeId: challengeToThemeTable.themeId,
    })
    .from(challengeTable)
    .where(eq(challengeTable.id, challengeId))
    .leftJoin(challengeToThemeTable, eq(challengeTable.id, challengeToThemeTable.challengeId));
  const challengeInfo = {
    title: result[0]?.challengeTitle,
    difficulty: result[0]?.difficulty,
    public: result[0]?.public,
    createdAt: result[0]?.createdAt,
    themesLength: result.length,
  };
  return challengeInfo;
}

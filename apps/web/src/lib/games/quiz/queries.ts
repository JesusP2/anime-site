import { getDb } from "@/lib/db/pool";
import { quizTable, quizToThemeTable } from "@/lib/db/schemas";
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
function sanitizeSearchParams(searchParams: URLSearchParams) {
  const sanitizedSearchParams = new URLSearchParams();
  const q = searchParams.get("q");
  const difficulty = searchParams.get("difficulty");
  const visibility = searchParams.get("visibility");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const page = searchParams.get("page");
  const recordsPerPage = searchParams.get("recordsPerPage");

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
  if (recordsPerPage && parseInt(recordsPerPage, 10) > 0) {
    sanitizedSearchParams.set("recordsPerPage", recordsPerPage);
  } else {
    sanitizedSearchParams.set("recordsPerPage", "10");
  }

  return sanitizedSearchParams;
}

function searchParamsToDrizzleQuery(searchParams: URLSearchParams) {
  const recordsPerPage = Number(searchParams.get("recordsPerPage"));
  let where: SQL | undefined = undefined;
  if (searchParams.get("q")) {
    where = and(
      where,
      like(quizTable.title, (searchParams.get("q") + "%") as string),
    );
  }
  if (searchParams.get("difficulty")) {
    where = and(
      where,
      eq(quizTable.difficulty, searchParams.get("difficulty") as string),
    );
  }
  if (searchParams.get("visibility")) {
    where = and(
      where,
      eq(quizTable.public, searchParams.get("visibility") === "public"),
    );
  }

  const nullsLast = (it: AnyPgColumn | SQLChunk) => sql<any>`${it} NULLS LAST`;
  let orderBy: SQL | undefined = undefined;
  if (searchParams.get("sort") && searchParams.get("sort") !== "none") {
    const column =
      quizTable[searchParams.get("sort") as keyof typeof quizTable];
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

export async function getQuizzes(
  userId: string,
  searchParams: URLSearchParams,
) {
  const sanitizedSearchParams = sanitizeSearchParams(searchParams);
  let { where, orderBy, offset } = searchParamsToDrizzleQuery(
    sanitizedSearchParams,
  );
  where = and(where, eq(quizTable.creatorId, userId));
  const limit = Number(sanitizedSearchParams.get("recordsPerPage"));
  const db = getDb();
  try {
    const resultQuery = db
      .select({
        id: quizTable.id,
        title: quizTable.title,
        description: quizTable.description,
        difficulty: quizTable.difficulty,
        public: quizTable.public,
        createdAt: quizTable.createdAt,
      })
      .from(quizTable)
      .where(where)
      .offset(offset)
      .limit(limit)
      .orderBy(orderBy ?? desc(quizTable.createdAt));
    const queryCount = db
      .select({ count: count() })
      .from(quizTable)
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
      globalThis.waitUntil(logger.error("error getting quizzes", error));
    }
    return err(
      new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected error",
      }),
    );
  }
}

export async function getQuizInfo(quizId: string) {
  const db = getDb();
  const result = await db
    .select({
      quizTitle: quizTable.title,
      difficulty: quizTable.difficulty,
      public: quizTable.public,
      createdAt: quizTable.createdAt,
      themeId: quizToThemeTable.themeId,
    })
    .from(quizTable)
    .where(eq(quizTable.id, quizId))
    .leftJoin(quizToThemeTable, eq(quizTable.id, quizToThemeTable.quizId));
  const quizInfo = {
    title: result[0]?.quizTitle,
    difficulty: result[0]?.difficulty,
    public: result[0]?.public,
    createdAt: result[0]?.createdAt,
    themesLength: result.length,
  };
  return quizInfo;
}

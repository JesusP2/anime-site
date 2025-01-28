import { and, SQL, desc, inArray } from "drizzle-orm";
import { animeTable } from "./db/schemas";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { animeFilters } from "./utils/anime/filters";

export function animeSearchParamsToDrizzleQuery(
  searchParams: URLSearchParams,
  recordsPerPage: number,
) {
  let where: SQL | undefined;
  if (searchParams.get("season")) {
    where = createAnimeWhereClause(where, "season", searchParams);
  }
  if (searchParams.get("year")) {
    where = createAnimeWhereClause(where, "year", searchParams);
  }
  if (searchParams.get("status")) {
    where = createAnimeWhereClause(where, "status", searchParams);
  }
  if (searchParams.get("type")) {
    where = createAnimeWhereClause(where, "type", searchParams);
  }

  let allowedRatings = animeFilters.rating.options.map(({ value }) => value);
  if (searchParams.get("sfw") === "false") {
    allowedRatings = allowedRatings.filter((rating) => !rating.startsWith("R"));
    if (!searchParams.get("rating")) {
      where = where
        ? and(where, inArray(animeTable.rating, allowedRatings))
        : inArray(animeTable.rating, allowedRatings);
    }
  }
  if (searchParams.get("rating")) {
    const ratings = searchParams
      .getAll("rating")
      .filter((rating) =>
        allowedRatings.includes(rating as (typeof allowedRatings)[number]),
      );
    where = where
      ? and(where, inArray(animeTable.rating, ratings))
      : inArray(animeTable.rating, ratings);
  }

  let orderBy: SQL | SQLiteColumn | undefined;
  if (searchParams.get("orderBy")) {
    const column =
      animeTable[searchParams.get("orderBy") as keyof typeof animeTable];
    if (column instanceof SQLiteColumn) {
      if (searchParams.get("sort") === "desc") {
        orderBy = desc(column);
      } else {
        orderBy = column;
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
  return { where, orderBy, offset, limit: recordsPerPage };
}

function createAnimeWhereClause<T extends keyof typeof animeTable>(
  where: SQL | undefined,
  columnName: T,
  searchParams: URLSearchParams,
) {
  const column = animeTable[columnName];
  if (column instanceof SQLiteColumn) {
    let filters = searchParams.getAll(columnName);
    if (columnName in animeFilters) {
      const allowedFilters = animeFilters[
        columnName as keyof typeof animeFilters
      ].options.map(({ value }) => value);
      filters = filters.filter((filter) =>
        allowedFilters.includes(filter as any),
      );
    }
    return where
      ? and(where, inArray(column, filters))
      : inArray(column, filters);
  }
  return where;
}

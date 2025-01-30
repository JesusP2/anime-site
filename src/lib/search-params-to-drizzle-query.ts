import { and, SQL, desc, inArray } from "drizzle-orm";
import { animeTable } from "./db/schemas";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { type AnimeFilters } from "@/lib/anime/filters";
import { objectKeys } from "./utils";
import type { MangaFilters } from "./manga/filters";

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
  if (searchParams.get("rating")) {
    where = createAnimeWhereClause(where, "rating", searchParams);
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
    const filters = searchParams.getAll(columnName);
    return where
      ? and(where, inArray(column, filters))
      : inArray(column, filters);
  }
  return where;
}

export function cleanSearchParams<T extends AnimeFilters | MangaFilters>(
  searchParams: URLSearchParams,
  filters: T,
) {
  const keys = objectKeys(filters).filter((key) => key !== "sfw");
  const newSearchParams = new URLSearchParams();
  for (const key of keys) {
    if (typeof key !== "string") continue;
    const allowedValues = filters[key].options.map(({ value }) => value);
    const values = searchParams.getAll(key);
    if (!values.length) continue;
    const filteredValues = values.filter((value) => {
      if (typeof allowedValues[0] === "string") {
        return allowedValues.includes(value);
      }
      if (typeof allowedValues[0] === "number") {
        return allowedValues.includes(Number(value));
      }
      if (typeof allowedValues[0] === "boolean") {
        return allowedValues.includes(value === "true");
      }
    });
    for (const value of filteredValues) {
      newSearchParams.append(key, value);
    }
  }
  const page = searchParams.get("page") as string;
  if (searchParams.get("page") && parseInt(page) > 0) {
    newSearchParams.set("page", page);
  }
  const season = searchParams.get("season") as string;
  if (
    searchParams.get("season") &&
    ["winter", "spring", "summer", "fall"].includes(season)
  ) {
    newSearchParams.set("season", season);
  }
  const year = searchParams.get("year") as string;
  if (searchParams.get("year") && parseInt(year) > 0) {
    newSearchParams.set("year", year);
  }
  let ratings = newSearchParams.getAll("rating");
  if (searchParams.get("sfw") === "false" && ratings.length) {
    ratings = ratings.filter((rating) => !rating.startsWith("R"));
  } else if (searchParams.get("sfw") === "false") {
    ratings = filters.rating.options
      .map(({ value }) => value)
      .filter((rating) => !rating.startsWith("R"));
  }
  if (ratings.length) {
    newSearchParams.delete("rating");
    for (const rating of ratings) {
      newSearchParams.append("rating", rating);
    }
  } else {
    newSearchParams.delete("rating");
  }
  return newSearchParams;
}

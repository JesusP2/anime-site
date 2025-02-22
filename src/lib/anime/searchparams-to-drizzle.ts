import {
  cosineDistance,
  desc,
  sql,
  type SQL,
  type SQLChunk,
} from "drizzle-orm";
import { createWhereClause } from "../utils/where-clause";
import { PgColumn, type AnyPgColumn } from "drizzle-orm/pg-core";
import type { animeTable } from "../db/schemas";
import type { pgliteAnimeTable } from "../pglite";

export async function animeSearchParamsToDrizzleQuery(
  searchParams: URLSearchParams,
  recordsPerPage: number,
  table: typeof animeTable | typeof pgliteAnimeTable,
) {
  let where: SQL | undefined;
  if (searchParams.get("season")) {
    where = createWhereClause(where, table, "season", searchParams);
  }
  if (searchParams.get("year")) {
    where = createWhereClause(where, table, "year", searchParams);
  }
  if (searchParams.get("status")) {
    where = createWhereClause(where, table, "status", searchParams);
  }
  if (searchParams.get("type")) {
    where = createWhereClause(where, table, "type", searchParams);
  }
  if (searchParams.get("rating") || searchParams.get("ratings_filtered")) {
    where = createWhereClause(where, table, "rating", searchParams);
  }
  // if (searchParams.get("genre")) {
  //   let genreWhere: SQL | undefined = undefined;
  //   for (const genre of searchParams.getAll("genre")) {
  //     if (genreWhere) {
  //       genreWhere = or(
  //         genreWhere,
  //         like(table.genres, `%"name":"${genre}"%%`),
  //       );
  //     } else {
  //       genreWhere = like(table.genres, `%"name":"${genre}"%`);
  //     }
  //   }
  //   if (where) {
  //     where = and(where, genreWhere);
  //   } else {
  //     where = genreWhere;
  //   }
  // }

  const nullsLast = (it: AnyPgColumn | SQLChunk) => sql<any>`${it} NULLS LAST`;
  let orderBy: SQL | undefined = undefined;
  if (searchParams.get("orderBy") && searchParams.get("orderBy") !== "none") {
    const column = table[searchParams.get("orderBy") as keyof typeof table];
    if (column instanceof PgColumn) {
      if (searchParams.get("sort") === "desc") {
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
  return { where, orderBy, offset };
}

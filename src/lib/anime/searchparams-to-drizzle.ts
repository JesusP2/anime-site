import {
  and,
  cosineDistance,
  desc,
  like,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { createWhereClause } from "../utils/where-clause";
import { PgColumn } from "drizzle-orm/pg-core";
import type { animeTable } from "../db/schemas";
import type { pgliteAnimeTable } from "../pglite";

export async function animeSearchParamsToDrizzleQuery(
  searchParams: URLSearchParams,
  recordsPerPage: number,
  table: typeof animeTable | typeof pgliteAnimeTable,
  getEmbedding: (q: string) => Promise<number[] | undefined>,
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
  if (searchParams.get("genre")) {
    let genreWhere: SQL | undefined = undefined;
    for (const genre of searchParams.getAll("genre")) {
      if (genreWhere) {
        genreWhere = or(
          genreWhere,
          like(table.genres, `%"name":"${genre}"%%`),
        );
      } else {
        genreWhere = like(table.genres, `%"name":"${genre}"%`);
      }
    }
    if (where) {
      where = and(where, genreWhere);
    } else {
      where = genreWhere;
    }
  }

  const q = searchParams.get("q");
  const orderBy: (SQL | PgColumn | ((t: { similarity: any }) => SQL))[] = [];
  let similarity: SQL<number> | undefined;
  if (typeof q === "string" && q !== "") {
    const embedding = await getEmbedding(q);
    if (embedding) {
      similarity = sql<number>`1 - (${cosineDistance(table.embedding, embedding)})`;
      orderBy.push(t => desc(t.similarity));
    }
  }

  if (searchParams.get("orderBy") && searchParams.get("orderBy") !== "none") {
    const column =
      table[searchParams.get("orderBy") as keyof typeof table];
    if (column instanceof PgColumn) {
      if (searchParams.get("sort") === "desc") {
        orderBy.push(desc(column));
      } else {
        orderBy.push(column);
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
  return { similarity, where, orderBy, offset };
}

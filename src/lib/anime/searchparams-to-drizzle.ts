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
import { animeTable } from "../db/schemas";
import { PgColumn } from "drizzle-orm/pg-core";
import { getEmbedding } from "../semantic-search";

export async function animeSearchParamsToDrizzleQuery(
  searchParams: URLSearchParams,
  recordsPerPage: number,
) {
  let where: SQL | undefined;
  if (searchParams.get("season")) {
    where = createWhereClause(where, animeTable, "season", searchParams);
  }
  if (searchParams.get("year")) {
    where = createWhereClause(where, animeTable, "year", searchParams);
  }
  if (searchParams.get("status")) {
    where = createWhereClause(where, animeTable, "status", searchParams);
  }
  if (searchParams.get("type")) {
    where = createWhereClause(where, animeTable, "type", searchParams);
  }
  if (searchParams.get("rating") || searchParams.get("ratings_filtered")) {
    where = createWhereClause(where, animeTable, "rating", searchParams);
  }
  if (searchParams.get("genre")) {
    let genreWhere: SQL | undefined = undefined;
    for (const genre of searchParams.getAll("genre")) {
      if (genreWhere) {
        genreWhere = or(
          genreWhere,
          like(animeTable.genres, `%"name":"${genre}"%%`),
        );
      } else {
        genreWhere = like(animeTable.genres, `%"name":"${genre}"%`);
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
      similarity = sql<number>`1 - (${cosineDistance(animeTable.embedding, embedding)})`;
      orderBy.push((t) => desc(t.similarity));
    }
  }

  if (searchParams.get("orderBy") && searchParams.get("orderBy") !== "none") {
    const column =
      animeTable[searchParams.get("orderBy") as keyof typeof animeTable];
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

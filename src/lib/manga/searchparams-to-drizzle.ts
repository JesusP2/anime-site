import { and, desc, gt, SQL, sql, type SQLChunk } from "drizzle-orm";
import { createWhereClause } from "../utils/where-clause";
import { PgColumn, type AnyPgColumn } from "drizzle-orm/pg-core";
import type { mangaTable } from "../db/schemas";
import type { pgliteMangaTable } from "../pglite";

export async function mangaSearchParamsToDrizzleQuery(
  searchParams: URLSearchParams,
  recordsPerPage: number,
  table: typeof mangaTable | typeof pgliteMangaTable,
) {
  let where: SQL | undefined = gt(table.rank, 0);
  if (searchParams.get("status")) {
    where = createWhereClause(where, table, "status", searchParams);
  }
  if (searchParams.get("type")) {
    where = createWhereClause(where, table, "type", searchParams);
  }
  if (searchParams.get("genre")) {
    let str = "$[*].name ? (";
    const chunks: string[] = [];
    for (const genre of searchParams.getAll("genre")) {
      chunks.push(`@ == "${genre}"`);
    }
    const joined = chunks.join(" || ");
    str += joined + ")";
    const query = sql`jsonb_path_exists(${table.genres}, ${str})`;
    where = where ? and(where, query) : query;
  }

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

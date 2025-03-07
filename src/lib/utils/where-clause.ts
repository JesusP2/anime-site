import { and, inArray, type SQL } from "drizzle-orm";
import type { animeTable, mangaTable } from "../db/schemas";
import type { pgliteAnimeTable, pgliteMangaTable } from "../pglite";
import { PgColumn } from "drizzle-orm/pg-core";

export function createWhereClause<
  T extends typeof animeTable | typeof mangaTable | typeof pgliteAnimeTable | typeof pgliteMangaTable,
>(
  where: SQL | undefined,
  table: T,
  columnName: keyof T,
  searchParams: URLSearchParams,
) {
  if (
    columnName in table &&
    table[columnName] instanceof PgColumn &&
    typeof columnName === "string"
  ) {
    const column = table[columnName];
    if (column instanceof PgColumn) {
      const filters = searchParams.getAll(columnName);
      return where
        ? and(where, inArray(column, filters))
        : inArray(column, filters);
    }
    return where;
  }
  return where;
}

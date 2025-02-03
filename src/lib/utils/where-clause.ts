import { and, inArray, type SQL } from "drizzle-orm";
import type { animeTable, mangaTable } from "../db/schemas";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

export function createWhereClause<
  T extends typeof animeTable | typeof mangaTable,
>(
  where: SQL | undefined,
  table: T,
  columnName: keyof T,
  searchParams: URLSearchParams,
) {
  if (
    columnName in table &&
    table[columnName] instanceof SQLiteColumn &&
    typeof columnName === "string"
  ) {
    const column = table[columnName];
    if (column instanceof SQLiteColumn) {
      const filters = searchParams.getAll(columnName);
      return where
        ? and(where, inArray(column, filters))
        : inArray(column, filters);
    }
    return where;
  }
  return where;
}

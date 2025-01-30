import { desc, type SQL } from "drizzle-orm";
import { createWhereClause } from "../utils/where-clause";
import { animeTable } from "../db/schemas";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

export function animeSearchParamsToDrizzleQuery(
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
  if (searchParams.get("rating")) {
    where = createWhereClause(where, animeTable, "rating", searchParams);
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

import { type AnimeCardItem, type EntityStatus } from "@/lib/types";
import type { User } from "better-auth";
import { useEffect, useState } from "react";
import { Pagination } from "./pagination";
import type { Result } from "@/lib/result";
import { type ActionError } from "astro:actions";
import {
  getCurrentPage,
  getRecordsPerPage,
} from "@/lib/utils/records-per-page";
import { Grid } from "./grid";
import { getAnimesFromLocalDB } from "@/lib/anime/pglite-queries";

export function AnimesWithStatusPage({
  url,
  records,
  entityStatus,
  user,
}: {
  url: string;
  records: Result<
    { data: (AnimeCardItem & { entityStatus?: string })[]; count: number },
    ActionError
  >;
  entityStatus: EntityStatus;
  user: User | null;
}) {
  const _url = new URL(url);
  const [_records, _setRecords] = useState(records);
  const currentPage = getCurrentPage(_url.searchParams);
  const recordsPerPage = getRecordsPerPage(_url.searchParams);

  useEffect(() => {
    if (user) return;
    getAnimesFromLocalDB(entityStatus, _url.searchParams).then(
      (recordsWithStatus) => {
        if (!recordsWithStatus.success) {
          _setRecords({ success: true, value: { data: [], count: 0 } });
          return;
        }
        const { data, count } = recordsWithStatus.value;
        _setRecords({ success: true, value: { data, count } });
      },
    );
  }, []);

  return (
    <Grid
      records={_records}
      currentPage={currentPage}
      recordsPerPage={recordsPerPage}
      url={_url.toString()}
    />
  );
}

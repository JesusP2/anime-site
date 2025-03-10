import { type AnimeCardItem, type EntityStatus } from "@/lib/types";
import type { User } from "better-auth";
import { useEffect, useState } from "react";
import { Pagination } from "./pagination";
import { SearchWithFilters } from "./search";
import type { Result } from "@/lib/result";
import { type ActionError } from "astro:actions";
import {
  getCurrentPage,
  getRecordsPerPage,
} from "@/lib/utils/records-per-page";
import { Grid } from "./grid";
import { getAnimesFromLocalDB } from "@/lib/anime/pglite-queries";
import { navigate } from "astro:transitions/client";
import { safeStartViewTransition } from "@/lib/safe-start-view-transition";
import { LoadingCardGrid } from "./loading-card-grid";

export function AnimesWithStatusPage({
  url,
  records,
  entityStatus,
  user,
  title,
}: {
  url: string;
  records: Result<
    { data: (AnimeCardItem & { entityStatus?: string })[]; count: number },
    ActionError
  >;
  entityStatus: EntityStatus;
  user: User | null;
  title: string;
}) {
  const _url = new URL(url);
  const [_records, _setRecords] = useState(records);
  const currentPage = getCurrentPage(_url.searchParams);
  const recordsPerPage = getRecordsPerPage(_url.searchParams);
  const [isLoading, setIsLoading] = useState(user ? false : true);

  useEffect(() => {
    if (user) return;
    setIsLoading(true);
    getAnimesFromLocalDB(entityStatus, _url.searchParams).then(
      (recordsWithStatus) => {
        if (!recordsWithStatus.success) {
          _setRecords({ success: true, value: { data: [], count: 0 } });
          return;
        }
        const { data, count } = recordsWithStatus.value;
        _setRecords({ success: true, value: { data, count } });
      },
    ).finally(() => setIsLoading(false));
  }, []);

  function onSearch(searchParams: URLSearchParams) {
    searchParams.set("page", "1");
    if (user) {
      safeStartViewTransition(() => navigate(`/anime/${entityStatus}?${searchParams.toString()}`));
    } else {
      getAnimesFromLocalDB(entityStatus, searchParams).then(
        (recordsWithStatus) => {
          if (!recordsWithStatus.success) {
            _setRecords({ success: true, value: { data: [], count: 0 } });
            return;
          }
          const { data, count } = recordsWithStatus.value;
          _setRecords({ success: true, value: { data, count } });
        },
      ).finally(() => {
        setIsLoading(false);
      });
    }
  }

  return (
    <>
      <SearchWithFilters
        url={url}
        onSearch={onSearch}
        entity="Anime"
        title={title}
      />
      {isLoading ? <LoadingCardGrid /> : <Grid records={_records} />}
      <div className="flex-1" />
      <div className="flex justify-center my-6">
        <Pagination
          url={_url}
          lastVisiblePage={Math.ceil(
            (_records.success ? _records.value.count : 1) / recordsPerPage,
          )}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}

import { type AnimeCardItem } from "@/components/anime-card";
import type { User } from "better-auth";
import { useEffect, useState } from "react";
import { Pagination } from "./pagination";
import { SearchWithFilters } from "./search";
import { animeFilters } from "@/lib/anime/filters";
import type { Result } from "@/lib/result";
import { type ActionError } from "astro:actions";
import { navigate } from "astro/virtual-modules/transitions-router.js";
import { getCurrentPage, getRecordsPerPage } from "@/lib/utils/records-per-page";
import { Grid } from "./grid";
import { getAnimesFromLocalDB } from "@/lib/anime/pglite-queries";

export function AnimesWithStatusPage({
  url,
  records,
  entityStatus,
  user,
  title,
}: {
  url: URL;
  records: Result<{ data: (AnimeCardItem & { entityStatus?: string; })[]; count: number; }, ActionError>;
  entityStatus: string;
  user: User | null;
  title: string;
}) {
  const [_records, _setRecords] = useState(records);
  const currentPage = getCurrentPage(url.searchParams);
  const recordsPerPage = getRecordsPerPage(url.searchParams);
  useEffect(() => {
    if (user) return;
    getAnimesFromLocalDB(entityStatus, url.searchParams).then((recordsWithStatus) => {
      if (!recordsWithStatus.success) {
        _setRecords({ success: true, value: { data: [], count: 0 } });
        return;
      };
      const { data, count } = recordsWithStatus.value;
      _setRecords({ success: true, value: { data, count } });
    })
  }, []);

  function onSearch(searchParams: URLSearchParams) {
    searchParams.set('page', '1');
    if (user) {
      navigate(`/animes/${entityStatus}?${searchParams.toString()}`);
    } else {
      getAnimesFromLocalDB(entityStatus, searchParams).then((recordsWithStatus) => {
        if (!recordsWithStatus.success) {
          _setRecords({ success: true, value: { data: [], count: 0 } });
          return;
        };
        const { data, count } = recordsWithStatus.value;
        _setRecords({ success: true, value: { data, count } });
      })
    }
  }

  return (
    <>
      <SearchWithFilters
        url={url}
        onSearch={onSearch}
        options={animeFilters}
        title={title}
      />
      <Grid records={_records} />
      <div className="flex-1" />
      <div className="flex justify-center my-6">
        <Pagination
          url={url}
          lastVisiblePage={Math.ceil(
            (_records.success ? _records.value.count : 1) / recordsPerPage,
          )}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}

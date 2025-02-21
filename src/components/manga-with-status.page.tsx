import { type EntityStatus, type MangaCardItem } from "@/lib/types";
import type { User } from "better-auth";
import { useEffect, useState } from "react";
import { Pagination } from "./pagination";
import { SearchWithFilters } from "./search";
import { mangaFilters } from "@/lib/manga/filters";
import type { Result } from "@/lib/result";
import { type ActionError } from "astro:actions";
import { getCurrentPage, getRecordsPerPage } from "@/lib/utils/records-per-page";
import { Grid } from "./grid";
import { getMangasFromLocalDB } from "@/lib/manga/pglite-queries";
import { navigate } from "astro:transitions/client";

export function MangasWithStatusPage({
  url,
  records,
  entityStatus,
  user,
  title,
}: {
  url: URL;
  records: Result<{ data: (MangaCardItem & { entityStatus?: string; })[]; count: number; }, ActionError>;
  entityStatus: EntityStatus;
  user: User | null;
  title: string;
}) {
  const [_records, _setRecords] = useState(records);
  const currentPage = getCurrentPage(url.searchParams);
  const recordsPerPage = getRecordsPerPage(url.searchParams);
  useEffect(() => {
    if (user) return;
    getMangasFromLocalDB(entityStatus, url.searchParams).then((recordsWithStatus) => {
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
      navigate(`/manga/${entityStatus}?${searchParams.toString()}`);
    } else {
      getMangasFromLocalDB(entityStatus, searchParams).then((recordsWithStatus) => {
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
        options={mangaFilters}
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

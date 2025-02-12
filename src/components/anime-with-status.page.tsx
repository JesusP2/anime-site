import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import { TrackedAnimeRecordsKey } from "@/lib/constants";
import type { User } from "better-auth";
import { useEffect, useState } from "react";
import { Pagination } from "./pagination";
import { SearchWithFilters } from "./search";
import { animeFilters } from "@/lib/anime/filters";
import type { Result } from "@/lib/result";
import type { ActionError } from "astro:actions";
import { navigate } from "astro/virtual-modules/transitions-router.js";
import { getCurrentPage, getRecordsPerPage } from "@/lib/utils/records-per-page";
import { Grid } from "./grid";

function applyFilters(records: AnimeCardItem[], searchParams: URLSearchParams) {
  const entries = searchParams.entries();
  let filteredRecords = records;
  for (let [key] of entries) {
    const filters = searchParams.getAll(key);
    if (!filters.length) continue;
    filteredRecords = filteredRecords.filter((record) => {
      if (key === "status") {
        return record.status && filters.includes(record.status);
      }
      if (key === "type") {
        return record.type && filters.includes(record.type);
      }
      if (key === "genre") {
        return record.genres?.some((genre) =>
          genre.name && filters.includes(genre.name),
        );
      }
      return true;
    });
  }
  // lista vacia y sfw activo => no filtro
  // lista vacia y sfw desactivado => filtrar sfw
  // lista no vacia y swf activo => filtrar lista
  // lista no vacia y sfw desactivado => filtrar filtros y lista
  const sfw = searchParams.get("sfw") ? searchParams.get("sfw") === "true" : true;
  let ratings = searchParams.getAll("rating")
  let allowedRatings = animeFilters.rating.options.map((rating) => rating.value);
  if (!ratings.length && !sfw) {
    ratings = allowedRatings.filter((rating) => !rating.startsWith('R'));
    filteredRecords = filteredRecords.filter((record) => {
      return record.rating && ratings.includes(record.rating);
    });
  } else if (ratings.length && sfw) {
    filteredRecords = filteredRecords.filter((record) => {
      return record.rating && ratings.includes(record.rating);
    });
  } else if (ratings.length && !sfw) {
    ratings = ratings.filter((rating) => !rating.startsWith('R'));
    filteredRecords = filteredRecords.filter((record) => {
      return record.rating && ratings.includes(record.rating);
    });
  }
  const orderBy = searchParams.get("orderBy");
  const sort = searchParams.get("sort");
  filteredRecords = filteredRecords.sort((a, b) => {
    const aValue = a[orderBy as keyof AnimeCardItem] as number | string | null | undefined;
    const bValue = b[orderBy as keyof AnimeCardItem] as number | string | null | undefined;
    if (aValue === bValue || aValue === null || bValue === null || aValue === undefined || bValue === undefined) {
      return 0;
    }
    if (sort === "asc") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue > bValue ? -1 : 1;
  })

  const currentPage = getCurrentPage(searchParams);
  const recordsPerPage = getRecordsPerPage(searchParams);
  const offset = (currentPage - 1) * recordsPerPage;
  return {
    data: filteredRecords.slice(offset, offset + recordsPerPage),
    count: filteredRecords.length,
  }
}

export function AnimesWithStatusPage({
  url,
  records,
  entityStatus,
  user,
  title,
}: {
  url: URL;
  records: Result<{ data: AnimeCardItem[]; count: number; }, ActionError>;
  entityStatus: string;
  user: User | null;
  title: string;
}) {
  const [_records, _setRecords] = useState(records);
  const currentPage = getCurrentPage(url.searchParams);
  const recordsPerPage = getRecordsPerPage(url.searchParams);
  useEffect(() => {
    if (user) return;
    const value = JSON.parse(
      localStorage.getItem(TrackedAnimeRecordsKey) || "[]",
    ) as AnimeCardItem[];
    const recordsWithStatus = value.filter(
      (item) => item.entityStatus === entityStatus,
    );

    const { data, count } = applyFilters(recordsWithStatus, url.searchParams);
    _setRecords({ success: true, value: { data, count } });
  }, []);

  function onSearch(searchParams: URLSearchParams) {
    searchParams.set('page', '1');
    navigate(`/animes/${entityStatus}?${searchParams.toString()}`);
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

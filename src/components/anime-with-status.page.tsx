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
      if (key === "rating") {
        return record.rating && filters.includes(record.rating);
      }
      if (key === "genre") {
        return record.genres?.some((genre) =>
          genre.name && filters.includes(genre.name),
        );
      }
      return true;
    });
  }
  return filteredRecords;
}

export function AnimesWithStatusPage({
  url,
  records,
  count,
  entityStatus,
  user,
  currentPage,
  recordsPerPage,
}: {
  url: URL;
  records: Result<AnimeCardItem[], ActionError>;
  count: Result<number, ActionError>;
  entityStatus: string;
  user: User | null;
  currentPage: number;
  recordsPerPage: number;
}) {
  const [_records, _setRecords] = useState(records.success ? records.value : []);
  useEffect(() => {
    if (user) return;
    const value = JSON.parse(
      localStorage.getItem(TrackedAnimeRecordsKey) || "[]",
    ) as AnimeCardItem[];
    const recordsWithStatus = value.filter(
      (item) => item.entityStatus === entityStatus,
    );

    _setRecords(applyFilters(recordsWithStatus, url.searchParams));
  }, []);

  function onSearch(searchParams: URLSearchParams) {
    navigate(`/animes/${entityStatus}?${searchParams.toString()}`);
  }

  if (!_records.length) {
    return <EmptyItems />;
  }
  return (
    <>
      <SearchWithFilters
        url={url}
        onSearch={onSearch}
        options={animeFilters}
        title="Animes completed"
      />
      <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
        {_records.map((item) => (
          <AnimeCard key={item.mal_id} data={item} />
        ))}
      </div>
      <div className="flex justify-center my-6">
        <Pagination
          url={url}
          lastVisiblePage={Math.ceil(
            (count.success ? count.value : 1) / recordsPerPage,
          )}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}

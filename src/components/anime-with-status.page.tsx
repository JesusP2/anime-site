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
    _setRecords(value.filter((item) => item.entityStatus === entityStatus));
  }, []);

  function applyFilters(records: AnimeCardItem[], searchParams: URLSearchParams) {
    searchParams.entries().forEach(([key, value]) => {
      console.log(key, value);
    });
  }

  function onSearch(searchParams: URLSearchParams) {
    if (!user) {
      navigate(`/animes/${entityStatus}?${searchParams.toString()}`);
      return;
    }
    const value = JSON.parse(
      localStorage.getItem(TrackedAnimeRecordsKey) || "[]",
    ) as AnimeCardItem[];
    applyFilters(value, searchParams);
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

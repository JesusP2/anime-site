import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { Pagination } from "@/components/pagination";
import { SearchWithFilters } from "@/components/search";
import { animeFilters } from "@/lib/anime/filters";
import type { Result } from "@/lib/result";
import type { ActionError } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { Grid } from "./grid";

export function SearchAnimePage({
  url,
  records,
  currentPage,
  recordsPerPage,
}: {
  url: URL;
  records: Result<{ data: AnimeCardItem[]; count: number; }, ActionError>;
  currentPage: number;
  recordsPerPage: number;
}) {
  return (
    <>
      <SearchWithFilters
        url={url}
        onSearch={(searchParams) => navigate(searchParams.toString() ? `/anime/search?${searchParams.toString()}` : '/anime/search')}
        options={animeFilters}
        title="Anime search"
      />
      <Grid records={records} />
      <div className="flex-1" />
      <div className="flex justify-center my-6">
        <Pagination
          url={url}
          lastVisiblePage={Math.ceil(
            (records.success ? records.value.count : 1) / recordsPerPage,
          )}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}

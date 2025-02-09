import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import { Pagination } from "@/components/pagination";
import { SearchWithFilters } from "@/components/search";
import { UnexpectedError } from "@/components/unexpected-error";
import { animeFilters } from "@/lib/anime/filters";
import type { Result } from "@/lib/result";
import type { ActionError } from "astro:actions";
import { navigate } from "astro:transitions/client";

export function SeasonNowPage({
  url,
  records,
  count,
  currentPage,
  recordsPerPage,
}: {
  url: URL;
  records: Result<AnimeCardItem[], ActionError>;
  count: Result<number, ActionError>;
  currentPage: number;
  recordsPerPage: number;
}) {
  if (!records.success) {
    return <UnexpectedError />;
  }
  return (
    <>
      <SearchWithFilters
        url={url}
        onSearch={(searchParams) => navigate(searchParams.toString() ? `/seasons/now?${searchParams.toString()}` : '/seasons/now')}
        options={animeFilters}
        title="Animes this season"
      />
      {records.value.length ? (
        <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
          {records.value.map((item) => (
            <AnimeCard key={item.mal_id} data={item} />
          ))}</div>) : <EmptyItems />}
      <div className="flex-1" />
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

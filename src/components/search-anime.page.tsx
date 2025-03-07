import { type AnimeCardItem, type MangaCardItem } from "@/lib/types";
import { Pagination } from "@/components/pagination";
import { SearchWithFilters } from "@/components/search";
import type { Result } from "@/lib/result";
import type { ActionError } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { Grid } from "./grid";
import { safeStartViewTransition } from "@/lib/safe-start-view-transition";

export function SearchAnimePage({
  url,
  searchType,
  records,
  currentPage,
  recordsPerPage,
}: {
  url: string;
  searchType?: "Anime" | "Manga";
  records: Result<
    { data: AnimeCardItem[] | MangaCardItem[]; count: number },
    ActionError
  >;
  currentPage: number;
  recordsPerPage: number;
}) {
  return (
    <>
      <SearchWithFilters
        url={url}
        onSearch={async (searchParams) => {
          const path = searchParams.toString()
            ? `/search?${searchParams.toString()}`
            : "/search";
          safeStartViewTransition(() => navigate(path));
        }}
        entity={searchType ? searchType : "Anime"}
        title="Search"
      />
      <Grid records={records} />
      <div className="flex-1" />
      <div className="flex justify-center my-6">
        <Pagination
          url={new URL(url)}
          lastVisiblePage={Math.ceil(
            (records.success ? records.value.count : 1) / recordsPerPage,
          )}
          currentPage={currentPage}
        />
      </div>
    </>
  );
}

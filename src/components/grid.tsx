import { UnexpectedError } from "@/components/unexpected-error";
import { EmptyItems } from "@/components/empty-items";
import type { ActionError } from "astro:actions";
import type { Result } from "@/lib/result";
import { AnimeCard } from "@/components/anime-card";
import type { AnimeCardItem, MangaCardItem } from "@/lib/types";
import { MangaCard } from "./manga-card";
import { Pagination } from "@/components/pagination";
import { gridClassName } from "@/lib/constants";

export function Grid({
  records,
  url,
  recordsPerPage,
  currentPage,
}: {
  records: Result<
    { data: AnimeCardItem[] | MangaCardItem[]; count: number },
    ActionError
  >;
  url: string;
  recordsPerPage: number;
  currentPage: number;
}) {
  if (!records.success) {
    return <UnexpectedError />;
  } else if (records.value.data.length === 0) {
    return <EmptyItems />;
  }
  return (
    <>
      <div className={gridClassName}>
        {records.value.data.map((item, idx) =>
          "rating" in item ? (
            <AnimeCard idx={idx} key={item.mal_id} data={item} />
          ) : "chapters" in item ? (
            <MangaCard idx={idx} data={item} key={item.mal_id} />
          ) : null,
        )}
      </div>
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

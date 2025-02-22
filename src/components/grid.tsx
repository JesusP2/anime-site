import { UnexpectedError } from "@/components/unexpected-error";
import { EmptyItems } from "@/components/empty-items";
import type { ActionError } from "astro:actions";
import type { Result } from "@/lib/result";
import { AnimeCard } from "@/components/anime-card";
import type { AnimeCardItem, MangaCardItem } from "@/lib/types";
import { MangaCard } from "./manga-card";

export function Grid({ records }: { records: Result<{ data: AnimeCardItem[] | MangaCardItem[]; count: number; }, ActionError> }) {
  if (!records.success) {
    return <UnexpectedError />;
  } else if (records.value.data.length === 0) {
    return <EmptyItems />;
  }
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {records.value.data.map((item) => (
        'rating' in item ? <AnimeCard key={item.mal_id} data={item} />
          : 'chapters' in item ? <MangaCard key={item.mal_id} data={item} />
            : null
      ))}</div>
  );
}

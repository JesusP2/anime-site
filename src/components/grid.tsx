import { UnexpectedError } from "@/components/unexpected-error";
import { EmptyItems } from "@/components/empty-items";
import type { ActionError } from "astro:actions";
import type { Result } from "@/lib/result";
import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";

export function Grid<T extends AnimeCardItem>({ records }: { records: Result<{ data: T[]; count: number; }, ActionError> }) {
  if (!records.success) {
    return <UnexpectedError />;
  } else if (records.value.data.length === 0) {
    return <EmptyItems />;
  }
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {records.value.data.map((item) => (
        <AnimeCard key={item.mal_id} data={item} />
      ))}</div>
  );
}


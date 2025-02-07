import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import type { User } from "better-auth";

export function LocalSeasonGrid({
  records,
}: {
  records: AnimeCardItem[];
  user: User | null;
}) {
  if (!records.length) {
    return <EmptyItems />;
  }
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {
        records.map((item) => (
          <AnimeCard key={item.mal_id} data={item} />
        ))}
    </div>
  );
}

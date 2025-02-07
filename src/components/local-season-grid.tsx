import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";

export function LocalSeasonGrid({ records }: { records: AnimeCardItem[] }) {
  if (!records.length) {
    return <EmptyItems />;
  }
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {records.map((item) => (
        <AnimeCard key={item.mal_id} data={item} />
      ))}
    </div>
  );
}

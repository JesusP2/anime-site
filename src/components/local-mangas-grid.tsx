import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import { TrackedMangaRecordsKey } from "@/lib/constants";
import type { User } from "better-auth";
import { useEffect, useState } from "react";

// TODO: remove anime references
export function LocalMangasGrid({
  records,
  entityStatus,
  user,
}: {
  records: AnimeCardItem[];
  entityStatus: string;
  user: User | null;
}) {
  const [_records, _setRecords] = useState(records);
  useEffect(() => {
    if (user) return;
    const value = JSON.parse(
      localStorage.getItem(TrackedMangaRecordsKey) || "[]",
    ) as AnimeCardItem[];
    _setRecords(value.filter((item) => item.entityStatus === entityStatus));
  }, []);

  if (!_records.length) {
    return <EmptyItems />;
  }
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {
        _records.map((item) => (
          <AnimeCard key={item.mal_id} data={item} user={user} />
        ))}
    </div>
  );
}

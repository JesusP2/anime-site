import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import { TrackedAnimeRecordsKey } from "@/lib/constants";
import type { User } from "better-auth";
import { useEffect, useState } from "react";

export function LocalSeasonGrid({
  records,
  user,
}: {
  records: AnimeCardItem[];
  user: User | null;
}) {
  const [_records, _setRecords] = useState(records);
  useEffect(() => {
    if (user) return;
    const value = JSON.parse(
      localStorage.getItem(TrackedAnimeRecordsKey) || "[]",
    ) as AnimeCardItem[];
    _setRecords(record => record.map(item => {
      const localStorageItem = value.find(i => i.mal_id === item.mal_id);
      const entityStatus = localStorageItem?.entityStatus;
      if (!entityStatus) return item;
      return { ...item, entityStatus };
    }));
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

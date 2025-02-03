import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import { TrackedAnimeRecordsKey } from "@/lib/constants";
import type { User } from "better-auth";
import { useEffect, useState } from "react";

export function AnimesCompletedGrid({
  _animeRecords,
  user,
}: {
  _animeRecords: AnimeCardItem[];
  user: User | null;
}) {
  const [animeRecords, setAnimeRecords] = useState(_animeRecords);
  useEffect(() => {
    if (user) return;
    const _animeRecords = JSON.parse(
      localStorage.getItem(TrackedAnimeRecordsKey) || "[]",
    );
    setAnimeRecords(_animeRecords.filter((item) => item.entityStatus === "completed"));
  }, []);
  if (!animeRecords.length) {
    return <EmptyItems />;
  }
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {
        animeRecords.map((item) => (
          <AnimeCard key={item.mal_id} data={item} user={user} />
        ))}
    </div>
  );
}

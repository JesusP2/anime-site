import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import type { User } from "better-auth";
import { useEffect, useState } from "react";

export function EntityWithStatusGrid({
  records,
  localStorageKey,
  entityStatus,
  user,
}: {
  records: AnimeCardItem[];
  localStorageKey: string;
  entityStatus: string;
  user: User | null;
}) {
  const [_records] = useLocalStorage({
    localStorageKey,
    defaultValue: records,
    entityStatus,
    user,
  });
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

function useLocalStorage<T extends { entityStatus: string }>({
  localStorageKey,
  defaultValue,
  entityStatus,
  user,
}: {
  localStorageKey: string;
  defaultValue: T[];
  entityStatus: string;
  user: User | null;
}) {
  const [value, setValue] = useState<T[]>(defaultValue);
  useEffect(() => {
    if (user) return;
    const value = JSON.parse(
      localStorage.getItem(localStorageKey) || "[]",
    ) as T[];
    setValue(value.filter((item) => item.entityStatus === entityStatus));
  }, []);
  return [value, setValue] as const;
}

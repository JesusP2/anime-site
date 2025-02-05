import type { User } from "better-auth";
import { useEffect, useState } from "react";

export function useLocalStorage<T extends { entityStatus: string }>({
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

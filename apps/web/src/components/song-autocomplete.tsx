import { startTransition, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { AutoComplete } from "./ui/autocomplete";

type Item = {
  value: string;
  label: string;
  key: string;
};

export function SongAutocomplete({
  ignoreThemes,
  onSelectedValueChange,
  disabled,
  value,
  debounce,
}: {
  ignoreThemes: {
    id: string;
    title: string;
    animeTitle: string;
  }[];
  onSelectedValueChange: (value: Item) => void;
  disabled?: boolean;
  value?: string;
  debounce?: number;
}) {
  const cache = useRef<{ [key: string]: Item[] }>({});
  const [items, setItems] = useState<Item[]>([]);
  const [selectedValue, _] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, debounce ?? 300);
  const [isLoading, setIsLoading] = useState(false);

  // when value changes, reset the search to the new value
  useEffect(() => {
    setSearch(value ?? "");
  }, [value]);

  useEffect(() => {
    const controller = new AbortController();
    startTransition(async () => {
      setIsLoading(true);
      if (!debouncedSearch) {
        setItems([]);
        setIsLoading(false);
        return;
      }
      if (cache.current[debouncedSearch]) {
        const filtered = cache.current[debouncedSearch].filter(
          (data) => !ignoreThemes.some((theme) => theme.id === data.key),
        );
        setItems(filtered);
        setIsLoading(false);
        return;
      }
      const res = await fetch(`/api/song?q=${debouncedSearch}`, {
        signal: controller.signal,
      });
      const data = (await res.json()) as {
        id: string;
        animeTitle: string;
        songName: string;
      }[];
      const filtered = data.filter(
        (data) => !ignoreThemes.some((theme) => theme.id === data.id),
      );
      cache.current[debouncedSearch] = filtered.map((d) => ({
        label: `${d.animeTitle} - ${d.songName}`,
        value: d.songName,
        key: d.id,
      }));
      setItems(cache.current[debouncedSearch]);
      setIsLoading(false);
    });
    return () => controller.abort("cancelling request");
  }, [debouncedSearch]);
  return (
    <AutoComplete
      items={items}
      disabled={disabled}
      searchValue={search}
      onSearchValueChange={setSearch}
      selectedValue={selectedValue}
      onSelectedValueChange={(value) => {
        const item = items.find((item) => item.key === value);
        if (!item) return;
        onSelectedValueChange(item);
        setItems([]);
      }}
      isLoading={isLoading}
    />
  );
}

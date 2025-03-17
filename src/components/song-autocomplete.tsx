import { startTransition, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { AutoComplete } from "./ui/autocomplete";

type Item = {
  value: string;
  label: string;
  key: string;
};

export function SongAutocomplete({
  songs,
  onSelectedValueChange,
}: {
  songs: {
    id: string;
    title: string;
    animeTitle: string;
  }[];
  onSelectedValueChange: (value: Item) => void;
}) {
  const cache = useRef<{ [key: string]: Item[] }>({});
  const [items, setItems] = useState<Item[]>([]);
  const [selectedValue, _] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isLoading, setIsLoading] = useState(false);
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
          (data) => !songs.some((song) => song.id === data.key),
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
        link: string;
        songName: string;
      }[];
      const filtered = data.filter(
        (data) => !songs.some((song) => song.id === data.id),
      );
      cache.current[debouncedSearch] = filtered.map((d) => ({
        label: `${d.animeTitle} - ${d.link.toLowerCase()}`,
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

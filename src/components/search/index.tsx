import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterModal } from "./modal";
import { Funnel } from "@phosphor-icons/react";
import { objectEntries } from "@/lib/utils";
import { navigate } from "astro:transitions/client";
import type { AnimeFilters } from "@/lib/anime/filters";
import type { MangaFilters } from "@/lib/manga/filters";

function setupFilters(options: AnimeFilters | MangaFilters, url: URL) {
  return objectEntries(options).reduce(
    (acc, [key, value]) => {
      if ("type" in value && key === "sfw") {
        acc[key] = url.searchParams.get(key)
          ? url.searchParams.get(key) === "true"
          : true;
        return acc;
      } else if ("type" in value) {
        acc[key] = url.searchParams.get(key) ?? value.options[0]?.value;
        return acc;
      }
      acc[key] = url.searchParams.getAll(key);
      return acc;
    },
    {} as {
      [K in keyof AnimeFilters | keyof MangaFilters]:
        | string[]
        | string
        | boolean;
    },
  );
}
export function SearchWithFilters({
  options,
  url,
  title,
  onSearch,
}: {
  options: AnimeFilters | MangaFilters;
  url: URL;
  title: string;
  onSearch: (filters: URLSearchParams) => void;
}) {
  const [searchParams, setSearchParams] = useState(url.searchParams);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState(setupFilters(options, url));

  const getActiveFiltersCount = () => {
    return objectEntries(filters).reduce((acc, [_, value]) => {
      if (!Array.isArray(value)) {
        return acc + 1;
      } else if (value.length > 0) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  function onClose() {
    setIsFilterModalOpen(false);
    const searchParams = new URLSearchParams();
    objectEntries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key as string, v));
      } else {
        searchParams.append(key as string, value.toString());
      }
    });
    setSearchParams(searchParams);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="flex flex-col space-y-1.5">
        <div className="flex space-x-2">
          <Input
            id="search-query"
            type="text"
            placeholder="Enter your search query..."
            className="flex-grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterModalOpen(true)}
            className="whitespace-nowrap"
          >
            <Funnel className="w-4 h-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
          <Button onClick={() => onSearch(searchParams)}>Search</Button>
        </div>
      </div>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={onClose}
        filters={filters}
        options={options}
        setFilters={setFilters}
      />
    </div>
  );
}

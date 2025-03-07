import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterModal } from "./modal";
import { Funnel } from "@phosphor-icons/react";
import { objectEntries } from "@/lib/utils";
import { animeFilters, type AnimeFilters } from "@/lib/anime/filters";
import { mangaFilters, type MangaFilters } from "@/lib/manga/filters";

function setupFilters(options: AnimeFilters | MangaFilters, url: URL) {
  const filters = {
    q: url.searchParams.get("q") ?? "",
  };
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
    filters as {
      [K in keyof AnimeFilters | keyof MangaFilters]:
        | string[]
        | string
        | boolean;
    } & { q: string },
  );
}
export function SearchWithFilters({
  entity,
  url,
  title,
  onSearch,
}: {
  entity: "Anime" | "Manga" | "Both";
  url: string;
  title: string;
  onSearch: (filters: URLSearchParams) => void;
}) {
  const [filters, setFilters] = useState(
    setupFilters(entity === "Manga" ? mangaFilters : animeFilters, new URL(url)),
  );
  const [searchType, setSearchType] = useState<"Anime" | "Manga">(
    entity === "Manga" ? "Manga" : "Anime",
  );
  const options = searchType === "Manga" ? mangaFilters : animeFilters;

  useEffect(() => {
    setFilters(setupFilters(options, new URL(url)));
  }, [searchType]);

  const getActiveFiltersCount = () => {
    return objectEntries(filters).reduce((acc, [key, value]) => {
      if (key === "sort" || key === "q") {
        return acc;
      }
      if (key === "orderBy") {
        if (value === "none") {
          return acc;
        }
        return acc + 2;
      } else if (!Array.isArray(value)) {
        return acc + 1;
      } else if (value.length > 0) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };
  function _onSearch() {
    const searchParams = new URLSearchParams();
    objectEntries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key as string, v));
      } else {
        searchParams.append(key as string, value.toString());
      }
    });
    searchParams.set("searchType", searchType);
    onSearch(searchParams);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex flex-col space-y-1.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            _onSearch();
          }}
        >
          <div className="flex space-x-2">
            <Input
              id="search-query"
              type="text"
              placeholder="Enter your search query..."
              className="flex-grow"
              defaultValue={filters.q}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, q: e.target.value }))
              }
            />
            <Button
              variant="outline"
              type="button"
              className="min-w-[4.5rem]"
              onClick={() => {
                const newType = searchType === "Anime" ? "Manga" : "Anime";
                setSearchType(newType);
              }}
            >
              {searchType}
            </Button>
            <FilterModal
              filters={filters}
              options={options}
              setFilters={setFilters}
            >
              <Button
                type="button"
                variant="outline"
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
            </FilterModal>
            <Button>Search</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

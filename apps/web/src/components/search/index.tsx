import { useEffect, useRef, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { FilterModal } from "./modal";
import { cn, objectEntries } from "@/lib/utils";
import { animeFilters, type AnimeFilters } from "@/lib/anime/filters";
import { mangaFilters, type MangaFilters } from "@/lib/manga/filters";
import { safeStartViewTransition } from "@/lib/safe-start-view-transition";
import { navigate } from "astro:transitions/client";
import type { Entity, EntityStatus, IconRef } from "@/lib/types";
import { animeEntity, mangaEntity } from "@/lib/constants";
import { SettingsIcon } from "../ui/settings";
import { useDebounce } from "@/hooks/use-debounce";
import { prefetch } from "astro:prefetch";

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

type Props = {
  url: string;
} & (
    | {
      page: "Search";
      searchType: Entity;
    }
    | {
      page: "mal_id";
    }
    | {
      page: Entity;
      entityStatus: EntityStatus;
    }
  );

export function SearchWithFilters(props: Props) {
  const buttonRef = useRef<IconRef>(null);
  const [filters, setFilters] = useState(
    setupFilters(
      "searchType" in props
        ? props.searchType === mangaEntity
          ? mangaFilters
          : animeFilters
        : animeFilters,
      new URL(props.url),
    ),
  );
  const [searchType, setSearchType] = useState<Entity>(
    "searchType" in props
      ? props.searchType === mangaEntity
        ? mangaEntity
        : animeEntity
      : animeEntity,
  );
  const debouncedSearch = useDebounce(filters.q, 100);
  const options = searchType === mangaEntity ? mangaFilters : animeFilters;
  // const workerRef = useRef<Worker | null>(null);
  // const debouncedSearch = useDebounce(filters.q, 200)
  //
  // useEffect(() => {
  //   // Initialize the worker
  //   workerRef.current = new Worker("/embedding_worker.js", { type: "module" });
  //
  //   // Add event listener for messages from the worker
  //   workerRef.current.onmessage = (event) => {
  //     console.log("Message from worker:", event.data);
  //   };
  //
  //   // Cleanup worker on component unmount
  //   return () => {
  //     workerRef.current?.terminate();
  //   };
  // }, []);
  //
  // useEffect(() => {
  //   if (workerRef.current) {
  //     workerRef.current.postMessage({ q: debouncedSearch[0] });
  //   }
  // }, [debouncedSearch]);

  useEffect(() => {
    setFilters(setupFilters(options, new URL(props.url)));
  }, [searchType]);

  const getActiveFiltersCount = () => {
    return objectEntries(filters).reduce((acc, [key, value]) => {
      if (key === "sort" || key === "q" || key === "sfw") {
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
  function createSearchLink(_filters = filters) {
    const searchParams = new URLSearchParams();
    objectEntries(_filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key as string, v));
      } else {
        searchParams.append(key as string, value.toString());
      }
    });

    searchParams.set("page", "1");
    if (props.page === "Search" || props.page === "mal_id") {
      if (searchType !== "Anime") {
        searchParams.set("searchType", searchType);
      }
      const path = searchParams.toString()
        ? `/search?${searchParams.toString()}`
        : "/search";
      return path;
    }
    const path = `/${props.page.toLowerCase()}/${props.entityStatus}?${searchParams.toString()}`;
    return path;
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const link = createSearchLink();
    safeStartViewTransition(async () => navigate(link));
  }

  useEffect(() => {
    if (debouncedSearch) {
      const link = createSearchLink();
      prefetch(link)
    }
  }, [debouncedSearch]);

  return (
    <form onSubmit={onSearch} className="max-4-xl w-full">
      <div className="flex space-x-2 max-w-4xl w-full">
        <Input
          id="search-query"
          type="search"
          name="q"
          placeholder="Enter your search query..."
          className="max-w-4xl w-full"
          value={filters.q}
          onChange={(e) => {
            const newQuery = e.target.value;
            setFilters((prev) => ({ ...prev, q: newQuery }));
          }}
        />
        <FilterModal
          filters={filters}
          options={options}
          setFilters={setFilters}
          searchType={searchType}
          setSearchType={setSearchType}
          createSearchLink={createSearchLink}
        >
          <Button
            type="button"
            variant="outline"
            className="whitespace-nowrap"
            onMouseEnter={() => buttonRef.current?.startAnimation?.()}
            onMouseLeave={() => buttonRef.current?.stopAnimation?.()}
          >
            <SettingsIcon className="size-4 p-0" ref={buttonRef} />
            <span className="hidden sm:inline">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
        </FilterModal>
        <a
          href={createSearchLink()}
          className={cn(buttonVariants(), "hidden sm:block")}
          data-astro-prefetch="hover"
        >
          Search
        </a>
      </div>
    </form>
  );
}

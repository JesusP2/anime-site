"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilterModal } from "./modal";
import { Funnel } from "@phosphor-icons/react";
import { objectEntries } from "@/lib/utils";
import { navigate } from "astro:transitions/client";
import type { AnimeFilters } from "@/lib/utils/anime/filters";
import type { MangaFilters } from "@/lib/utils/manga/filters";

export function SearchWithFilters({
  options,
  baseUrl
}: {
  options: AnimeFilters | MangaFilters;
  baseUrl: string;
}) {
  const [searchParams, setSearchParams] = useState(new URLSearchParams());
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState(
    objectEntries(options).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: "radio" in value ? value.options[0]?.value : [],
      }),
      {},
    ) as {
      [K in keyof T]: string[] | string | boolean;
    },
  );

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
      <h1 className="text-2xl font-bold mb-6">Product Search</h1>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="search-query">Search Query</Label>
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
          <Button onClick={() => navigate(`${baseUrl}?${searchParams.toString()}`)}>Search</Button>
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

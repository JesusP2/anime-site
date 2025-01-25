"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilterModal } from "./modal";
import { Funnel } from "@phosphor-icons/react";
import type { SearchFilter } from "@/lib/types";
import { objectEntries } from "@/lib/utils";

export function SearchWithFilters<T extends Record<string, SearchFilter>>({
  options,
}: {
  options: T;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState(
    objectEntries(options).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.type === "radio" ? value.options[0]?.value : [],
      }),
      {},
    ) as {
      [K in keyof T]: T[K]["type"] extends "radio"
        ? string | boolean
        : T[K]["options"][number]["value"][];
    },
  );

  const handleSearch = (e: any) => {
    e.preventDefault();
    console.log("Search Query:", searchQuery);
    console.log("Filters:", filters);
    // Implement your search logic here
  };

  const getActiveFiltersCount = () => {
    return objectEntries(filters).reduce((acc, [key, value]) => {
      if (!Array.isArray(value)) {
        return acc + 1;
      } else if (value.length > 0) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Product Search</h1>
      <form onSubmit={handleSearch} className="space-y-4">
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
            <Button type="submit">Search</Button>
          </div>
        </div>
      </form>
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        options={options}
        setFilters={setFilters}
      />
    </div>
  );
}

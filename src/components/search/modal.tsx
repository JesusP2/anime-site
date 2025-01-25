import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { SearchFilter } from "@/lib/types";
import { MultiSelect } from "./multi-select";

export function FilterModal<T extends Record<string, SearchFilter>>({
  isOpen,
  onClose,
  filters,
  setFilters,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: T;
  setFilters: Dispatch<SetStateAction<T>>;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Options</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <MultiSelect
            options={categories}
            placeholder="Select categories"
            value={filters.categories}
            onChange={(value) =>
              setTempFilters({ ...tempFilters, categories: value })
            }
            label="Categories"
          />
          <MultiSelect
            options={priceRanges}
            placeholder="Select price ranges"
            value={tempFilters.priceRanges}
            onChange={(value) =>
              setTempFilters({ ...tempFilters, priceRanges: value })
            }
            label="Price Ranges"
          />
          <MultiSelect
            options={ratings}
            placeholder="Select ratings"
            value={tempFilters.ratings}
            onChange={(value) =>
              setTempFilters({ ...tempFilters, ratings: value })
            }
            label="Ratings"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

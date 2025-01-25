import { type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import type { SearchFilter } from "@/lib/types";
import { MultiSelect } from "./multi-select";
import { objectEntries } from "@/lib/utils";

export function FilterModal<T extends Record<string, SearchFilter>>({
  isOpen,
  onClose,
  options,
  filters,
  setFilters,
}: {
  isOpen: boolean;
  onClose: () => void;
  options: T;
  filters: { [K in keyof T]: T[K]["options"][number]['value'][] };
  setFilters: Dispatch<SetStateAction<{ [K in keyof T]: T[K]["options"][number]['value'][] }>>;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Options</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {objectEntries(options).map(([key, { options, label }]) => (
            <MultiSelect
              key={label}
              options={options}
              placeholder={`Select ${label}`}
              value={filters[key]}
              onChange={(value) =>
                setFilters(prev => ({ ...prev, [key]: value }))
              }
              label={label}
            />
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => console.log(filters)}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

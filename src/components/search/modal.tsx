import { type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "./multi-select";
import { objectEntries } from "@/lib/utils";
import type { MangaFilters } from "@/lib/utils/manga/filters";
import type { AnimeFilters } from "@/lib/utils/anime/filters";

export function FilterModal({
  isOpen,
  onClose,
  options,
  filters,
  setFilters,
}: {
  isOpen: boolean;
  onClose: () => void;
  options: AnimeFilters | MangaFilters;
  filters: {
    [K in keyof AnimeFilters | keyof MangaFilters]: string[] | string | boolean;
  };
  setFilters: Dispatch<
    SetStateAction<{
      [K in keyof AnimeFilters | keyof MangaFilters]: string[] | string | boolean;
    }>
  >;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Options</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {objectEntries(options).map(([key, value]) => {
            if ('type' in value && value.type === "radio" && !Array.isArray(filters[key])) {
              return (
                <RadioGroupFilters
                  key={value.label}
                  options={value.options}
                  value={filters[key]}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, [key]: value }))
                  }
                  label={value.label}
                />
              );
            } else if (Array.isArray(filters[key])) {
              return (
                <MultiSelect
                  key={value.label}
                  options={value.options}
                  placeholder={`Select ${value.label}`}
                  value={filters[key]}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, [key]: value }))
                  }
                  label={value.label}
                />
              );
            }
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioGroupFilters({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: AnimeFilters[keyof AnimeFilters]['options'] | MangaFilters[keyof MangaFilters]['options'];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  return (
    <RadioGroup value={value as string} onValueChange={onChange}>
      <Label className="text-black">{label}</Label>
      {options.map((option) => (
        <div key={option.value as string} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value as string} id={option.value.toString()} />
          <Label htmlFor={option.value.toString()} className="text-neutral-800">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

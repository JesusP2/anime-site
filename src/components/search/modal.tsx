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
  filters: {
    [K in keyof T]: string[] | string | boolean;
  };
  setFilters: Dispatch<
    SetStateAction<{
      [K in keyof T]: string[] | string | boolean;
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
          {objectEntries(options).map(([key, { type, options, label }]) => {
            if (type === "radio") {
              return (
                <RadioGroupFilters
                  key={label}
                  options={options}
                  value={filters[key] as string | boolean}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, [key]: value }))
                  }
                  label={label}
                />
              );
            } else {
              return (
                <MultiSelect
                  key={label}
                  options={options}
                  placeholder={`Select ${label}`}
                  value={filters[key] as any}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, [key]: value }))
                  }
                  label={label}
                />
              );
            }
          })}
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

function RadioGroupFilters({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  return (
    <RadioGroup value={value as string} onValueChange={onChange}>
      <Label className="text-black">{label}</Label>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value} id={option.value.toString()} />
          <Label htmlFor={option.value.toString()} className="text-neutral-800">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

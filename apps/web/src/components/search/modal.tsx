import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "./multi-select";
import { objectEntries } from "@/lib/utils";
import type { MangaFilters } from "@/lib/manga/filters";
import type { AnimeFilters } from "@/lib/anime/filters";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Separator } from "../ui/separator";
import { animeEntity, mangaEntity } from "@/lib/constants";
import type { Entity } from "@/lib/types";

type CommonProps = {
  options: AnimeFilters | MangaFilters;
  filters: {
    [K in keyof AnimeFilters | keyof MangaFilters]: string[] | string | boolean;
  } & { q: string };
  setFilters: Dispatch<
    SetStateAction<
      {
        [K in keyof AnimeFilters | keyof MangaFilters]:
          | string[]
          | string
          | boolean;
      } & { q: string }
    >
  >;
};
export function FilterModal({
  options,
  filters,
  children,
  setFilters,
  searchType,
  setSearchType,
  createSearchLink,
}: {
  children: ReactNode;
  searchType: Entity;
  setSearchType: (searchType: Entity) => void;
  createSearchLink: (
    filters?: {
      [K in keyof AnimeFilters | keyof MangaFilters]:
        | string[]
        | string
        | boolean;
    } & { q: string },
  ) => string;
} & CommonProps) {
  const [_filters, _setFilters] = useState(filters);

  function onClose() {
    setFilters(_filters);
    const link = createSearchLink(_filters);
    window.location.href = link;
  }

  const basicFilters = objectEntries(options).reduce((acc, [key, value]) => {
    if (value.group === "basic") {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
  const contentFilters = objectEntries(options).reduce((acc, [key, value]) => {
    if (value.group === "content") {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
  const displayFilters = objectEntries(options).reduce((acc, [key, value]) => {
    if (value.group === "display") {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  return (
    <Dialog
      onOpenChange={() => {
        _setFilters(filters);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-geist">Filter Options</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Basic Filters
              </h3>

              <Button
                variant="outline"
                type="button"
                className="min-w-[4.5rem]"
                onClick={() => {
                  const newType =
                    searchType === animeEntity ? mangaEntity : animeEntity;
                  setSearchType(newType);
                }}
              >
                {searchType}
              </Button>
              <div className="space-y-4">
                <RadioGroupFiltersSelector
                  options={basicFilters}
                  filters={_filters}
                  setFilters={_setFilters}
                />
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Content Filters
              </h3>
              <div className="space-y-4">
                <RadioGroupFiltersSelector
                  options={contentFilters}
                  filters={_filters}
                  setFilters={_setFilters}
                />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Display Options
              </h3>
              <div className="space-y-4">
                <RadioGroupFiltersSelector
                  options={displayFilters}
                  filters={_filters}
                  setFilters={_setFilters}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <DialogClose onClick={onClose} className={buttonVariants({})}>
            Apply Filters
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioGroupFiltersSelector({
  options,
  filters,
  setFilters,
}: CommonProps) {
  return objectEntries(options).map(([key, value]) => {
    if (
      "type" in value &&
      value.type === "radio" &&
      !Array.isArray(filters[key])
    ) {
      return (
        <div className="space-y-2" key={value.label}>
          <RadioGroupFilters
            options={value.options}
            value={filters[key]}
            name={key}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, [key]: value }))
            }
            label={value.label}
          />
        </div>
      );
    } else if (Array.isArray(filters[key])) {
      return (
        <div className="space-y-2" key={value.label}>
          <MultiSelect
            options={value.options}
            placeholder={`Select ${value.label}`}
            name={key}
            value={filters[key]}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, [key]: value }))
            }
            label={value.label}
          />
        </div>
      );
    }
  });
}

function RadioGroupFilters({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options:
    | AnimeFilters[keyof AnimeFilters]["options"]
    | MangaFilters[keyof MangaFilters]["options"];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  return (
    <RadioGroup name={name} value={value as string} onValueChange={onChange}>
      <Label className="text-foreground">{label}</Label>
      {options.map((option) => (
        <div
          key={option.value as string}
          className="flex items-center space-x-2"
        >
          <RadioGroupItem
            value={option.value as string}
            id={option.value.toString()}
          />
          <Label
            htmlFor={option.value.toString()}
            className="text-muted-foreground"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

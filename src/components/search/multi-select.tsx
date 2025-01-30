import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CaretUpDown, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { MangaFilters } from "@/lib/manga/filters";
import type { AnimeFilters } from "@/lib/anime/filters";

export function MultiSelect({
  options,
  placeholder,
  value,
  onChange,
  label,
}: {
  options: AnimeFilters[keyof AnimeFilters]["options"] | MangaFilters[keyof MangaFilters]["options"];
  placeholder: string;
  value:  (string | boolean)[];
  onChange: (value: (string | boolean)[]) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={label} className="max-w-min">{label}</Label>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            id={label}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length > 0 ? `${value.length} selected` : placeholder}
            <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value.toString()}
                    onSelect={() => {
                      onChange(
                        value.includes(option.value)
                          ? value.filter((item) => item !== option.value)
                          : [...value, option.value],
                      );
                      setOpen(true);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

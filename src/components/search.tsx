import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchFilter } from "@/lib/types";

export function SearchWithFilters({
  filters,
}: {
  filters: Record<string, SearchFilter>;
}) {
  return (
    <div className="w-full max-w-4xl p-4">
      <form>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Input
              name="q"
              type="text"
              placeholder="Search..."
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, { label, options }]) => (
              <Select name={key} key={key}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem
                      key={option.value.toString()}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            <Button type="submit">Apply filters</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

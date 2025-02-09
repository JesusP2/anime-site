import {
  Pagination as BasePagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  url,
  lastVisiblePage,
}: {
  currentPage: number;
  url: URL;
  lastVisiblePage: number;
}) {
  const tabs: (string | number)[] = Array(lastVisiblePage)
    .fill(0)
    .map((_, idx) => idx + 1);
  if (lastVisiblePage - currentPage > 3) {
    tabs.splice(
      currentPage + 2,
      lastVisiblePage - currentPage - 3 < 0
        ? 0
        : lastVisiblePage - currentPage - 3,
      "...",
    );
  }
  if (currentPage > 2) {
    tabs.splice(1, currentPage - 3 < 0 ? 0 : currentPage - 3, "...");
  }
  return (
    <BasePagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            isActive={currentPage > 1}
            href={createLink(url, currentPage - 1, lastVisiblePage)}
          />
        </PaginationItem>
        {tabs.map((tab, idx) => (
          <PaginationItem key={tab + idx.toString()}>
            {tab === '...' ? (
              <Select onValueChange={(value) => window.location.href = createLink(url, value, lastVisiblePage)}>
                <SelectPrimitive.Trigger
                  className={cn(buttonVariants({ variant: 'ghost' }), 'w-9 p-0')}
                >
                  ...
                </SelectPrimitive.Trigger>
                <SelectContent>
                  {Array.from(
                    { length: lastVisiblePage },
                    (_, i) => i + 1
                  ).filter(num => {
                    const prevTabValue = tabs[idx - 1];
                    const nextTabValue = tabs[idx + 1];
                    if (idx < currentPage && typeof prevTabValue === 'number' && typeof nextTabValue === 'number') {
                      return num > prevTabValue && num < nextTabValue;
                    } else if (typeof prevTabValue === 'number' && typeof nextTabValue === 'number') {
                      return num > prevTabValue && num < nextTabValue;
                    }
                  }).map((pageNum) => (
                    <SelectItem key={pageNum} value={pageNum.toString()}>
                      {pageNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <PaginationLink
                href={createLink(url, tab, lastVisiblePage)}
                isActive={tab === currentPage}
              >
                {tab}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            isActive={currentPage < lastVisiblePage}
            href={createLink(url, currentPage + 1, lastVisiblePage)}
          />
        </PaginationItem>
      </PaginationContent>
    </BasePagination>
  );
}

function createLink(url: URL, page: number | string, lastVisiblePage: number) {
  if (Number(page) < 1) {
    page = 1;
  } else if (Number(page) > lastVisiblePage) {
    page = lastVisiblePage === 0 ? 1 : lastVisiblePage;
  }
  const newUrl = new URL(url);
  newUrl.searchParams.set("page", page.toString());
  return newUrl.toString();
}

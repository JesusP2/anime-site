import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function MainPagination({
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
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious isActive={currentPage > 1} href={createLink(url, currentPage - 1)} />
        </PaginationItem>
        {tabs.map((tab, idx) => (
          <PaginationItem key={tab + idx.toString()}>
            <PaginationLink
              href={createLink(url, tab)}
              isActive={tab === currentPage}
            >
              {tab}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext isActive={currentPage < lastVisiblePage} href={createLink(url, currentPage + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function createLink(url: URL, page: number | string) {
  url.searchParams.set("page", page.toString());
  return url.toString();
}

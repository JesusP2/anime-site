import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const page = 2;
export function MainPagination({ currentPage, url, lastVisiblePage }: { currentPage: number; url: string; lastVisiblePage: number }) {
  console.log('before tabs:', lastVisiblePage, currentPage)
  const tabs: (string | number)[] = Array(lastVisiblePage).fill(0).map((_, idx) => idx + 1);
  console.log('tabs:', tabs)
  if (lastVisiblePage - currentPage > 3) {
    tabs.splice(currentPage + 2, lastVisiblePage - currentPage - 3 < 0 ? 0 : lastVisiblePage - currentPage - 3, '...');
  }
  if (currentPage > 2) {
    tabs.splice(1, currentPage - 3 < 0 ? 0 : currentPage - 3, '...');
  }
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={`${url}?page=${page - 1}`} />
        </PaginationItem>
        {tabs.map((tab, idx) => (
          <PaginationItem key={tab + idx.toString()}>
            <PaginationLink href={`${url}?page=${tab}`} isActive={tab === currentPage}>
              {tab}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href={`${url}?page=${page + 1}`} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}


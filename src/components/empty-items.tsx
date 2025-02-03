import { MagnifyingGlass } from "@phosphor-icons/react";

export function EmptyItems() {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center mx-auto">
      <MagnifyingGlass className="w-12 h-12 mb-3 text-muted-foreground" />
      <h2 className="text-lg font-semibold mb-1">No items found</h2>
      <p className="text-sm text-muted-foreground mb-3 max-w-[200px]">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}

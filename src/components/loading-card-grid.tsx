import { Skeleton } from "./ui/skeleton";

function MangaCardSkeleton() {
  return (

    <div className="cursor-pointer w-full">
      <div
        className="h-48 w-[27rem] shadow-2xl overflow-hidden mx-auto rounded-xl"
      >
        <article className="p-[0.5rem] flex gap-x-[1rem]">
          <section className="h-[11rem] w-[12rem] overflow-hidden rounded-xl relative">
            <Skeleton className="h-[11rem] w-[12rem] rounded-xl" />
          </section>
          <div className="w-[13rem]">
            {/* Title placeholder */}
            <Skeleton className="h-6 w-3/4" />

            {/* Status badge placeholders */}
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-5 w-20" />
            </div>

            {/* Description placeholder */}
            <div className="space-y-2 mt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export function LoadingCardGrid() {
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {Array(6).fill(0).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

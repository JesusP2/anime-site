import { Badge } from "@/components/ui/badge";
import { Star } from "@phosphor-icons/react";
import { MangaTypeBadge } from "@/components/manga-card/type-badge";
import { AiringStatus } from "@/components/manga-card/airing-status";
import type { MangaCardItem } from "@/lib/types";
import { getRecordTitle } from "@/lib/anime-title";

export function MangaCard({ data, idx }: { data: MangaCardItem; idx: number }) {
  const mangaTitle = getRecordTitle(data.titles);

  return (
    <a
      href={`/anime/${data.mal_id}`}
      className="cursor-pointer h-fit overflow-hidden mx-auto border rounded-xl bg-background relative z-[100]"
      style={{ viewTransitionName: `anime-card-${data.mal_id}` }}
    >
      <article className="p-[0.5rem] h-[12rem] w-fit flex gap-x-[1rem]">
        <section
          className="h-[11rem] w-[12rem] overflow-hidden rounded-xl relative"
          style={{
            viewTransitionName: `anime-card-img-${data.mal_id}`,
          }}
        >
          <img
            loading="lazy"
            className="duration-200 group-hover:scale-110 object-cover h-[11rem] w-[12rem] rounded-xl"
            src={data.images?.webp?.image_url || ""}
            alt={mangaTitle}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute top-2 left-2">
            {data.type && <MangaTypeBadge type={data.type} />}
          </div>
        </section>
        <div className="w-[13.5rem] h-[11rem]">
          <section>
            <h3
              style={{
                viewTransitionName: `anime-card-title-${data.mal_id}`,
              }}
              title={mangaTitle}
              className="text-lg truncate font-bold dark:text-white leading-tight"
            >
              {mangaTitle}
            </h3>
          </section>
          <section className="flex gap-x-2 my-2">
            <Badge className="w-26 truncate dark:bg-gray-800 dark:text-gray-100">
              {data.chapters
                ? `${data.chapters} ${data.chapters > 1 ? 'chapters' : 'chapter'}`
                : 'N/A'}
            </Badge>
            <Badge className="w-26 truncate dark:bg-gray-800 dark:text-gray-100">
              {data.volumes
                ? `${data.volumes} ${data.volumes > 1 ? 'volumes' : 'volume'}`
                : "N/A"}
            </Badge>
          </section>
          <section className="flex gap-x-6 [&_p]:leading-4 my-3 dark:text-gray-100">
            <div>
              <div className="flex gap-x-2 items-center">
                <Star weight="bold" className="dark:text-yellow-400" />
                <p>{data.score ?? "N/A"}</p>
              </div>
              {data.scored_by ? (
                <p className="text-sm text-stone-600 dark:text-gray-400">
                  {data.scored_by} users
                </p>
              ) : (
                <p className="text-sm text-stone-600 dark:text-gray-400">
                  N/A
                </p>
              )}
            </div>
            <div>
              <div className="flex gap-x-2 items-center">
                {data.rank ? <p>#{data.rank}</p> : <p>N/A</p>}
              </div>
              <p className="text-sm text-stone-600 dark:text-gray-400">
                Ranking
              </p>
            </div>
          </section>
          <section className="flex gap-x-2">
            {data.genres?.slice(0, 1).map((genre) => (
              <Badge
                key={genre.mal_id}
                variant="outline"
                className="dark:border-gray-700 dark:text-gray-100"
              >
                <p className="text-ellipsis truncate max-w-24">
                  {genre.name}
                </p>
              </Badge>
            ))}
            {data.genres?.length && data.genres?.length > 1 && (
              <Badge
                variant="outline"
                className="dark:border-gray-700 dark:text-gray-100"
              >
                <p className="text-ellipsis truncate max-w-24">
                  + {data.genres?.length - 1}
                </p>
              </Badge>
            )}
          </section>
          <section className="my-2 flex items-center justify-between">
            <AiringStatus manga={data} />
          </section>
        </div>
      </article>
    </a>
  );
}

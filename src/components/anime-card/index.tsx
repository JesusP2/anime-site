import { MagicCard } from "@/components/ui/magic-card";
import { Badge } from "@/components/ui/badge";
import { Star } from "@phosphor-icons/react";
import { AnimeTypeBadge } from "@/components/anime-card/type-badge";
import { AiringStatus } from "@/components/anime-card/airing-status";
import type { AnimeCardItem } from "@/lib/types";

export function AnimeCard({ data, idx }: { data: AnimeCardItem; idx: number }) {
  const animeTitle =
    data.titles?.find((title) => title.type === "English")?.title ||
    data.titles?.find((title) => title.type === "Default")?.title;

  return (
    <a
      href={`/anime/${data.mal_id}`}
      className="cursor-pointer w-full"
      style={{ viewTransitionName: `anime-card-${data.mal_id}` }}
    >
      <MagicCard
        className="h-48 w-[27rem] shadow-2xl overflow-hidden mx-auto"
        gradientColor={"#A9A9A955"}
      >
        <article className="p-[0.5rem] flex gap-x-[1rem]">
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
              alt={animeTitle}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute top-2 left-2">
              {data.type && <AnimeTypeBadge type={data.type} />}
            </div>
            <div className="absolute bottom-2 left-2">
              <p className="text-white border-l pl-2 leading-4">
                {data.rating?.split(" ").at(0)}
              </p>
            </div>
          </section>
          <div className="w-[13rem]">
            <section>
              <h3
                style={{
                  viewTransitionName: `anime-card-title-${data.mal_id}`,
                }}
                title={animeTitle}
                className="text-lg truncate font-bold dark:text-white"
              >
                {animeTitle}
              </h3>
            </section>
            <section className="flex gap-x-2 my-2">
              <Badge className="w-26 truncate dark:bg-gray-800 dark:text-gray-100">
                {data.season
                  ? `${data.season} - ${data.year}`
                  : `${data.aired?.prop?.from?.year}`}
              </Badge>
              <Badge className="w-26 truncate dark:bg-gray-800 dark:text-gray-100">
                {data.episodes ? `${data.episodes} episodes` : "N/A"}
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
              <AiringStatus anime={data} />
            </section>
          </div>
        </article>
      </MagicCard>
    </a>
  );
}

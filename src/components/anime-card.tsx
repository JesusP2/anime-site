import { MagicCard } from "@/components/ui/magic-card";
import { Badge } from "@/components/ui/badge";
import { Star } from "@phosphor-icons/react";
import { AnimeTypeBadge } from "@/components/anime-type-badge";
import { AiringStatus } from "./airing-status";
import type { FullAnimeRecord } from "@/lib/types";
import type { User } from "better-auth";

export type AnimeCardItem = Pick<
  FullAnimeRecord,
  | "titles"
  | "images"
  | "type"
  | "rating"
  | "season"
  | "year"
  | "aired"
  | "episodes"
  | "score"
  | "scored_by"
  | "rank"
  | "genres"
  | "mal_id"
  | "status"
> & { entityStatus: string };
export function AnimeCard({
  data,
}: {
  data: AnimeCardItem;
}) {
  const animeTitle =
    data.titles?.find((title) => title.type === "English")?.title ||
    data.titles?.find((title) => title.type === "Default")?.title;
  return (
    <a href={`/anime/${data.mal_id}`} className="cursor-pointer">
      <MagicCard
        className="h-48 w-[27rem] shadow-2xl overflow-hidden mx-auto"
        gradientColor={"#D9D9D955"}
      >
        <article className="p-[0.5rem] flex gap-x-[1rem]">
          <section className="h-[11rem] w-[12rem] overflow-hidden rounded-xl relative">
            <img
              loading="lazy"
              className="duration-200 group-hover:scale-110 object-cover"
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
              <h3 title={animeTitle} className="text-lg truncate font-bold">
                {animeTitle}
              </h3>
            </section>
            <section className="flex gap-x-2 my-2">
              <Badge className="w-26 truncate">
                {data.season
                  ? `${data.season} - ${data.year}`
                  : `${data.aired?.prop?.from?.year}`}
              </Badge>
              <Badge className="w-26 truncate">
                {data.episodes ? `${data.episodes} episodes` : "N/A"}
              </Badge>
            </section>
            <section className="flex gap-x-6 [&_p]:leading-4 my-3">
              <div>
                <div className="flex gap-x-2 items-center">
                  <Star weight="bold" />
                  <p>{data.score}</p>
                </div>
                <p className="text-sm text-stone-600">{data.scored_by} users</p>
              </div>
              <div>
                <div className="flex gap-x-2 items-center">
                  {data.rank ? <p>#{data.rank}</p> : <p>N/A</p>}
                </div>
                <p className="text-sm text-stone-600">Ranking</p>
              </div>
            </section>
            <section className="flex gap-x-2">
              {data.genres?.slice(0, 2).map((genre) => (
                <Badge key={genre.mal_id} variant="outline">
                  <p className="text-ellipsis truncate max-w-24">{genre.name}</p>
                </Badge>
              ))}
              {data.genres?.length && data.genres?.length > 2 && (
                <Badge variant="outline">
                  <p className="text-ellipsis truncate max-w-24">
                    + {data.genres?.length - 2}
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

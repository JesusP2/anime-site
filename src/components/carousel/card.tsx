import type { components } from "@/lib/api/jikan.openapi";
import { AnimeTypeBadge } from "@/components/anime-type-badge";
import { Badge } from "@/components/ui/badge";
import { Star } from "@phosphor-icons/react";
import { AiringStatus } from "../airing-status";

export function CarouselCard({
  anime,
  width,
}: {
  anime: components["schemas"]["anime_full"];
  width: number;
}) {
  const animeTitle =
    anime.titles?.find((title) => title.type === "English")?.title ||
    anime.titles?.find((title) => title.type === "Default")?.title;
  return (
    <article className="group">
      <section className="h-[15rem] overflow-hidden rounded-md relative text-black">
        <img
          loading="lazy"
          width={width}
          className="duration-200 group-hover:scale-125 object-cover"
          style={{ width }}
          src={anime.images?.webp?.large_image_url || ""}
          alt={animeTitle}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute top-2 left-2">
          {anime.type && <AnimeTypeBadge type={anime.type} />}
        </div>
        <h3
          title={animeTitle}
          className="text-md font-bold absolute bottom-2 left-2 text-white"
        >
          {animeTitle}
        </h3>
      </section>
    </article>
  );
}

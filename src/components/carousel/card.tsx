import type { components } from "@/lib/api/jikan.openapi";
import { AnimeTypeBadge } from "@/components/anime-type-badge";
import { Badge } from "@/components/ui/badge";
import { Star } from '@phosphor-icons/react'
import { AiringStatus } from "../airing-status";

export function CarouselCard({ anime }: { anime: components['schemas']['anime_full'] }) {
  const animeTitle = anime.titles?.find(title => title.type === 'English')?.title || anime.titles?.find(title => title.type === 'Default')?.title
  return (
    <article className="flex gap-x-4 max-w-[15rem] group">
      <section className="h-[15rem] overflow-hidden rounded-md relative">
        <img
          loading="lazy"
          className="duration-200 group-hover:scale-110 object-cover"
          src={anime.images?.webp?.image_url || ''}
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

import { Badge } from "@/components/ui/badge";
import { Star } from "@phosphor-icons/react";
import { AnimeTypeBadge } from "@/components/anime-card/type-badge";
import { AiringStatus } from "@/components/anime-card/airing-status";
import type { AnimeCardItem } from "@/lib/types";
import { getRecordTitle } from "@/lib/anime-title";

export function AnimeCard({ data, idx }: { data: AnimeCardItem; idx: number }) {
  const animeTitle = getRecordTitle(data.titles);

  return (
    <a
      href={`/anime/${data.mal_id}`}
      className="mx-auto"
      style={{ viewTransitionName: `anime-card-${data.mal_id}` }}
    >
      <article className="w-[200px] h-[350px]">
        <section
          style={{
            viewTransitionName: `anime-card-img-${data.mal_id}`,
          }}
        >
          <img
            loading="lazy"
            className="duration-200 group-hover:scale-105 object-cover h-[300px] w-[200px]"
            src={data.images?.webp?.large_image_url || ""}
            alt={animeTitle}
          />
        </section>
        <section className="p-2">
          <p className="truncate">
            {animeTitle}
          </p>
        </section>
      </article>
    </a>
  );
}

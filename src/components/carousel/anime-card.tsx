import { AnimeTypeBadge } from "@/components/anime-card/type-badge";
import type { FullAnimeRecord } from "@/lib/types";

export function CarouselAnimeCard({
  carouselId,
  record,
  width,
}: {
  carouselId?: string;
  record: Pick<FullAnimeRecord, "mal_id" | "titles" | "images" | "type">;
  width: number;
}) {
  const animeTitle =
    record.titles?.find((title) => title.type === "English")?.title ||
    record.titles?.find((title) => title.type === "Default")?.title;
  return (
    <a href={`/anime/${record.mal_id}`}>
      <article className="group">
        <section
          className="h-[15rem] overflow-hidden rounded-md relative text-black"
          style={{
            viewTransitionName: `anime-card-img-${record.mal_id}-${carouselId}`,
          }}
        >
          <img
            loading="lazy"
            className="duration-200 group-hover:scale-125 object-cover"
            style={{
              width,
            }}
            width={width}
            src={record.images?.webp?.large_image_url || ""}
            alt={animeTitle}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute top-2 left-2">
            {record.type && <AnimeTypeBadge type={record.type} />}
          </div>
          <h3
            title={animeTitle}
            className="text-md font-bold absolute bottom-2 left-2 text-white"
          >
            {animeTitle}
          </h3>
        </section>
      </article>
    </a>
  );
}

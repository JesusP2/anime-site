import { MangaTypeBadge } from "@/components/manga-card/type-badge";
import type { FullMangaRecord } from "@/lib/types";

export function CarouselMangaCard({
  record,
  width,
}: {
  record: Pick<FullMangaRecord, "mal_id" | "titles" | "images" | "type">;
  width: number;
}) {
  const mangaTitle =
    record.titles?.find((title) => title.type === "English")?.title ||
    record.titles?.find((title) => title.type === "Default")?.title;
  return (
    <a href={`/manga/${record.mal_id}`}>
      <article className="group">
        <section className="h-[15rem] overflow-hidden rounded-md relative text-black">
          <img
            loading="lazy"
            width={width}
            className="duration-200 group-hover:scale-125 object-cover"
            style={{
              width,
              viewTransitionName: `manga-card-img-${record.mal_id}`
            }}
            src={record.images?.webp?.large_image_url || ""}
            alt={mangaTitle}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute top-2 left-2">
            {record.type && <MangaTypeBadge type={record.type} />}
          </div>
          <h3
            title={mangaTitle}
            className="text-md font-bold absolute bottom-2 left-2 text-white"
          >
            {mangaTitle}
          </h3>
        </section>
      </article>
    </a>
  );
}

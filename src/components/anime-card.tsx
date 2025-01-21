import { MagicCard } from "@/components/ui/magic-card";
import type { components } from "@/lib/api/jikan.openapi";
import { idxToMonth } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, FilmStrip, TelevisionSimple, Calendar, Clock } from '@phosphor-icons/react'
import { AnimeTypeBadge } from "@/components/anime-type-badge";

export function AnimeCard({ anime }: { anime: components['schemas']['anime_full'] }) {
  const animeTitle = anime.titles?.find(title => title.type === 'English')?.title || anime.titles?.find(title => title.type === 'Default')?.title
  return (
    <MagicCard
      className="cursor-pointer h-48 w-[27rem] shadow-2xl overflow-hidden"
      gradientColor={"#D9D9D955"}
    >
      <article className="p-2 flex gap-x-4">
        <section className="h-[11rem] w-48 overflow-hidden rounded-xl relative">
          <img
            loading="lazy"
            className="duration-200 group-hover:scale-110 object-cover"
            src={anime.images?.webp?.image_url || ''}
            alt={animeTitle}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute top-2 left-2">
            {anime.type && <AnimeTypeBadge type={anime.type} />}
          </div>
          <div className="absolute bottom-2 left-2">
            <p className="text-white border-l pl-2 leading-4">
              {anime.rating?.split(' ').at(0)}
            </p>
          </div>
        </section>
        <div className="w-[13rem]">
          <section>
            <h3
              title={animeTitle}
              className="text-xl truncate font-bold"
            >
              {animeTitle}
            </h3>
          </section>
          <section className="flex gap-x-2 my-2">
            <Badge className="w-26 truncate">
              {anime.season ? `${anime.season} - ${anime.year}` : `${anime.aired?.prop?.from?.year}`}
            </Badge>
            <Badge className="w-26 truncate">
              {anime.episodes} episodes
            </Badge>
          </section>
          <section className="flex gap-x-6 [&_p]:leading-4 my-3">
            <div>
              <div className="flex gap-x-2 items-center">
                <Star weight="bold" />
                <p>{anime.score}</p>
              </div>
              <p className="text-sm text-stone-600">{anime.scored_by} users</p>
            </div>
              <div>
                <div className="flex gap-x-2 items-center">
                  {anime.rank ? <p>#{anime.rank}</p> : <p>N/A</p>}
              </div>
                <p className="text-sm text-stone-600">Ranking</p>
              </div>
          </section>
          <section className="flex gap-x-2">
            {anime.genres?.slice(0, 2).map(genre => (<Badge key={genre.mal_id} variant="outline"><p className="text-ellipsis truncate max-w-24">{genre.name}</p></Badge>))}
            {anime.genres?.length && anime.genres?.length > 2 && <Badge variant="outline"><p className="text-ellipsis truncate max-w-24">+ {anime.genres?.length - 2}</p></Badge>}
          </section>
          <section className="my-2">
            <AiringStatus anime={anime} />
          </section>
        </div>
      </article>
    </MagicCard>
  );
}

function AiringStatus({ anime }: { anime: components['schemas']['anime_full'] }) {
  const getStatusStyle = () => {
    switch (anime.status?.toLowerCase()) {
      case 'currently airing':
        return 'border-green-600 text-green-600'
      case 'finished airing':
        return 'border-stone-400 text-stone-600'
      case 'not yet aired':
        return 'border-blue-600 text-blue-600'
      default:
        return 'border-stone-400 text-stone-600';
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className={`border px-2 py-1 inline-block rounded-md text-sm ${statusStyle}`}>
      {anime.status}
    </div>
  );
}

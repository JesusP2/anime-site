import type { AnimeCardItem } from "@/components/anime-card";
import type { FullAnimeRecord } from "../types";

export function transformFullAnimeToAnimeCard(
  fullAnime: FullAnimeRecord,
  entityStatus: string,
) {
  return {
    entityStatus,
    titles: fullAnime.titles,
    images: fullAnime.images,
    type: fullAnime.type,
    rating: fullAnime.rating,
    season: fullAnime.season,
    year: fullAnime.year,
    aired: fullAnime.aired,
    episodes: fullAnime.episodes,
    score: fullAnime.score,
    scored_by: fullAnime.scored_by,
    rank: fullAnime.rank,
    genres: fullAnime.genres,
    mal_id: fullAnime.mal_id,
    status: fullAnime.status,
    popularity: fullAnime.popularity,
  };
}

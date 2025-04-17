import type { components } from "./api/jikan.openapi";
import type { entityStatuses, animeEntity, mangaEntity } from "./constants";

export type FullAnimeRecord = components["schemas"]["anime_full"] & {
  episodes_info: components["schemas"]["anime_episodes"]["data"];
  staff: components["schemas"]["anime_staff"]["data"];
  characters: components["schemas"]["anime_characters"]["data"];
  streaming: components["schemas"]["external_links"]["data"];
} & { mal_id: number | null };

export type FullMangaRecord = components["schemas"]["manga_full"] & {
  mal_id: number | null;
};

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
  | "popularity"
  | "favorites"
>;

export type MangaCardItem = Pick<
  FullMangaRecord,
  | "titles"
  | "images"
  | "chapters"
  | "volumes"
  | "type"
  | "score"
  | "scored_by"
  | "rank"
  | "genres"
  | "mal_id"
  | "status"
  | "popularity"
  | "favorites"
>;

export type EntityStatus = (typeof entityStatuses)[number];

export type GameState = "waiting" | "solo" | "multiplayer" | "results";
export type GameType = "solo" | "multiplayer";

export type Song = {
  id: string;
  name: string;
  url: string;
  animeName: string;
};

export type Entity = typeof animeEntity | typeof mangaEntity;

export interface IconRef {
  startAnimation: () => void;
  stopAnimation: () => void;
}

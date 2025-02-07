import type { components } from "./api/jikan.openapi";

export type FullAnimeRecord = components["schemas"]["anime_full"] & {
  episodes_info: components["schemas"]["anime_episodes"]["data"];
  staff: components["schemas"]["anime_staff"]["data"];
  characters: components["schemas"]["anime_characters"]["data"];
  streaming: components["schemas"]["external_links"]["data"];
};

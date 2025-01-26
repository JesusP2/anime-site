import type { InferSelectModel } from "drizzle-orm";
import type { animeTable, characterTable, mangaTable } from "./db/schemas";
import type { animeFilters } from "./utils/anime/filters";

export type FullAnimeRecord = InferSelectModel<typeof animeTable>;
export type FullMangaRecord = InferSelectModel<typeof mangaTable>;
export type FullCharacterRecord = InferSelectModel<typeof characterTable>;

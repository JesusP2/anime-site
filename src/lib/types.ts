import type { InferSelectModel } from "drizzle-orm";
import type { animeTable, characterTable, mangaTable } from "./db/schemas";

export type FullAnimeRecord = InferSelectModel<typeof animeTable>;
export type FullMangaRecord = InferSelectModel<typeof mangaTable>;
export type FullCharacterRecord = InferSelectModel<typeof characterTable>;

export type SearchFilter = {
  label: string;
  options: { label: string; value: string }[];
};

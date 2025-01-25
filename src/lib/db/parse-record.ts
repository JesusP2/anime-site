import type { InferSelectModel } from "drizzle-orm";
import type { animeTable, characterTable, mangaTable } from "./schemas";

export type AnimeRecord = InferSelectModel<typeof animeTable>;
export type MangaRecord = InferSelectModel<typeof mangaTable>;
export type CharacterRecord = InferSelectModel<typeof characterTable>;

type Record = { type: "anime"; record: AnimeRecord } | { type: "manga"; record: MangaRecord } | { type: "character"; record: CharacterRecord };

const stringifiedAnimeKeys = [
  "images",
  "trailer",
  "titles",
  "aired",
  "broadcast",
  "producers",
  "licensors",
  "studios",
  "genres",
  "explicit_genres",
  "themes",
  "demographics",
  "relations",
  "theme",
  "external",
  "streaming",
];
export function parseRecord({ type, record }: Record) {
  if (type === "anime") {
    for (const stringifyKey of stringifiedAnimeKeys) {
      record[stringifyKey] = JSON.parse(record[stringifyKey] || "{}");
    }
  }
  return record;
}

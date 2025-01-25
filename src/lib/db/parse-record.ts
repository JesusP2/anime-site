import type { FullAnimeRecord, FullCharacterRecord, FullMangaRecord } from "../types";
import { stringifiedAnimeKeys } from "../utils/anime/filters";

type Record = { type: "anime"; record: FullAnimeRecord } | { type: "manga"; record: FullMangaRecord } | { type: "character"; record: FullCharacterRecord };

export function parseRecord({ type, record }: Record) {
  if (type === "anime") {
    for (const stringifyKey of stringifiedAnimeKeys) {
      record[stringifyKey] = JSON.parse(record[stringifyKey] || "{}");
    }
  }
  return record;
}

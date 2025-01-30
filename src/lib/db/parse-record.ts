import type { components } from "../api/jikan.openapi";
import type {
  FullAnimeRecord,
  FullCharacterRecord,
  FullMangaRecord,
} from "../types";
import { stringifiedAnimeKeys } from "@/lib/anime/stringified-keys";

type Record =
  | { type: "anime"; record: FullAnimeRecord }
  | { type: "manga"; record: FullMangaRecord }
  | { type: "character"; record: FullCharacterRecord };

export function parseRecord({
  type,
  record,
}: {
  type: "anime";
  record: FullAnimeRecord;
}): Partial<components["schemas"]["anime_full"]>;
export function parseRecord({
  type,
  record,
}: {
  type: "manga";
  record: FullMangaRecord;
}): Partial<components["schemas"]["manga_full"]>;
export function parseRecord({
  type,
  record,
}: {
  type: "character";
  record: FullCharacterRecord;
}): Partial<components["schemas"]["character_full"]>;
export function parseRecord({ type, record }: Record) {
  const parsedRecord = { ...record } as any;
  if (type === "anime") {
    for (const key of stringifiedAnimeKeys) {
      if (!(key in record)) continue;
      const value = record[key as keyof FullAnimeRecord];
      const parsedValue = JSON.parse(value?.toString() || "{}");
      parsedRecord[key] = parsedValue;
    }
    return parsedRecord;
  }
  return parsedRecord;
}

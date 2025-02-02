import { jikanClient } from "@/lib/api/jikan.client";
import { db } from "@/lib/db/pool";
import { animeTable, mangaTable } from "@/lib/db/schemas";

const START = 2494;
const END = 100_000;

const stringifyKeys = [
  "images",
  "titles",
  "title_synonyms",
  "published",
  "authors",
  "serializations",
  "genres",
  "explicit_genres",
  "themes",
  "demographics",
  "relations",
  "external",
];
// for (let i = START; i < END; i++) {
for (const i of [2658, 2875, 5088, 5353]) {
  const res = await jikanClient.GET("/manga/{id}/full", {
    params: {
      path: {
        id: i,
      },
    },
  });
  if (!res?.data?.data) continue;
  const manga = res?.data.data;
  try {
    for (const stringifyKey of stringifyKeys) {
      manga[stringifyKey] = JSON.stringify(manga[stringifyKey] || {});
    }
    await db.insert(mangaTable).values(manga);
  } catch (err) {
    console.log(i, err);
  }
  await new Promise((resolve) => setTimeout(resolve, 1_000));
}

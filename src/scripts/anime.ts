import { jikanClient } from "@/lib/api/jikan.client";
import { db } from "@/lib/db/pool";
import { animeTable } from "@/lib/db/schemas";

const START = 2;
const END = 100_000;

const stringifyKeys = [
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
for (let i = START; i < END; i++) {
  const res = await jikanClient.GET("/anime/{id}/full", {
    params: {
      path: {
        id: i,
      },
    },
  });
  if (!res?.data?.data) continue;
  const anime = res?.data.data;
  for (const stringifyKey of stringifyKeys) {
    anime[stringifyKey] = JSON.stringify(anime[stringifyKey] || {});
  }
  await db.insert(animeTable).values(anime);
  await new Promise((resolve) => setTimeout(resolve, 1_000));
}

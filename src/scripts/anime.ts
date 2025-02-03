import { jikanClient } from "@/lib/api/jikan.client";
import { db } from "@/lib/db/pool";
import { animeTable } from "@/lib/db/schemas";

const START = 5645;
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

const failed: number[] = [];
for (let mal_id = START; mal_id < END; mal_id++) {
  const animeRes = await jikanClient.GET("/anime/{id}/full", {
    params: {
      path: {
        id: mal_id,
      },
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  const staffRes = await jikanClient.GET("/anime/{id}/staff", {
    params: {
      path: {
        id: mal_id,
      },
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  const charactersRes = await jikanClient.GET("/anime/{id}/characters", {
    params: {
      path: {
        id: mal_id,
      },
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  const episodesRes = await jikanClient.GET("/anime/{id}/episodes", {
    params: {
      path: {
        id: mal_id,
      },
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  const streamingRes = await jikanClient.GET("/anime/{id}/streaming", {
    params: {
      path: {
        id: mal_id,
      },
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  if (
    !animeRes?.data?.data ||
    !staffRes?.data?.data ||
    !charactersRes?.data?.data ||
    !episodesRes?.data?.data ||
    !streamingRes?.data?.data
  ) {
    continue;
  }
  const anime = animeRes.data.data as any;
  const staff = staffRes.data.data;
  const characters = charactersRes.data.data;
  const episodes = episodesRes.data.data;
  const streaming = streamingRes.data.data;
  try {
    for (const stringifyKey of stringifyKeys) {
      anime[stringifyKey] = JSON.stringify(anime[stringifyKey] || {});
    }
    anime.staff = JSON.stringify(staff.slice(0, 6));
    anime.characters = JSON.stringify(characters.slice(0, 6));
    anime.episodes_info = JSON.stringify(episodes);
    anime.streaming = JSON.stringify(streaming);
    await db
      .insert(animeTable)
      .values(anime)
      .onConflictDoUpdate({
        target: animeTable.mal_id,
        set: {
          staff: anime.staff,
          episodes: anime.episodes,
          characters: anime.characters,
          episodes_info: anime.episodes_info,
          streaming: anime.streaming,
        },
      });
  } catch (err) {
    failed.push(mal_id);
    console.error(mal_id, err);
  }
  if (mal_id % 100 === 0) {
    console.log("mal_id:", mal_id, failed);
  }
}

import { jikanClient } from "@/lib/api/jikan.client";
import { getDb } from "@/lib/db/pool";
import { mangaTable } from "@/lib/db/schemas";
import { eq } from "drizzle-orm";

const START = Number(process.env.START);
const END = Number(process.env.END);
const failed = [];
const BATCH_SIZE = 1024;
const recordsNums = 72894;
const batches = Math.floor(recordsNums / BATCH_SIZE);
const db = getDb();

for (let i = batches; i <= batches; i++) {
  const start = i * BATCH_SIZE;
  const end = Math.min(BATCH_SIZE, recordsNums - start);
  const records = await db
    .select({
      mal_id: mangaTable.mal_id,
    })
    .from(mangaTable)
    .orderBy(mangaTable.mal_id)
    .offset(start)
    .limit(end);
  for (let record of records) {
    console.log(record.mal_id)
    const res = await jikanClient.GET("/manga/{id}/full", {
      params: {
        path: {
          id: record.mal_id,
        },
      },
    });
    if (!res?.data?.data) continue;
    console.log(res.data.data)
    const manga = res?.data.data;
    await db.update(mangaTable).set({
      genres: manga.genres,
      themes: manga.themes,
    }).where(eq(mangaTable.mal_id, record.mal_id));
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
}

// for (let i = START; i < END; i++) {
//   try {
//     const res = await jikanClient.GET("/manga/{id}/full", {
//       params: {
//         path: {
//           id: i,
//         },
//       },
//     });
//     if (!res?.data?.data) continue;
//     const manga = res?.data.data;
//     await db.insert(mangaTable).values(manga);
//   } catch (err) {
//     failed.push(i);
//     console.log(i, err);
//   }
//   await new Promise((resolve) => setTimeout(resolve, 1_000));
// }
// console.log(failed);

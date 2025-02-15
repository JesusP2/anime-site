import { jikanClient } from "@/lib/api/jikan.client";
import { db } from "@/lib/db/pool";
import { mangaTable } from "@/lib/db/schemas";

const START = Number(process.env.START);
const END = Number(process.env.END);
const failed = [];
for (let i = START; i < END; i++) {
  try {
    const res = await jikanClient.GET("/manga/{id}/full", {
      params: {
        path: {
          id: i,
        },
      },
    });
    if (!res?.data?.data) continue;
    const manga = res?.data.data;
    await db.insert(mangaTable).values(manga);
  } catch (err) {
    failed.push(i);
    console.log(i, err);
  }
  await new Promise((resolve) => setTimeout(resolve, 1_000));
}
console.log(failed)

import { getDb } from "@/lib/db/pool";
import type { APIRoute } from "astro";
import { z } from "astro:content";
import { sql } from "drizzle-orm";
const schema = z.string();

type Query = {
  id: string;
  titles: {
    title?: string;
    type?: string;
  }[];
  type: "OP" | "ED";
  number: number;
  name: string;
  text_searc: string;
  rank: number;
};

function parseResult(result: Query) {
  return {
    animeTitle:
      result.titles?.find((title) => title.type === "English")?.title ||
      result.titles?.find((title) => title.type === "Default")?.title ||
      "Title",
    songName: result.name,
    id: result.id,
  };
}
export const GET: APIRoute = async (ctx) => {
  const url = new URL(ctx.request.url);
  const q = schema.safeParse(url.searchParams.get("q"));
  if (!q.success) {
    return new Response(null, {
      status: 400,
    });
  }
  const db = getDb();
  const query = sql`SELECT anime_theme.id, anime.titles, anime_theme.type, anime_theme.title, ts_rank_cd(anime_theme.search_vector, q.query) AS rank
	FROM anime_theme
	CROSS JOIN (SELECT plainto_tsquery('english', ${q.data}) AS query) as q
	INNER JOIN anime ON anime_theme.anime_id = anime.id
	WHERE search_vector @@ q.query
	ORDER BY rank DESC
	LIMIT 10`;
  const result: Query[] = await db.execute(query);
  return new Response(JSON.stringify(result.map(parseResult)), {
    status: 200,
  });
};

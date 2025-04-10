import { getDb } from "@/lib/db/pool";
import { getConnectionString } from "@/lib/utils";
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
  type: "opening" | "ending";
  number: number;
  name: string;
  text_searc: string;
  rank: number;
};

function parseResult(result: Query) {
  let link = `${result.type} ${result.number}`;
  link = link[0]?.toUpperCase() + link.slice(1);
  return {
    animeTitle:
      result.titles?.find((title) => title.type === "English")?.title ||
      result.titles?.find((title) => title.type === "Default")?.title ||
      "Title",
    songName: result.name.split('"')[1] || "",
    link: link,
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
  const db = getDb(getConnectionString(ctx));
  const query = sql`SELECT theme.id, anime.titles, theme.type, theme.number, theme.name, ts_rank_cd(theme.search_vector, q.query) AS rank
	FROM theme
	CROSS JOIN (SELECT plainto_tsquery('english', ${q.data}) AS query) as q
	INNER JOIN anime ON theme.anime_id = anime.id
	WHERE search_vector @@ q.query
	ORDER BY rank DESC`;
  const result: Query[] = await db.execute(query);
  return new Response(JSON.stringify(result.map(parseResult)), {
    status: 200,
  });
};

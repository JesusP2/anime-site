import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";
import { float32Array } from "./f32_blob";
import type { components } from "@/lib/api/jikan.openapi";

export const animeTable = sqliteTable("anime", {
  id: text("id", {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  mal_id: integer("mal_id").unique().notNull(),
  url: text("url"),
  images: text("images", { mode: "json" }).notNull().$type<
    components["schemas"]["anime_images"]
  >(), //json
  trailer: text("trailer", { mode: "json" }).$type<
    components["schemas"]["trailer"]
  >(), //json
  approved: integer("approved", { mode: "boolean" }), //boolean
  titles: text("titles", { mode: "json" }).notNull().$type<
    components["schemas"]["title"][]
  >(), //json
  // convert anime_full type to drizzle-orm type
  type: text("type", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]['type']>(),
  source: text("source", {
    length: 255,
  }),
  episodes: integer("episodes"),
  episodes_info: text("episodes_info", { mode: "json" }).notNull().$type<
    components["schemas"]["anime_episodes"]["data"]
  >(), //json
  status: text("status", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]['status']>(),
  airing: integer("airing"), //boolean
  aired: text("aired", { mode: "json" }).notNull().$type<
    components["schemas"]["daterange"]
  >(), //json
  duration: text("duration", {
    length: 255,
  }),
  rating: text("rating", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]['rating']>(),
  score: integer("score"),
  scored_by: integer("scored_by"),
  rank: integer("rank"),
  popularity: integer("popularity"),
  members: integer("members"),
  favorites: integer("favorites"),
  synopsis: text("synopsis"),
  background: text("background"),
  season: text("season", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]['season']>(),
  year: integer("year"),
  broadcast: text("broadcast", { mode: "json" }).notNull().$type<
    components["schemas"]["broadcast"]
  >(), //json
  producers: text("producers", { mode: "json" }).notNull().$type<
    components["schemas"]["mal_url"][]
  >(), //json
  licensors: text("licensors", { mode: "json" }).notNull().$type<
    components["schemas"]["mal_url"][]
  >(), //json
  studios: text("studios", { mode: "json" }).notNull().$type<
    components["schemas"]["mal_url"][]
  >(), //json
  genres: text("genres", { mode: "json" }).notNull().$type<
    components["schemas"]["mal_url"][]
  >(), //json
  explicit_genres: text("explicit_genres", { mode: "json" }).notNull().$type<
    components["schemas"]["mal_url"][]
  >(), //json
  themes: text("themes", { mode: "json" }).notNull().$type<
    components["schemas"]["mal_url"][]
  >(), //json
  demographics: text("demographics", { mode: "json" }).notNull().$type<
    components["schemas"]["mal_url"][]
  >(), //json
  relations: text("relations", { mode: "json" }).notNull().$type<
    components["schemas"]["relation"][]
  >(), //json
  theme: text("theme", { mode: "json" }).notNull().$type<{
    openings: string[];
    endings: string[];
  }>(), //json
  external: text("external", { mode: "json" }).notNull().$type<{
    name?: string;
    url?: string;
  }>(), //json
  streaming: text("streaming", { mode: "json" }).notNull().$type<
    components["schemas"]["external_links"]["data"]
  >(), //json
  characters: text("characters", { mode: "json" }).notNull().$type<
    components["schemas"]["anime_characters"]["data"]
  >(), //json
  staff: text("staff", { mode: "json" }).notNull().$type<
    components["schemas"]["anime_staff"]["data"]
  >(), //json
  embedding: float32Array("embedding", { dimensions: 1536 }),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

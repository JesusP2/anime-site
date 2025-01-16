import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

export const animeTable = sqliteTable("anime", {
  id: text("id", {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  mal_id: integer("mal_id"),
  url: text("url"),
  images: text("images"), //json
  trailer: text("trailer"), //json
  approved: integer("approved"), //boolean
  titles: text("titles"), //json
  // convert anime_full type to drizzle-orm type
  type: text("type", {
    length: 255,
  }),
  source: text("source", {
    length: 255,
  }),
  episodes: integer("episodes"),
  status: text("status", {
    length: 255,
  }),
  airing: integer("airing"), //boolean
  aired: text("aired"), //json
  duration: text("duration", {
    length: 255,
  }),
  rating: text("rating", {
    length: 255,
  }),
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
  }),
  year: integer("year"),
  broadcast: text("broadcast"), //json
  producers: text("producers"), //json
  licensors: text("licensors"), //json
  studios: text("studios"), //json
  genres: text("genres"), //json
  explicit_genres: text("explicit_genres"), //json
  themes: text("themes"), //json
  demographics: text("demographics"), //json
  relations: text("relations"), //json
  theme: text("theme"), //json
  external: text("external"), //json
  streaming: text("streaming"), //json
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

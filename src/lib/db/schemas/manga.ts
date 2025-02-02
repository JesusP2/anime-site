import { ulid } from "ulidx";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const mangaTable = sqliteTable("manga", {
  id: text("id", {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  mal_id: integer("mal_id").unique(),
  url: text("url", {
    length: 255,
  }),
  images: text("images"), //json
  approved: integer("approved"), //boolean
  titles: text("titles"), //json
  title_synonyms: text("title_synonyms"), //json
  type: text("type", {
    length: 255,
  }),
  chapters: integer("chapters"),
  volumes: integer("volumes"),
  status: text("status", {
    length: 255,
  }),
  publishing: integer("publishing"), //boolean
  published: text("published"), //json
  score: integer("score"),
  scored_by: integer("scored_by"),
  rank: integer("rank"),
  popularity: integer("popularity"),
  members: integer("members"),
  favorites: integer("favorites"),
  synopsis: text("synopsis"),
  background: text("background"),
  authors: text("authors"), //json
  serializations: text("serializations"), //json
  genres: text("genres"), //json
  explicit_genres: text("explicit_genres"), //json
  themes: text("themes"), //json
  demographics: text("demographics"), //json
  relations: text("relations"), //json
  external: text("external"), //json
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

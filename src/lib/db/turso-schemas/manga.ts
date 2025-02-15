import { ulid } from "ulidx";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { float32Array } from "./f32_blob";

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
  images: text("images", { mode: 'json' }), //json
  approved: integer("approved", { mode: 'boolean' }), //boolean
  titles: text("titles", { mode: 'json' }), //json
  title_synonyms: text("title_synonyms", { mode: 'json' }), //json
  type: text("type", {
    length: 255,
  }),
  chapters: integer("chapters"),
  volumes: integer("volumes"),
  status: text("status", {
    length: 255,
  }),
  publishing: integer("publishing", { mode: 'boolean' }), //boolean
  published: text("published", { mode: 'json' }), //json
  score: integer("score"),
  scored_by: integer("scored_by"),
  rank: integer("rank"),
  popularity: integer("popularity"),
  members: integer("members"),
  favorites: integer("favorites"),
  synopsis: text("synopsis"),
  background: text("background"),
  authors: text("authors", { mode: 'json' }), //json
  serializations: text("serializations", { mode: 'json' }), //json
  genres: text("genres", { mode: 'json' }), //json
  explicit_genres: text("explicit_genres", { mode: 'json' }), //json
  themes: text("themes", { mode: 'json' }), //json
  demographics: text("demographics", { mode: 'json' }), //json
  relations: text("relations", { mode: 'json' }), //json
  external: text("external", { mode: 'json' }), //json
  embedding: float32Array("embedding", { dimensions: 1536 }),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

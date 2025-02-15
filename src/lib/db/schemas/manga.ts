import { ulid } from "ulidx";
import {
  integer,
  pgTable,
  varchar,
  json,
  boolean,
  vector,
  timestamp,
} from "drizzle-orm/pg-core";

export const mangaTable = pgTable("manga", {
  id: varchar("id", {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(ulid),
  mal_id: integer("mal_id").unique(),
  url: varchar("url", {
    length: 255,
  }),
  images: json("images"), //json
  approved: boolean("approved"), //boolean
  titles: varchar("titles"), //json
  title_synonyms: json("title_synonyms"), //json
  type: varchar("type", {
    length: 255,
  }),
  chapters: integer("chapters"),
  volumes: integer("volumes"),
  status: varchar("status", {
    length: 255,
  }),
  publishing: boolean("publishing"), //boolean
  published: boolean("published"), //json
  score: integer("score"),
  scored_by: integer("scored_by"),
  rank: integer("rank"),
  popularity: integer("popularity"),
  members: integer("members"),
  favorites: integer("favorites"),
  synopsis: varchar("synopsis"),
  background: varchar("background"),
  authors: json("authors"), //json
  serializations: json("serializations"), //json
  genres: varchar("genres"), //json
  explicit_genres: json("explicit_genres"), //json
  themes: varchar("themes"), //json
  demographics: json("demographics"), //json
  relations: json("relations"), //json
  external: json("external"), //json
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

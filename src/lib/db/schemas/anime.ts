import {
  index,
  integer,
  pgTable,
  varchar,
  json,
  boolean,
  vector,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { ulid } from "ulidx";
import type { components } from "@/lib/api/jikan.openapi";

export const animeTable = pgTable(
  "anime",
  {
    id: varchar("id", {
      length: 255,
    })
      .primaryKey()
      .$defaultFn(ulid),
    mal_id: integer("mal_id").unique().notNull(),
    url: varchar("url"),
    images: json("images")
      .notNull()
      .$type<components["schemas"]["anime_images"]>(), //json
    trailer: json("trailer").$type<components["schemas"]["trailer"]>(), //json
    approved: boolean("approved"), //boolean
    titles: json("titles").notNull().$type<components["schemas"]["title"][]>(), //json
    // convert anime_full type to drizzle-orm type
    type: varchar("type", {
      length: 255,
    }).$type<components["schemas"]["anime_full"]["type"]>(),
    source: varchar("source", {
      length: 255,
    }),
    episodes: integer("episodes"),
    episodes_info: json("episodes_info")
      .notNull()
      .$type<components["schemas"]["anime_episodes"]["data"]>(), //json
    status: varchar("status", {
      length: 255,
    }).$type<components["schemas"]["anime_full"]["status"]>(),
    airing: boolean("airing"), //boolean
    aired: json("aired").notNull().$type<components["schemas"]["daterange"]>(), //json
    duration: varchar("duration", {
      length: 255,
    }),
    rating: varchar("rating", {
      length: 255,
    }).$type<components["schemas"]["anime_full"]["rating"]>(),
    score: numeric("score"),
    scored_by: integer("scored_by"),
    rank: integer("rank"),
    popularity: integer("popularity"),
    members: integer("members"),
    favorites: integer("favorites"),
    synopsis: varchar("synopsis"),
    background: varchar("background"),
    season: varchar("season", {
      length: 255,
    }).$type<components["schemas"]["anime_full"]["season"]>(),
    year: integer("year"),
    broadcast: json("broadcast")
      .notNull()
      .$type<components["schemas"]["broadcast"]>(),
    producers: json("producers")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(), //json
    licensors: json("licensors")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(), //json
    studios: json("studios")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(), //json
    genres: json("genres")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(), //json
    explicit_genres: json("explicit_genres")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(), //json
    themes: json("themes")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(), //json
    demographics: json("demographics")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(), //json
    relations: json("relations")
      .notNull()
      .$type<components["schemas"]["relation"][]>(), //json
    theme: json("theme").notNull().$type<{
      openings: string[];
      endings: string[];
    }>(), //json
    external: json("external").notNull().$type<{
      name?: string;
      url?: string;
    }>(), //json
    streaming: json("streaming")
      .notNull()
      .$type<components["schemas"]["external_links"]["data"]>(), //json
    characters: json("characters")
      .notNull()
      .$type<components["schemas"]["anime_characters"]["data"]>(), //json
    staff: json("staff")
      .notNull()
      .$type<components["schemas"]["anime_staff"]["data"]>(), //json
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("animeEmbeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

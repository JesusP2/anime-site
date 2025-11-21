import {
  index,
  integer,
  pgTable,
  varchar,
  boolean,
  vector,
  timestamp,
  numeric,
  jsonb,
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
    images: jsonb("images")
      .notNull()
      .$type<components["schemas"]["anime_images"]>(),
    trailer: jsonb("trailer").$type<components["schemas"]["trailer"]>(),
    approved: boolean("approved"), //boolean
    titles: jsonb("titles").notNull().$type<components["schemas"]["title"][]>(),
    // convert anime_full type to drizzle-orm type
    type: varchar("type", {
      length: 255,
    }).$type<components["schemas"]["anime_full"]["type"]>(),
    source: varchar("source", {
      length: 255,
    }),
    episodes: integer("episodes"),
    episodes_info: jsonb("episodes_info")
      .notNull()
      .$type<components["schemas"]["anime_episodes"]["data"]>(),
    status: varchar("status", {
      length: 255,
    }).$type<components["schemas"]["anime_full"]["status"]>(),
    airing: boolean("airing"), //boolean
    aired: jsonb("aired").notNull().$type<components["schemas"]["daterange"]>(),
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
    broadcast: jsonb("broadcast")
      .notNull()
      .$type<components["schemas"]["broadcast"]>(),
    producers: jsonb("producers")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    licensors: jsonb("licensors")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    studios: jsonb("studios")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    genres: jsonb("genres")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    explicit_genres: jsonb("explicit_genres")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    themes: jsonb("themes")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    demographics: jsonb("demographics")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    relations: jsonb("relations")
      .notNull()
      .$type<components["schemas"]["relation"][]>(),
    theme: jsonb("theme").notNull().$type<{
      openings: string[];
      endings: string[];
    }>(),
    external: jsonb("external").notNull().$type<{
      name?: string;
      url?: string;
    }>(),
    streaming: jsonb("streaming")
      .notNull()
      .$type<components["schemas"]["external_links"]["data"]>(),
    characters: jsonb("characters")
      .notNull()
      .$type<components["schemas"]["anime_characters"]["data"]>(),
    staff: jsonb("staff")
      .notNull()
      .$type<components["schemas"]["anime_staff"]["data"]>(),
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("animeEmbeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    index("animeYearIndex").on(table.year),
    index("animeSeasonIndex").on(table.season),
    index("animeStatusIndex").on(table.status),
    index("animeTypeIndex").on(table.type),
    index("animeRatingIndex").on(table.rating),
    index("animeGenresIndex").on(table.genres),
    index("animeEpisodesByIndex").on(table.episodes),
    index("animeScoreByIndex").on(table.score),
    index("animeScoredByIndex").on(table.scored_by),
    index("animeRankIndex").on(table.rank),
    index("animePopularityIndex").on(table.popularity),
    index("animeFavoritesIndex").on(table.favorites),
  ],
);

import { ulid } from "ulidx";
import {
  integer,
  pgTable,
  varchar,
  boolean,
  vector,
  timestamp,
  index,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import type { components } from "@/lib/api/jikan.openapi";

export const mangaTable = pgTable(
  "manga",
  {
    id: varchar("id", {
      length: 255,
    })
      .primaryKey()
      .$defaultFn(ulid),
    mal_id: integer("mal_id").unique().notNull(),
    url: varchar("url", {
      length: 255,
    }),
    images: jsonb("images")
      .notNull()
      .$type<components["schemas"]["manga_images"]>(),
    approved: boolean("approved"), //boolean
    titles: jsonb("titles").notNull().$type<components["schemas"]["title"][]>(),
    title_synonyms: jsonb("title_synonyms"),
    type: varchar("type", {
      length: 255,
    }).$type<components["schemas"]["manga_full"]["type"]>(),
    chapters: integer("chapters"),
    volumes: integer("volumes"),
    status: varchar("status", {
      length: 255,
    }).$type<components["schemas"]["manga_full"]["status"]>(),
    publishing: boolean("publishing"), //boolean
    published: boolean("published").$type<components["schemas"]["daterange"]>(),
    score: numeric("score"),
    scored_by: integer("scored_by"),
    rank: integer("rank"),
    popularity: integer("popularity"),
    members: integer("members"),
    favorites: integer("favorites"),
    synopsis: varchar("synopsis"),
    background: varchar("background"),
    authors: jsonb("authors"),
    serializations:
      jsonb("serializations").$type<components["schemas"]["mal_url"][]>(),
    genres: jsonb("genres")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    explicit_genres:
      jsonb("explicit_genres").$type<components["schemas"]["mal_url"][]>(),
    themes: jsonb("themes")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    demographics: jsonb("demographics")
      .notNull()
      .$type<components["schemas"]["mal_url"][]>(),
    relations: jsonb("relations").$type<components["schemas"]["relation"][]>(),
    external:
      jsonb("external").$type<components["schemas"]["external_links"]>(),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("mangaEmbeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

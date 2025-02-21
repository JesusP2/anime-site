import { ulid } from "ulidx";
import {
  integer,
  pgTable,
  varchar,
  json,
  boolean,
  vector,
  timestamp,
  index,
  numeric,
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
    images: json("images")
      .notNull()
      .$type<components["schemas"]["manga_images"]>(), //json
    approved: boolean("approved"), //boolean
    titles: json("titles").notNull().$type<components["schemas"]["title"][]>(), //json
    title_synonyms: json("title_synonyms"), //json
    type: varchar("type", {
      length: 255,
    }).$type<components["schemas"]["manga_full"]["type"]>(),
    chapters: integer("chapters"),
    volumes: integer("volumes"),
    status: varchar("status", {
      length: 255,
    }).$type<components["schemas"]["manga_full"]["status"]>(),
    publishing: boolean("publishing"), //boolean
    published: boolean("published").$type<components["schemas"]["daterange"]>(), //json
    score: numeric("score"),
    scored_by: integer("scored_by"),
    rank: integer("rank"),
    popularity: integer("popularity"),
    members: integer("members"),
    favorites: integer("favorites"),
    synopsis: varchar("synopsis"),
    background: varchar("background"),
    authors: json("authors"), //json
    serializations: json("serializations").$type<components["schemas"]["mal_url"][]>(), //json
    // genres: json("genres").notNull().$type<components["schemas"]["mal_url"][]>(), //json
    genres: varchar("genres").$type<components["schemas"]["mal_url"][]>(), //json
    explicit_genres: json("explicit_genres").$type<components["schemas"]["mal_url"][]>(), //json
    themes: varchar("themes").$type<components["schemas"]["mal_url"][]>(), //json
    // themes: json("themes").$type<components["schemas"]["mal_url"][]>(), //json
    demographics: json("demographics").notNull().$type<components["schemas"]["mal_url"][]>(), //json
    relations: json("relations").$type<components["schemas"]["relation"][]>(), //json
    external: json("external").$type<components["schemas"]["external_links"]>(), //json
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

import type { AnimeCardItem } from "@/components/anime-card";
import { PGlite } from "@electric-sql/pglite";
import type { FullAnimeRecord } from "./types";
import { vector } from "@electric-sql/pglite/vector";
import {
  integer,
  pgTable,
  varchar,
  json,
  vector as vectorCol,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import type { components } from "./api/jikan.openapi";
import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";

export const pgliteAnimeTable = pgTable("anime", {
  mal_id: integer("mal_id").unique().notNull(),
  entityStatus: varchar("entity_status", {
    length: 255,
  }).notNull(),
  titles: json("titles").notNull().$type<components["schemas"]["title"][]>(), //json
  images: json("images")
    .notNull()
    .$type<components["schemas"]["anime_images"]>(), //json
  type: varchar("type", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]["type"]>(),
  rating: varchar("rating", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]["rating"]>(),
  season: varchar("season", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]["season"]>(),
  year: integer("year"),
  aired: json("aired").notNull().$type<components["schemas"]["daterange"]>(), //json
  episodes: integer("episodes"),
  score: numeric("score"),
  scored_by: integer("scored_by"),
  rank: integer("rank"),
  genres: json("genres").notNull().$type<components["schemas"]["mal_url"][]>(), //json
  status: varchar("status", {
    length: 255,
  }).$type<components["schemas"]["anime_full"]["status"]>(),
  popularity: integer("popularity"),
  embedding: vectorCol("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

declare global {
  interface Window {
    pgliteClient: PGlite;
    db: PgliteDatabase<{
      animeTable: typeof pgliteAnimeTable;
    }>;
  }
}

export async function getLocalDB() {
  if (window.db) {
    return {
      pgliteClient: window.pgliteClient,
      db: window.db,
    };
  }
  const client = new PGlite("idb://my-pgdata", {
    extensions: { vector },
  });
  const db = drizzle({ client, schema: { animeTable: pgliteAnimeTable } });
  window.pgliteClient = client;
  window.db = db;
  await createLocalDB(client);
  return {
    pgliteClient: client,
    db,
  };
}

export async function createLocalDB(client: PGlite) {
  // create anime table
  await client.exec(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE IF NOT EXISTS anime (
        mal_id INTEGER PRIMARY KEY,
        entity_status TEXT NOT NULL,
        titles JSONB,
        images JSONB,
        type TEXT,
        rating TEXT,
        season TEXT,
        year INTEGER,
        aired JSONB,
        episodes INTEGER,
        score FLOAT,
        scored_by INTEGER,
        rank INTEGER,
        genres JSONB,
        status TEXT,
        popularity INTEGER,
        embedding vector(1536),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

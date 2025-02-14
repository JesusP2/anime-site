import type { AnimeCardItem } from "@/components/anime-card";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";
import type { FullAnimeRecord } from "./types";

declare global {
  interface Window {
    db: PGlite;
  }
}

export async function getLocalDB() {
  if (window.db) {
    return window.db;
  }
  const db = new PGlite("idb://my-pgdata", {
    extensions: { vector },
  });
  window.db = db;
  await createLocalDB();
  return db;
}

export async function createLocalDB() {
  const db = window.db;
    await db.exec(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE IF NOT EXISTS anime (
        mal_id INTEGER PRIMARY KEY,
        entity_status TEXT,
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
        popularity INTEGER
      );
      CREATE TABLE IF NOT EXISTS anime_embedding (
        mal_id INTEGER PRIMARY KEY,
        embedding vector(1024),
        season TEXT,
        year INTEGER,
        
      );
      );
    `);
}
// CREATE TABLE IF NOT EXISTS anime_embedding (
//   mal_id INTEGER PRIMARY KEY,
//   embedding vector(1024),
//   season TEXT,
//   year INTEGER,
//   entity_status TEXT,
// )

export async function updateLocalDB(
  entityType: "ANIME" | "MANGA",
  data: AnimeCardItem | FullAnimeRecord,
  entityStatus: string,
) {
  const db = await getLocalDB();
  if (entityType === "ANIME") {
    await db.query(
      "INSERT INTO anime (mal_id, entity_status, titles, images, type, rating, season, year, aired, episodes, score, scored_by, rank, genres, status, popularity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) ON CONFLICT (mal_id) DO UPDATE SET entity_status= $2",
      [
        data.mal_id,
        entityStatus,
        data.titles,
        data.images,
        data.type,
        data.rating,
        data.season,
        data.year,
        data.aired,
        data.episodes,
        data.score,
        data.scored_by,
        data.rank,
        data.genres,
        data.status,
        data.popularity,
      ],
    );
  }
}

export async function deleteEntityFromLocalDB(
  entityType: "ANIME" | "MANGA",
  mal_id: number,
) {
  const db = await getLocalDB();
  if (entityType === "ANIME") {
    await db.query("DELETE FROM anime WHERE mal_id = $1", [mal_id]);
  }
}

export async function getEntityFromLocalDB(
  entityType: "ANIME" | "MANGA",
  mal_id: number,
) {
  const db = await getLocalDB();
  if (entityType === "ANIME") {
    const {
      rows: [record],
    } = await db.query<{ entity_status: string }>(
      "SELECT mal_id, entity_status FROM anime WHERE mal_id = $1",
      [mal_id],
    );
    return record;
  }
}

export async function getEntitiesFromLocalDB(
  entityType: "ANIME" | "MANGA",
  entityStatus: string,
) {
  const db = await getLocalDB();
  if (entityType === "ANIME") {
    const { rows: records } = await db.query<
      AnimeCardItem & { entity_status: string }
    >("SELECT * FROM anime WHERE entity_status = $1", [entityStatus]);
    return records.map((record) => {
      const { entity_status, ...rest } = record;
      return { ...rest, entityStatus: entity_status };
    });
  }
}

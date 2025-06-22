import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { animeTable } from "./anime";

export const animeThemesDump = pgTable("anime_themes_dump", {
  id: text("id").primaryKey(),
  mal_id: integer("mal_id").references(() => animeTable.mal_id),
  dump: jsonb("dump").notNull(),
});

// Theme table
export const animeThemeTable = pgTable("anime_theme", {
  id: text("id").primaryKey(),
  animeId: text("anime_id").references(() => animeTable.id, {
    onDelete: "cascade",
  }),
  animethemesId: integer("animethemes_id").unique().notNull(),
  sequence: integer("sequence"),
  slug: text("slug").notNull(),
  type: text("type"),
  title: text("title"),
  textSearch: text("text_search"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("animeThemeAnimeIdIndex").on(table.animeId),
  index("animeThemeTypeIndex").on(table.type),
  index("animeThemeAnimeIdTypeIndex").on(table.animeId, table.type),
]);

// Artist table
export const themeArtistTable = pgTable("theme_artist", {
  id: text("id").primaryKey(),
  animethemesId: integer("animethemes_id").unique().notNull(),
  name: text("name"),
  slug: text("slug"),
  information: text("information"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Join table for many-to-many relationship between songs and artists
export const songToArtistTable = pgTable("theme_song_to_artist", {
  id: text("id").primaryKey(),
  themeId: text("theme_id")
    .notNull()
    .references(() => animeThemeTable.id, { onDelete: "cascade" }),
  artistId: text("artist_id")
    .notNull()
    .references(() => themeArtistTable.id, { onDelete: "cascade" }),
});

// Theme entry table
export const themeEntryTable = pgTable("theme_entry", {
  id: text("id").primaryKey(),
  themeId: text("theme_id")
    .notNull()
    .references(() => animeThemeTable.id, { onDelete: "cascade" }),
  animethemesId: integer("animethemes_id").unique().notNull(),
  episodes: text("episodes"),
  sfw: boolean("sfw"),
  version: integer("version"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video table
export const themeVideoTable = pgTable("theme_video", {
  id: text("id").primaryKey(),
  themeEntryId: text("theme_entry_id")
    .notNull()
    .references(() => themeEntryTable.id, { onDelete: "cascade" }),
  animethemesId: integer("animethemes_id").unique().notNull(),
  basename: text("basename"),
  filename: text("filename"),
  lyrics: boolean("lyrics").default(false),
  nc: boolean("nc").default(false),
  path: text("path"),
  resolution: integer("resolution"),
  size: integer("size"),
  source: text("source"),
  subbed: boolean("subbed").default(false),
  uncen: boolean("uncen").default(false),
  tags: text("tags"),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audio table
export const themeAudioTable = pgTable("theme_audio", {
  id: text("id").primaryKey(),
  videoId: text("video_id")
    .notNull()
    .references(() => themeVideoTable.id, { onDelete: "cascade" }),
  animethemesId: integer("animethemes_id").unique().notNull(),
  basename: text("basename"),
  filename: text("filename"),
  path: text("path"),
  size: integer("size"),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

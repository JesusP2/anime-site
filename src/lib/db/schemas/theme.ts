import { pgTable } from "drizzle-orm/pg-core";
import { animeTable } from "./anime";

export const themeTable = pgTable("theme", (t) => ({
  id: t.text("id").primaryKey(),
  animeId: t
    .varchar("anime_id")
    .references(() => animeTable.id)
    .notNull(),
  type: t
    .varchar("type", {
      enum: ["opening", "ending"],
    })
    .notNull()
    .$type<"opening" | "ending">(),
  number: t.integer("number").notNull(),
  name: t.text("name").notNull(),
  url: t.jsonb("url").$type<string[]>().notNull(),
  text_search: t.text("text_search"),
  youtubeQuery: t.text("youtube_query").notNull(),
  createdAt: t.timestamp("created_at").defaultNow(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
}));

import { pgTable } from "drizzle-orm/pg-core";
import { animeThemeTable } from "./animethemes";

export const challengeTable = pgTable("challenge", (t) => ({
  id: t.text("id").primaryKey(),
  creatorId: t.text("creator_id"),
  title: t.text("title").notNull(),
  description: t.text("description"),
  difficulty: t.text("difficulty").notNull(),
  public: t.boolean("public").notNull(),
  createdAt: t.timestamp("created_at").defaultNow(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
}));

export const challengeToThemeTable = pgTable("challenge_to_theme", (t) => ({
  id: t.text("id").primaryKey(),
  challengeId: t
    .text("challenge_id")
    .notNull()
    .references(() => challengeTable.id, { onDelete: "cascade" }),
  themeId: t
    .text("theme_id")
    .notNull()
    .references(() => animeThemeTable.id, { onDelete: "cascade" }),
}));

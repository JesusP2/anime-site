import { pgTable } from "drizzle-orm/pg-core";
import { animeThemeTable } from "./animethemes";

export const quizTable = pgTable("quiz", (t) => ({
  id: t.text("id").primaryKey(),
  creatorId: t.text("creator_id"),
  title: t.text("title").notNull(),
  description: t.text("description"),
  difficulty: t.text("difficulty").notNull(),
  public: t.boolean("public").notNull(),
  createdAt: t.timestamp("created_at").defaultNow(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
}));

export const quizToThemeTable = pgTable("quiz_to_theme", (t) => ({
  id: t.text("id").primaryKey(),
  quizId: t
    .text("quiz_id")
    .notNull()
    .references(() => quizTable.id),
  themeId: t
    .text("theme_id")
    .notNull()
    .references(() => animeThemeTable.id),
}));

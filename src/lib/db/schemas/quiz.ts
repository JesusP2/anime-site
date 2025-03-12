import { pgTable } from "drizzle-orm/pg-core";
import { themeTable } from "./theme";

export const quizTable = pgTable("quiz", (t) => ({
  id: t.text("id").primaryKey(),
  title: t.text("title").notNull(),
  description: t.text("description"),
  difficulty: t.text("difficulty").notNull(),
  public: t.boolean("public").notNull(),
  createdAt: t.timestamp("created_at").defaultNow(),
  updatedAt: t.timestamp("updated_at").defaultNow(),
}));

export const quizToThemeTable = pgTable("quiz_to_theme", (t) => ({
  quizId: t
    .text("quiz_id")
    .notNull()
    .references(() => quizTable.id),
  themeId: t
    .text("theme_id")
    .notNull()
    .references(() => themeTable.id),
}));
